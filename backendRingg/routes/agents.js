import mongoose from 'mongoose';
import express from 'express';
import Agent from '../db/models/Agent.js';
import User from '../db/models/User.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import Appointment from '../db/models/Appointment.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { contentFilter } from '../services/contentModeration.js';
import { log } from '../services/logger.js';
import { parsePage, paginatedResponse } from '../services/pagination.js';
import { listRinggAssistants, createRinggAssistant, updateRinggWebhook } from '../services/ringg.js';

const router = express.Router();
router.use(authenticate);

const VALID_TYPES = ['receptionist', 'appointment', 'faq'];

async function resolveAgentForUser(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) return { agent: null, forbidden: false };
  const agent = await Agent.findById(id).lean();
  if (!agent) return { agent: null, forbidden: false };
  if (user.role === 'admin' || agent.userId.toString() === user.userId) {
    return { agent, forbidden: false };
  }
  return { agent, forbidden: true };
}

async function autoAssignRinggId(name) {
  try {
    const response = await listRinggAssistants();
    const rawList = response?.assistants || response;
    let assistants = [];
    if (Array.isArray(rawList)) {
      assistants = rawList;
    } else if (rawList && typeof rawList === 'object') {
      if (rawList.data && typeof rawList.data === 'object') {
        if (Array.isArray(rawList.data.agents)) {
          assistants = rawList.data.agents;
        } else if (Array.isArray(rawList.data.assistants)) {
          assistants = rawList.data.assistants;
        } else if (Array.isArray(rawList.data)) {
          assistants = rawList.data;
        }
      } else if (Array.isArray(rawList.agents)) {
        assistants = rawList.agents;
      } else if (Array.isArray(rawList.assistants)) {
        assistants = rawList.assistants;
      }
    }

    if (assistants.length > 0) {
      const nameMatched = assistants.find(ast => {
        const astName = (ast?.name || ast?.agent_name || ast?.agent_display_name || '').toLowerCase().trim();
        return astName === name.toLowerCase().trim();
      });

      if (nameMatched) {
        const aid = nameMatched?.agent_id || nameMatched?.id || nameMatched?.assistant_id || null;
        log.info('ringg_auto_assign_by_name', { name, ringgId: aid });
        return aid;
      }

      const linkedAgents = await Agent.find({ ringgId: { $ne: null } }).select('ringgId').lean();
      const linkedIds = new Set(linkedAgents.map(a => a.ringgId));

      const unassigned = assistants.find(ast => {
        const aid = ast?.agent_id || ast?.id || ast?.assistant_id || '';
        return aid && !linkedIds.has(aid);
      });

      if (unassigned) {
        const aid = unassigned?.agent_id || unassigned?.id || unassigned?.assistant_id || null;
        log.info('ringg_auto_assign_unassigned', { name, ringgId: aid });
        return aid;
      }
    }
  } catch (err) {
    log.error('ringg_auto_assign_error', { error: err.message, name });
  }
  return null;
}

