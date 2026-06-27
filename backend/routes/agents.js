import mongoose from 'mongoose';
import express from 'express';
import Agent from '../db/models/Agent.js';
import User from '../db/models/User.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import Appointment from '../db/models/Appointment.js';
import { authenticate, requireAdmin, requireFeature } from '../middleware/auth.js';
import { contentFilter } from '../services/contentModeration.js';
import { log } from '../services/logger.js';
import { parsePage, paginatedResponse } from '../services/pagination.js';
import {
  createVapiAssistant,
  updateVapiAssistant,
  deleteVapiAssistant,
  assignAgentToPhone,
  createVapiPhoneNumber,
  listVapiPhoneNumbers,
} from '../services/vapi.js';

const router = express.Router();
router.use(authenticate);
router.use(requireFeature('voice'));

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

    // ✅ Fixed: Promise.all takes an array
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

// GET /agents/phone-numbers — admin only
router.get('/phone-numbers', requireAdmin, async (req, res) => {
  try {
    const phoneNumbers = await listVapiPhoneNumbers();
    res.json({ phoneNumbers });
  } catch (err) {
    log.error('list_phone_numbers_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: `Failed to list phone numbers: ${err.message}` });
  }
});

// POST /agents/phone-numbers — admin only
router.post('/phone-numbers', requireAdmin, async (req, res) => {
  try {
    const {
      provider, phoneNumber, number, assistantId, name,
      twilioAccountSid, twilioAuthToken, twilioApiKey, twilioApiSecret,
      vonageApiKey, vonageApiSecret,
      telnyxApiKey,
      sipGateway, sipUsername, sipPassword, sipTransport,
    } = req.body;
    const phone = number || phoneNumber;
    if (!provider || !phone) {
      return res.status(400).json({ message: 'provider and number are required' });
    }
    const result = await createVapiPhoneNumber({
      provider,
      number: phone,
      assistantId,
      name,
      twilioAccountSid, twilioAuthToken, twilioApiKey, twilioApiSecret,
      vonageApiKey, vonageApiSecret,
      telnyxApiKey,
      sipGateway, sipUsername, sipPassword, sipTransport,
    });
    res.status(201).json({ phoneNumber: result });
  } catch (err) {
    log.error('create_phone_number_error', { error: err.message, userId: req.user?.userId });
    res.status(500).json({ message: `Failed to create phone number: ${err.message}` });
  }
});

// POST /agents — create agent
router.post('/', contentFilter('name', 'prompt'), async (req, res) => {
  try {
    const { name, type, prompt, language, voiceId } = req.body;

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

    // Check chatbot limit from plan config
    const PLAN_CONFIG = User.PLAN_CONFIG;
    let chatPlan = user.chatPlan || 'chat_free';
    // Resolve chatPlan from user.plan if current chatPlan is invalid/none
    if (!chatPlan || chatPlan === 'none' || !PLAN_CONFIG[chatPlan]) {
      const p = user.plan || 'chat_free';
      if (p.startsWith('chat_')) chatPlan = p;
      else if (p.startsWith('both_')) chatPlan = p.replace('both_', 'chat_');
      else chatPlan = `chat_${p}`;
    }
    const chatCfg = PLAN_CONFIG[chatPlan];
    if (chatCfg) {
      const maxChatbots = chatCfg.limits.chatbots;
      if (maxChatbots !== -1) {
        const count = await Agent.countDocuments({ userId: user._id });
        if (count >= maxChatbots) {
          return res.status(403).json({
            message: `Your plan allows a maximum of ${maxChatbots} chatbot${maxChatbots > 1 ? 's' : ''}. Please upgrade to add more.`,
            code: 'CHATBOT_LIMIT_EXCEEDED',
            used: count,
            limit: maxChatbots,
          });
        }
      }
    }

    let vapiId = null;
    try {
      const vapiAssistant = await createVapiAssistant({
        name, type, prompt, language, voiceId,
        userId: req.user.userId,
        serverUrl: process.env.WEBHOOK_URL || process.env.SERVER_URL,
      });
      vapiId = vapiAssistant?.id ?? null;
    } catch (vapiErr) {
      log.error('vapi_create_agent_failed', { error: vapiErr.message, userId: req.user?.userId });
      return res.status(502).json({ message: `Voice agent creation failed: ${vapiErr.message}` });
    }

    const agent = await Agent.create({
      userId: user._id,
      vapiId,
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
    const { name, type, prompt, isActive, language, voiceId } = req.body;

    const { agent, forbidden } = await resolveAgentForUser(id, req.user);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if (forbidden) return res.status(403).json({ message: 'Access denied' });

    if (type !== undefined && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const effectiveName = name || agent.name;
    const effectiveType = type || agent.type;
    const effectiveLanguage = language || agent.language || 'en';
    const effectiveVoiceId = voiceId || agent.voiceId;
    const userProvidedPrompt = prompt !== undefined && prompt !== null && prompt !== '';
    const languageChanged = language !== undefined && language !== agent.language;
    const promptForVapi = userProvidedPrompt
      ? prompt
      : languageChanged ? null : (agent.prompt || null);

    const configChanged = name !== undefined || type !== undefined || prompt !== undefined || language !== undefined || voiceId !== undefined;

    if (agent.vapiId && configChanged) {
      try {
        await updateVapiAssistant(agent.vapiId, {
          name: effectiveName,
          prompt: promptForVapi,
          type: effectiveType,
          language: effectiveLanguage,
          voiceId: effectiveVoiceId,
          userId: agent.userId,
          serverUrl: process.env.WEBHOOK_URL || process.env.SERVER_URL,
        });
      } catch (vapiErr) {
        log.error('vapi_update_agent_failed', { error: vapiErr.message, userId: req.user?.userId });
        return res.status(502).json({ message: `Voice agent update failed: ${vapiErr.message}` });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (prompt !== undefined) updates.prompt = prompt || null;
    if (isActive !== undefined) updates.isActive = isActive;
    if (language !== undefined) updates.language = language;
    if (voiceId !== undefined) updates.voiceId = voiceId;

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
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if (forbidden) return res.status(403).json({ message: 'Access denied' });

    if (agent.vapiId) {
      try {
        await deleteVapiAssistant(agent.vapiId);
      } catch (vapiErr) {
        log.warn('vapi_delete_agent_failed', { error: vapiErr.message, userId: req.user?.userId });
      }
    }

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

// POST /agents/:id/assign-phone — admin only
router.post('/:id/assign-phone', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumberId, phoneNumber } = req.body;

    if (!phoneNumberId) {
      return res.status(400).json({ message: 'phoneNumberId is required' });
    }

    if (phoneNumberId.startsWith('+') || /^\d+$/.test(phoneNumberId)) {
      return res.status(400).json({
        message: 'phoneNumberId must be a Vapi UUID (e.g. a1b2c3d4-…), not the phone number string',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }

    const agent = await Agent.findById(id).lean();
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if (!agent.vapiId) {
      return res.status(400).json({ message: 'Agent is not linked to Vapi yet' });
    }

    try {
      await assignAgentToPhone(phoneNumberId, agent.vapiId);
    } catch (vapiErr) {
      log.error('vapi_assign_phone_failed', { error: vapiErr.message, userId: req.user?.userId });
      return res.status(502).json({ message: `Vapi error: ${vapiErr.message}` });
    }

    const updateFields = { phoneNumberId };
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    const updated = await Agent.findByIdAndUpdate(id, updateFields, { new: true }).lean();

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

// POST /agents/:id/unlink-phone — admin only
router.post('/:id/unlink-phone', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }

    const agent = await Agent.findById(id).lean();
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    if (!agent.phoneNumberId) {
      return res.status(400).json({ message: 'Agent has no phone number linked' });
    }

    const phoneNumberId = agent.phoneNumberId;

    // Remove assistant assignment from phone number in Vapi
    try {
      await assignAgentToPhone(phoneNumberId, null);
    } catch (vapiErr) {
      log.warn('vapi_unlink_phone_failed', { error: vapiErr.message, userId: req.user?.userId });
    }

    // Remove phoneNumberId and phoneNumber from agent in database
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