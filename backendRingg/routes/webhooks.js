import express from 'express';
import mongoose from 'mongoose';
import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import User from '../db/models/User.js';
import Webhook from '../db/models/Webhook.js';
import { extractRinggCallData } from '../services/ringg.js';
import { log } from '../services/logger.js';
import { safeString } from '../services/validators.js';

const router = express.Router();

/**
 * POST /api/webhooks/ringg
 * Webhook receiver for Ringg AI events
 */
router.post('/ringg', async (req, res) => {
  try {
    const payload = req.body || {};
    const { event, call_details } = payload;

    log.info('ringg_webhook_received', { event, callId: call_details?.id });

    // Store raw webhook payload for debugging
    await Webhook.create({
      type: safeString(event || 'ringg_event', 64, 'unknown'),
      payload: safeString(typeof req.body === 'string' ? req.body : JSON.stringify(req.body), 200000),
    });

    if (!call_details?.id) {
      return res.status(400).json({ error: 'Missing call_details.id' });
    }

    // Acknowledge receipt to Ringg AI
    res.status(200).json({ received: true });

    // Background process the webhook payload
    try {
      if (event === 'call_started') {
        await handleCallStarted(call_details);
      } else if (event === 'call_completed') {
        await handleCallEnded(call_details);
      } else {
        log.debug('ringg_webhook_unhandled_event', { event });
      }
    } catch (procErr) {
      log.error('ringg_webhook_processing_failed', { event, callId: call_details?.id, error: procErr.message });
    }

  } catch (error) {
    log.error('ringg_webhook_handler_error', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function handleCallStarted(callDetails) {
  const { id, agent_id } = callDetails;

  const agent = await Agent.findOne({ ringgId: agent_id }).lean();
  if (!agent) {
    log.warn('ringg_webhook_call_started_no_agent', { ringgId: agent_id });
    return;
  }

  const existing = await Call.findOne({ ringgCallId: id });
  if (existing) return;

  const extracted = extractRinggCallData(callDetails);
  const startedAt = extracted?.startedAt || new Date().toISOString();

  await Call.create({
    agentId: agent._id,
    userId: agent.userId,
    ringgCallId: id,
    callerNumber: extracted?.callerNumber ? safeString(extracted.callerNumber, 30) : null,
    status: 'in-progress',
    startedAt,
  });

  log.info('ringg_call_started_recorded', { callId: id, agentId: agent._id });
}

async function handleCallEnded(callDetails) {
  const { id } = callDetails;

  const extracted = extractRinggCallData(callDetails);
  if (!extracted) return;

  const existing = await Call.findOne({ ringgCallId: id });
  if (!existing) {
    // If start webhook was missed, find the agent and record the full call
    const agent = await Agent.findOne({ ringgId: callDetails.agent_id }).lean();
    if (!agent) {
      log.warn('ringg_webhook_call_ended_no_agent', { ringgId: callDetails.agent_id });
      return;
    }

    await Call.create({
      agentId: agent._id,
      userId: agent.userId,
      ringgCallId: id,
      callerNumber: extracted.callerNumber ? safeString(extracted.callerNumber, 30) : null,
      status: extracted.status || 'completed',
      duration: extracted.duration,
      recordingUrl: extracted.recordingUrl,
      transcript: extracted.transcript,
      startedAt: extracted.startedAt || new Date().toISOString(),
      endedAt: extracted.endedAt || new Date().toISOString(),
      endedReason: extracted.endedReason,
    });

    if (extracted.duration > 0) {
      await User.findByIdAndUpdate(agent.userId, {
        $inc: {
          minutesUsed: Math.ceil(extracted.duration / 60),
          callsUsed: 1
        }
      });
    }
    log.info('ringg_call_completed_created', { callId: id, agentId: agent._id });
    return;
  }

  // Update existing call details
  const updates = {
    status: extracted.status || 'completed',
    duration: extracted.duration,
    recordingUrl: extracted.recordingUrl,
    transcript: extracted.transcript,
    endedAt: extracted.endedAt || new Date().toISOString(),
    endedReason: extracted.endedReason,
  };

  if (extracted.callerNumber && (!existing.callerNumber || existing.callerNumber === 'Unknown')) {
    updates.callerNumber = safeString(extracted.callerNumber, 30);
  }

  await Call.updateOne({ _id: existing._id }, updates);

  if (extracted.duration > 0) {
    await User.findByIdAndUpdate(existing.userId, {
      $inc: {
        minutesUsed: Math.ceil(extracted.duration / 60)
      }
    });
  }

  log.info('ringg_call_completed_updated', { callId: id, agentId: existing.agentId });
}

router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ringg webhook endpoint is reachable',
    endpoint: 'POST /api/webhooks/ringg',
  });
});

export default router;