// GET /agents — admin: all agents with user info and call count
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'calls',
          localField: '_id',
          foreignField: 'agentId',
          as: 'calls',
        },
      },
      {
        $addFields: {
          callCount: { $size: '$calls' },
          userName: '$user.name',
          userEmail: '$user.email',
        },
      },
      { $project: { user: 0, calls: 0 } },
      { $sort: { createdAt: -1 } },
    ];

    const countPipeline = [{ $count: 'total' }];

    const [agents, countResult] = await Promise.all([
      Agent.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      Agent.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;
    const normalized = (agents || []).map((a) => ({
      ...a,
      id: a._id.toString(),
      userId: a.userId?.toString(),
    }));

    res.json(paginatedResponse({ items: normalized, total, page, limit }));
  } catch (err) {
    log.error('get_all_agents_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

// GET /agents/my — current user's agents
router.get('/my', async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);

    if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const matchStage = { userId };

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'calls',
          localField: '_id',
          foreignField: 'agentId',
          as: 'calls',
        },
      },
      {
        $addFields: {
          callCount: { $size: '$calls' },
        },
      },
      { $project: { calls: 0 } },
      { $sort: { createdAt: -1 } },
    ];

    const countPipeline = [{ $match: matchStage }, { $count: 'total' }];

    const [agents, countResult] = await Promise.all([
      Agent.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      Agent.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;
    const normalized = (agents || []).map((a) => ({
      ...a,
      id: a._id.toString(),
      userId: a.userId?.toString(),
    }));

    res.json(paginatedResponse({ items: normalized, total, page, limit }));
  } catch (err) {
    log.error('get_my_agents_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

// GET /agents/ringg-list — fetch assistants configured on the Ringg dashboard
router.get('/ringg-list', async (req, res) => {
  try {
    const assistants = await listRinggAssistants();
    res.json({ assistants });
  } catch (err) {
    log.error('list_ringg_assistants_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: `Failed to fetch Ringg agents: ${err.message}` });
  }
});

// GET /agents/phone-numbers — stubbed out for Ringg
router.get('/phone-numbers', requireAdmin, async (req, res) => {
  res.json({ phoneNumbers: [] });
});

// POST /agents/phone-numbers — stubbed out for Ringg
router.post('/phone-numbers', requireAdmin, async (req, res) => {
  res.status(201).json({ message: 'Phone number management is handled in the Ringg Dashboard.' });
});

// POST /agents — create agent
router.post('/', contentFilter('name', 'prompt'), async (req, res) => {
  try {
    const { name, type, prompt, language, voiceId, ringgId } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'name and type are required' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }

    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    const LIMITS = { pilot: 1, foundation: 2, scale: 3 };
    const maxAgents = LIMITS[user.plan];
    if (maxAgents) {
      const count = await Agent.countDocuments({ userId: user._id });
      if (count >= maxAgents) {
        return res.status(403).json({
          message: `Your ${user.plan} plan allows a maximum of ${maxAgents} agent${maxAgents > 1 ? 's' : ''}. Please upgrade to add more.`,
        });
      }
    }

    let autoRinggId = null;
    if (!ringgId) {
      try {
        const ringgAgent = await createRinggAssistant({
          name,
          type,
          prompt,
          language,
          voiceId,
        });
        autoRinggId = ringgAgent?.agent_id || ringgAgent?.id || ringgAgent?.assistant_id || null;
      } catch (ringgErr) {
        log.warn('ringg_create_agent_api_failed_falling_back_to_auto_assign', { error: ringgErr.message, name });
        autoRinggId = await autoAssignRinggId(name);
      }

      if (autoRinggId) {
        try {
          const serverUrl = process.env.WEBHOOK_URL || process.env.SERVER_URL;
          if (serverUrl) {
            await updateRinggWebhook(autoRinggId, `${serverUrl}/api/webhooks/ringg`);
          }
        } catch (webhookErr) {
          log.warn('ringg_webhook_update_failed_for_auto_assigned_agent', { error: webhookErr.message, autoRinggId });
        }
      }
    }

    const agent = await Agent.create({
      userId: user._id,
      ringgId: ringgId || autoRinggId || null,
      name,
      type,
      prompt: prompt || null,
      language: language || null,
      voiceId: voiceId || null,
      isActive: true,
    });

    res.status(201).json({
      agent: {
        ...agent.toObject(),
        id: agent._id.toString(),
        userId: agent.userId.toString(),
      },
    });
  } catch (err) {
    log.error('create_agent_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to create agent' });
  }
});

// PUT /agents/:id — update agent
router.put('/:id', contentFilter('name', 'prompt'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, prompt, isActive, language, voiceId, ringgId } = req.body;

    const { agent, forbidden } = await resolveAgentForUser(id, req.user);
    if (!agent)    return res.status(404).json({ message: 'Agent not found' });
    if (forbidden) return res.status(403).json({ message: 'Access denied' });

    if (type !== undefined && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const updates = {};
    if (name !== undefined)     updates.name = name;
    if (type !== undefined)     updates.type = type;
    if (prompt !== undefined)   updates.prompt = prompt || null;
    if (isActive !== undefined) updates.isActive = isActive;
    if (language !== undefined) updates.language = language;
    if (voiceId !== undefined)  updates.voiceId = voiceId;
    if (ringgId !== undefined)  updates.ringgId = ringgId || null;

    const updated = await Agent.findByIdAndUpdate(id, updates, { new: true }).lean();

    res.json({
      agent: {
        ...updated,
        id: updated._id.toString(),
        userId: updated.userId.toString(),
      },
    });
  } catch (err) {
    log.error('update_agent_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to update agent' });
  }
});

// DELETE /agents/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { agent, forbidden } = await resolveAgentForUser(id, req.user);
    if (!agent)    return res.status(404).json({ message: 'Agent not found' });
    if (forbidden) return res.status(403).json({ message: 'Access denied' });

    await Promise.all([
      Lead.deleteMany({ agentId: id }),
      Appointment.deleteMany({ agentId: id }),
      Call.deleteMany({ agentId: id }),
      Agent.findByIdAndDelete(id),
    ]);

    res.json({ message: 'Agent and all associated data deleted successfully' });
  } catch (err) {
    log.error('delete_agent_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to delete agent' });
  }
});

// POST /agents/:id/assign-phone — stubbed for Ringg
router.post('/:id/assign-phone', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumberId, phoneNumber } = req.body;

    if (!phoneNumberId) {
      return res.status(400).json({ message: 'phoneNumberId is required' });
    }

    const updated = await Agent.findByIdAndUpdate(id, { phoneNumberId, phoneNumber }, { new: true }).lean();

    res.json({
      agent: {
        ...updated,
        id: updated._id.toString(),
        userId: updated.userId.toString(),
      },
    });
  } catch (err) {
    log.error('assign_phone_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to assign phone number' });
  }
});

// POST /agents/:id/unlink-phone — stubbed for Ringg
router.post('/:id/unlink-phone', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Agent.findByIdAndUpdate(id, { $unset: { phoneNumberId: '', phoneNumber: '' } }, { new: true }).lean();

    res.json({
      agent: {
        ...updated,
        id: updated._id.toString(),
        userId: updated.userId.toString(),
      },
      message: 'Phone number unlinked successfully',
    });
  } catch (err) {
    log.error('unlink_phone_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to unlink phone number' });
  }
});

export default router;