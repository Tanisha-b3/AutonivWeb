import express from 'express';
import mongoose from 'mongoose';
import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import Appointment from '../db/models/Appointment.js';
import Webhook from '../db/models/Webhook.js';
import User from '../db/models/User.js';
import { verifyVapiSignature } from '../middleware/webhookSignature.js';
import { enforceTwilioSignature } from '../middleware/twilioSignature.js';
import { webhookLimiter } from '../middleware/rateLimiters.js';
import { extractVapiCallData, getVapiCall } from '../services/vapi.js';
import { containsAbuse, sanitizeText } from '../services/contentModeration.js';
import { log, securityEvent, IS_PROD } from '../services/logger.js';
import { safeString } from '../services/validators.js';
import { decrypt } from '../services/encryption.js';
import { signMediaStreamToken } from '../services/mediaStreamToken.js';

const router = express.Router();

router.post('/vapi', webhookLimiter, async (req, res) => {
  const { type, message, call: topCall, transcript: topTranscript, functionCall } = req.body || {};
  const eventType = type || message?.type;
  log.info('webhook_received', { eventType, ip: req.ip });
  const rawCall = topCall
    || (message?.call
      ? { ...message, ...message.call, endedReason: message.endedReason ?? message.call.endedReason }
      : message);
  const callData = rawCall || {};
  const transcriptData = topTranscript || message?.transcript;

  const typeMap = { 'end-of-call-report': 'call-ended' };
  const mappedType = typeMap[eventType] || eventType;

  if (eventType === 'tool-calls') {
    log.debug('webhook_tool_calls_raw', { body: req.body });
    try {
      const toolCalls = message?.toolCallList || message?.toolCalls || [];

      if (toolCalls.length === 0) {
        return res.json({ results: [] });
      }

      const results = [];
      const toolCallCall = message?.call || callData;

      for (const tc of toolCalls) {
        const name = tc?.function?.name;
        let args = {};
        try {
          args = tc?.function?.arguments
            ? (typeof tc.function.arguments === 'string'
              ? JSON.parse(tc.function.arguments)
              : tc.function.arguments)
            : {};
        } catch {
          log.warn('webhook_tool_calls_parse_failed', { name });
        }

        const result = await handleFunctionCall(toolCallCall, { name, parameters: args });
        results.push({ toolCallId: tc.id, result });
      }

      return res.json({ results });
    } catch (e) {
      log.error('webhook_tool_calls_error', { error: e.message });
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  if (mappedType === 'function-call') {
    try {
      const result = await handleFunctionCall(callData, functionCall);
      return res.json({ result });
    } catch (error) {
      log.error('webhook_function_call_error', { error: error.message });
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  res.status(200).json({ received: true });

  try {
    await Webhook.create({
      type: safeString(eventType, 64, 'unknown'),
      payload: safeString(typeof req.body === 'string' ? req.body : JSON.stringify(req.body), 200000),
    });

    if (eventType === 'status-update') {
      const callStatus = callData.status ?? callData.call?.status;
      if (callStatus === 'in-progress') {
        await handleCallStarted(callData);
      }
    } else if (mappedType === 'call-started') {
      await handleCallStarted(callData);
    } else if (mappedType === 'call-ended') {
      await handleCallEnded(callData);
    } else if (mappedType === 'transcript') {
      await handleTranscript(callData, transcriptData);
    } else {
      const ignored = ['speech-update', 'conversation-update'];
      if (eventType && !ignored.includes(eventType)) {
        log.debug('webhook_unhandled_type', { eventType });
      }
    }
  } catch (error) {
    log.error('webhook_processing_error', { eventType, error: error.message });
  }
});

async function handleCallStarted(call) {
  if (!call?.id) return;

  const existing = await Call.findOne({ vapiCallId: call.id });
  if (existing) return;

  const { callerNumber, startedAt } = extractVapiCallData(call) || {};

  const agent = await Agent.findOne({ vapiId: call.assistantId }).lean();

  await Call.create({
    _id: call.id,
    agentId: agent?._id || null,
    userId: agent?.userId || null,
    vapiCallId: call.id,
    callerNumber: callerNumber ? safeString(callerNumber, 30) : null,
    status: 'in-progress',
    startedAt: startedAt || new Date().toISOString(),
  });

  if (!agent) {
    log.warn('webhook_call_started_no_agent', { vapiId: call.assistantId, callId: call.id });
  }
}

async function handleCallEnded(call) {
  if (!call?.id) return;

  const extracted = extractVapiCallData(call);
  if (!extracted) return;
  let { duration, callerNumber, endedAt, recordingUrl, endedReason, status: vapiStatus } = extracted;

  const statusMap = {
    'customer-ended-call': 'completed',
    'assistant-ended-call': 'completed',
    'silence-timed-out': 'missed',
    'max-duration-exceeded': 'completed',
    'error': 'failed',
  };
  const status = statusMap[endedReason] || statusMap[vapiStatus] || 'completed';

  // If webhook didn't include recordingUrl, fetch from Vapi REST API
  if (!recordingUrl) {
    try {
      const fullCallData = await getVapiCall(call.id);
      const fullExtracted = extractVapiCallData(fullCallData);
      recordingUrl = fullExtracted?.recordingUrl || null;
      if (recordingUrl) {
        log.info('webhook_recording_url_fetched_from_api', { callId: call.id });
      }
    } catch (e) {
      log.warn('webhook_recording_url_api_fetch_failed', { callId: call.id, error: e.message });
    }
  }

  const existing = await Call.findOne({ vapiCallId: call.id });
  if (!existing) return;

  const updates = {
    status,
    duration,
    recordingUrl,
    endedAt: endedAt || new Date().toISOString(),
    endedReason,
  };
  if (callerNumber && (!existing.callerNumber || existing.callerNumber === 'Unknown')) {
    updates.callerNumber = safeString(callerNumber, 30);
  }

  await Call.updateOne({ _id: existing._id }, updates);

  // If recordingUrl is still null, schedule a delayed retry
  if (!recordingUrl) {
    setTimeout(async () => {
      try {
        const retryData = await getVapiCall(call.id);
        const retryExtracted = extractVapiCallData(retryData);
        if (retryExtracted?.recordingUrl) {
          await Call.updateOne(
            { vapiCallId: call.id },
            { recordingUrl: retryExtracted.recordingUrl }
          );
          log.info('webhook_recording_url_delayed_fetch_success', { callId: call.id });
        }
      } catch (e) {
        log.warn('webhook_recording_url_delayed_fetch_failed', { callId: call.id, error: e.message });
      }
    }, 30000);
  }

  if (duration > 0) {
    const billingMinutes = Math.ceil(duration / 60);
    const flip = await Call.findOneAndUpdate(
      { vapiCallId: call.id, billed: { $ne: true } },
      { $set: { billed: true } }
    );
    if (flip) {
      await User.findByIdAndUpdate(existing.userId, { $inc: { minutesUsed: billingMinutes } });
      log.info('webhook_call_billed', { callId: call.id, billingMinutes });
    } else {
      log.info('webhook_call_already_billed', { callId: call.id });
    }
  }
}

async function handleTranscript(call, transcript) {
  if (!call?.id || !transcript) return;

  const safeTranscript = typeof transcript === 'string'
    ? transcript.slice(0, 200000)
    : JSON.stringify(transcript).slice(0, 200000);

  await Call.updateOne(
    { vapiCallId: call.id },
    { transcript: safeTranscript },
  );
}

async function handleFunctionCall(call, functionCall) {
  if (!functionCall?.name) return { success: false, error: 'No function name' };

  if (functionCall.name === 'saveLead') {
    const agent = await Agent.findOne({ vapiId: call?.assistantId }).lean();
    if (!agent) return { success: false, error: 'Agent not found' };

    const existingCall = await Call.findOne({ vapiCallId: call.id }).lean();
    const existingLead = await Lead.findOne({
      agentId: agent._id,
      $or: [
        { callId: existingCall?._id },
        { phone: functionCall.parameters?.phone }
      ]
    }).lean();
    if (existingLead) {
      return { success: true, leadId: existingLead._id, message: 'Lead already saved' };
    }

    const { name, phone, email, purpose } = functionCall.parameters || {};

    const sanitizedName = name ? sanitizeText(safeString(name, 200)) : null;
    const sanitizedPurpose = purpose && !['unknown', 'Unknown'].includes(purpose) ? sanitizeText(safeString(purpose, 500)) : 'inquiry';
    const safePhone = phone ? safeString(phone, 30) : null;
    const safeEmail = email ? safeString(email, 254) : null;

    if ((name && containsAbuse(name)) || (purpose && containsAbuse(purpose))) {
      securityEvent('webhook_lead_blocked_abuse', { callId: call?.id });
      return { success: false, error: 'Content policy violation' };
    }

    const lead = await Lead.create({
      agentId: agent._id,
      callId: existingCall ? existingCall._id : null,
      userId: agent.userId,
      name: sanitizedName,
      phone: safePhone,
      email: safeEmail,
      purpose: sanitizedPurpose,
    });

    return { success: true, leadId: lead._id, name: sanitizedName, phone: safePhone };
  }

  if (functionCall.name === 'saveAppointment') {
    const agent = await Agent.findOne({ vapiId: call?.assistantId }).lean();
    if (!agent) return { success: false, error: 'Agent not found' };

    const existingCall = await Call.findOne({ vapiCallId: call.id }).lean();
    const existingAppt = await Appointment.findOne({ callId: existingCall?._id, agentId: agent._id }).lean();
    if (existingAppt) {
      return { success: true, bookingId: existingAppt._id, message: 'Booking already saved' };
    }

    const { name, phone, service, preferredDate, preferredTime } = functionCall.parameters || {};

    const sanitizedName = name ? sanitizeText(safeString(name, 200)) : null;
    const sanitizedService = service ? sanitizeText(safeString(service, 200)) : null;
    const safePhone = phone ? safeString(phone, 30) : null;
    const safeDate = preferredDate ? safeString(preferredDate, 30) : null;
    const safeTime = preferredTime ? safeString(preferredTime, 30) : null;

    if ((name && containsAbuse(name)) || (service && containsAbuse(service))) {
      securityEvent('webhook_booking_blocked_abuse', { callId: call?.id });
      return { success: false, error: 'Content policy violation' };
    }

    const appointment = await Appointment.create({
      agentId: agent._id,
      callId: existingCall ? existingCall._id : null,
      userId: agent.userId,
      name: sanitizedName,
      phone: safePhone,
      service: sanitizedService,
      preferredDate: safeDate,
      preferredTime: safeTime,
      status: 'pending',
    });

    return { success: true, bookingId: appointment._id, name: sanitizedName, service: sanitizedService };
  }

  return { success: false, error: 'Unknown function' };
}

router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Webhook endpoint is reachable',
    events: {
      'tool-calls': 'POST /api/webhooks/vapi',
      'function-call': 'POST /api/webhooks/vapi',
      'status-update': 'POST /api/webhooks/vapi',
      'end-of-call-report': 'POST /api/webhooks/vapi',
      'transcript': 'POST /api/webhooks/vapi',
    },
  });
});

