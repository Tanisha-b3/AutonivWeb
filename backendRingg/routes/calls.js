import mongoose from 'mongoose';
import express from 'express';
import Call from '../db/models/Call.js';
import Agent from '../db/models/Agent.js';
import User from '../db/models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { log } from '../services/logger.js';
import { createRinggOutboundCall, extractRinggCallData } from '../services/ringg.js';
import { parsePage, paginatedResponse } from '../services/pagination.js';

const router = express.Router();
router.use(authenticate);

// Normalize a call document for frontend consumption
function normalizeCall(c) {
  return {
    ...c,
    id:        c._id?.toString(),
    agentId:   c.agentId?._id?.toString() ?? c.agentId?.toString() ?? null,
    userId:    c.userId?._id?.toString()  ?? c.userId?.toString()  ?? null,
    agentName: c.agentId?.name  ?? null,
    agentType: c.agentId?.type  ?? null,
    userName:  c.userId?.name   ?? null,
    userEmail: c.userId?.email  ?? null,
  };
}

// Status mapping shared between sync routes (Ringg standard status to database status)
const STATUS_MAP = {
  ended: 'completed',
  completed: 'completed',
  missed: 'missed',
  failed: 'failed',
  'in-progress': 'in-progress',
};

// GET /calls — admin: all calls
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [calls, total] = await Promise.all([
      Call.find(filter).sort({ startedAt: -1 }).skip(skip).limit(limit).populate('agentId', 'name type').populate('userId', 'name email').lean(),
      Call.countDocuments(filter),
    ]);

    res.json(paginatedResponse({ items: calls.map(normalizeCall), total, page, limit }));
  } catch (error) {
    log.error('get_all_calls_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch calls' });
  }
});

// GET /calls/my — current user's calls
router.get('/my', async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }

    const filter = { userId: new mongoose.Types.ObjectId(req.user.userId) };
    if (status) filter.status = status;

    const [calls, total] = await Promise.all([
      Call.find(filter).sort({ startedAt: -1 }).skip(skip).limit(limit).populate('agentId', 'name type').lean(),
      Call.countDocuments(filter),
    ]);

    res.json(paginatedResponse({ items: calls.map(normalizeCall), total, page, limit }));
  } catch (error) {
    log.error('get_my_calls_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch calls' });
  }
});

// GET /calls/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin
      ? {}
      : { userId: new mongoose.Types.ObjectId(req.user.userId) };

    const stats = await Call.aggregate([
      { $match: filter },
      {
        $group: {
          _id:            null,
          totalCalls:     { $sum: 1 },
          completedCalls: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          missedCalls:    { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } },
          activeCalls:    { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          totalSeconds:   { $sum: '$duration' },
          avgDuration:    { $avg: '$duration' },
        },
      },
    ]);

    const s = stats[0] || {};
    res.json({
      totalCalls:     s.totalCalls     || 0,
      completedCalls: s.completedCalls || 0,
      missedCalls:    s.missedCalls    || 0,
      activeCalls:    s.activeCalls    || 0,
      totalMinutes:   Math.ceil((s.totalSeconds || 0) / 60),
      avgDuration:    Math.round(s.avgDuration || 0),
    });
  } catch (error) {
    log.error('call_stats_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch call stats' });
  }
});

// GET /calls/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid call ID' });
    }

    const call = await Call.findById(id)
      .populate('agentId', 'name type')
      .lean();

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (req.user.role !== 'admin' && call.userId?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ call: normalizeCall(call) });
  } catch (error) {
    log.error('get_call_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch call' });
  }
});

// POST /calls/sync — stubbed for Ringg since synchronization uses webhook status events
router.post('/sync', requireAdmin, async (req, res) => {
  res.json({ message: 'Sync complete (Ringg relies on real-time webhooks)', synced: 0, updated: 0, skippedNoAgent: 0 });
});

// POST /calls/sync-my — stubbed for Ringg
router.post('/sync-my', async (req, res) => {
  res.json({ message: 'Sync complete (Ringg relies on real-time webhooks)', synced: 0, skippedDuplicate: 0, skippedNoAgent: 0 });
});

// POST /calls/outbound — initiate outbound call via Ringg AI
router.post('/outbound', async (req, res) => {
  try {
    const { agentId, phoneNumber, fromNumberId, customArgsValues } = req.body;

    if (!agentId || !phoneNumber) {
      return res.status(400).json({ message: 'agentId and phoneNumber are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }

    const phoneClean = phoneNumber.replace(/[\s\-()]/g, '');
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      return res.status(400).json({ message: 'Invalid phone number format. Use E.164 (e.g. +14155551234)' });
    }

    const agent = await Agent.findById(agentId).lean();
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!agent.isActive) {
      return res.status(400).json({ message: 'Agent is not active. Enable it first.' });
    }

    if (!agent.ringgId) {
      return res.status(400).json({ message: 'Agent has no Ringg assistant linked.' });
    }

    const e164Number = phoneClean.startsWith('+') ? phoneClean : `+${phoneClean}`;

    const ringgCall = await createRinggOutboundCall({
      agentId:      agent.ringgId,
      mobileNumber: e164Number,
      fromNumberId,
      customArgsValues,
    });

    log.info('outbound_call_initiated', {
      userId: req.user.userId,
      agentId,
      phoneNumber: e164Number,
      ringgCallId: ringgCall?.id,
    });

    // Save initial call record in database
    await Call.create({
      agentId: agent._id,
      userId: agent.userId,
      ringgCallId: ringgCall?.id || null,
      callerNumber: e164Number,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
    });

    return res.json({ message: 'Call initiated successfully', callId: ringgCall?.id || null });
  } catch (error) {
    log.error('outbound_call_error', { error: error.message, userId: req.user?.userId });
    return res.status(500).json({ message: error.message || 'Failed to initiate call' });
  }
});

export default router;