router.post('/incoming-call', async (req, res) => {
  const to = req.body.To || '';
  const from = req.body.From || 'Unknown';
  const callSid = req.body.CallSid;

  log.info('twilio_incoming_call', { from, to, callSid });

  let agent = null;
  try {
    const allAgents = await Agent.find({ phoneNumber: { $ne: null } }).lean();

    if (to) {
      const cleanTo = to.replace(/\D/g, '');
      agent = allAgents.find(a => {
        const cleanAgentNum = a.phoneNumber.replace(/\D/g, '');
        return cleanAgentNum === cleanTo ||
          (cleanAgentNum.length >= 10 && cleanTo.endsWith(cleanAgentNum.slice(-10))) ||
          (cleanTo.length >= 10 && cleanAgentNum.endsWith(cleanTo.slice(-10)));
      });
    }

    if (!agent && from && from !== 'Unknown') {
      const cleanFrom = from.replace(/\D/g, '');
      agent = allAgents.find(a => {
        const cleanAgentNum = a.phoneNumber.replace(/\D/g, '');
        return cleanAgentNum === cleanFrom ||
          (cleanAgentNum.length >= 10 && cleanFrom.endsWith(cleanAgentNum.slice(-10))) ||
          (cleanFrom.length >= 10 && cleanAgentNum.endsWith(cleanFrom.slice(-10)));
      });
    }

    if (!agent) {
      log.warn('twilio_incoming_call_no_agent_resolved', { to, from });
      agent = await Agent.findOne({ type: 'receptionist' });
    }

    // Verify the request genuinely came from Twilio before acting on it.
    // Prefer the agent's own Twilio auth token, fall back to the account-wide env.
    const twilioToken = agent?.twilioAuthToken
      ? decrypt(agent.twilioAuthToken)
      : process.env.TWILIO_AUTH_TOKEN || null;
    if (!enforceTwilioSignature(req, twilioToken, { callSid, to, from })) {
      return res
        .status(403)
        .type('text/xml')
        .send(`<?xml version="1.0" encoding="UTF-8"?><Response><Reject/></Response>`);
    }

    if (agent) {
      // Use findOneAndUpdate with upsert to avoid duplicate key errors for outbound calls
      await Call.findOneAndUpdate(
        { vapiCallId: callSid },
        {
          $setOnInsert: {
            agentId: agent._id,
            userId: agent.userId,
            vapiCallId: callSid,
            callerNumber: req.body.Direction === 'outbound-api' ? to : from,
            status: 'in-progress',
            startedAt: new Date(),
          }
        },
        { upsert: true, new: true }
      );
      log.info('twilio_incoming_call_initialized_db', { callSid, agentId: agent._id, useCustomEngine: agent.useCustomEngine });
    }
  } catch (err) {
    log.error('twilio_incoming_call_db_failed', { error: err.message, callSid });
  }

  // Validate host header to prevent injection (must be hostname:port or hostname only).
  // Prefer the proxy-forwarded host so the wss URL matches the public endpoint;
  // take the first value when chained proxies send a comma-separated list.
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const VALID_HOST_REGEX = /^[a-zA-Z0-9._-]+(:\d{1,5})?$/;
  if (!host || !VALID_HOST_REGEX.test(host)) {
    log.warn('twilio_invalid_host_header', { host });
    return res.status(400).type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
  }

  res.type('text/xml');

  // No agent could be resolved for this number — answer gracefully instead of
  // opening a media stream with no agent context.
  if (!agent) {
    log.warn('twilio_incoming_call_unresolved', { to, from, callSid });
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, no agent is available to take your call right now. Please try again later.</Say>
    <Hangup/>
</Response>`);
  }

  // Only custom-engine agents are handled by our own WebSocket orchestrator.
  // Vapi agents are answered by Vapi directly (their Twilio number points at
  // Vapi), so a non-custom agent reaching here means the number is misconfigured.
  if (!agent.useCustomEngine) {
    log.warn('twilio_incoming_call_non_custom_agent', {
      agentId: agent._id?.toString(), vapiId: agent.vapiId, callSid,
    });
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>This number is not configured for direct handling. Please contact support.</Say>
    <Hangup/>
</Response>`);
  }

  // Twilio Media Streams REQUIRE wss. Force it in production and whenever the
  // proxy reports https; tolerate comma-separated x-forwarded-proto values.
  const xfProto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  const isSecure = xfProto === 'https' || req.secure || IS_PROD;
  const protocol = isSecure ? 'wss' : 'ws';
  const agentId = agent._id.toString();
  // Short-lived signed token so only calls we just answered can open a stream.
  const streamToken = signMediaStreamToken(agentId);
  const tokenParam = streamToken ? `&token=${encodeURIComponent(streamToken)}` : '';
  const wsUrl = `${protocol}://${host}/media-stream?agentId=${agentId}${tokenParam}`;
  const escapedWsUrl = wsUrl.replace(/&/g, '&amp;');
  console.log(escapedWsUrl)

  return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${escapedWsUrl}" />
    </Connect>
</Response>`);
});

export default router;
