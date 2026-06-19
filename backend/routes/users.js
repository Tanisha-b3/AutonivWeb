import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../db/models/User.js';
import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import Appointment from '../db/models/Appointment.js';
import UpgradeRequest from '../db/models/UpgradeRequest.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { contentFilter } from '../services/contentModeration.js';
import { log, securityEvent } from '../services/logger.js';
import { parsePage, paginatedResponse } from '../services/pagination.js';
import {
  isValidEmail,
  passwordError,
  normalizeEmail,
  trimString,
} from '../services/validators.js';

const router = express.Router();
router.use(authenticate);

const PLAN_CONFIG = {
  pilot:      { callsPerMonth: 30,    setupFee: 0,     monthlyPrice: 4999  },
  foundation: { callsPerMonth: 120,   setupFee: 14999, monthlyPrice: 14999 },
  scale:      { callsPerMonth: 400,   setupFee: 39999, monthlyPrice: 29999 },
  dominate:   { callsPerMonth: 1200,  setupFee: 89999, monthlyPrice: 74999 },
};
const VALID_PLANS = Object.keys(PLAN_CONFIG);

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);
    const { period } = req.query;
    let dateFilter = {};
    if (period) {
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { $or: [{ startedAt: { $gte: startDate } }, { endedAt: { $gte: startDate } }] };
    }

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const callAggFilter = Object.keys(dateFilter).length > 0 ? dateFilter : {};
    const userIds = users.map(u => u._id);
    const callAgg = userIds.length > 0
      ? await Call.aggregate([
          { $match: { ...callAggFilter, userId: { $in: userIds } } },
          { $group: { _id: '$userId', callCount: { $sum: 1 }, calcMinutes: { $sum: { $divide: [{ $subtract: ['$endedAt', '$startedAt'] }, 60000] } }, lastCallAt: { $max: '$startedAt' }, lastCallEnded: { $max: '$endedAt' } } },
        ])
      : [];
    const callMap = {};
    for (const c of callAgg) {
      callMap[c._id?.toString()] = c;
    }

    const result = users.map(u => {
      const stats = callMap[u._id.toString()] || {};
      return {
        id: u._id, email: u.email, name: u.name, phoneNumber: u.phoneNumber,
        role: u.role, company: u.company, plan: u.plan,
        minutesUsed: u.minutesUsed, minutesLimit: u.minutesLimit,
        isActive: u.isActive, createdAt: u.createdAt,
        callCount: stats.callCount || 0,
        calcMinutes: Math.round(stats.calcMinutes || 0),
        lastCallAt: stats.lastCallAt || null,
        lastCallEnded: stats.lastCallEnded || null,
      };
    });

    res.json(paginatedResponse({ items: result, total, page, limit }));
  } catch (error) {
    log.error('get_users_error', { error: error.message, userId: req.user.userId });
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/', requireAdmin, contentFilter('name', 'company'), async (req, res) => {
  try {
    const name = trimString(req.body?.name, 100);
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const company = trimString(req.body?.company, 200);
    const phoneNumber = trimString(req.body?.phoneNumber, 30);
    const plan = typeof req.body?.plan === 'string' ? req.body.plan : 'pilot';

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Valid email is required' });
    const pwdErr = passwordError(password);
    if (pwdErr) return res.status(400).json({ message: pwdErr });
    if (!PLAN_CONFIG[plan]) return res.status(400).json({ message: 'Invalid plan' });

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const planConfig = PLAN_CONFIG[plan];

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      company,
      plan,
      minutesLimit: planConfig.callsPerMonth,
      callsLimit: planConfig.callsPerMonth,
      passwordChangedAt: new Date(),
    });

    res.json({
      user: {
        id: user._id, email: user.email, name: user.name,
        phoneNumber: user.phoneNumber, role: user.role, company: user.company,
        plan: user.plan, minutesUsed: user.minutesUsed, minutesLimit: user.minutesLimit,
        callsUsed: user.callsUsed || 0, callsLimit: user.callsLimit,
        isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    log.error('create_user_error', { error: error.message, userId: req.user.userId });
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.put('/:id', contentFilter('name', 'company'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, plan, password, oldPassword, phoneNumber } = req.body;

    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isSelf = req.user.role !== 'admin';
    const currentPlan = isSelf ? user.plan : plan;
    const planConfig = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.pilot;

    const updates = {
      name: typeof name === 'string' ? name.trim().slice(0, 100) : user.name,
      email: email ? String(email).toLowerCase().trim().slice(0, 254) : user.email,
      phoneNumber: typeof phoneNumber === 'string' ? phoneNumber.trim().slice(0, 30) : user.phoneNumber,
      company: typeof company === 'string' ? company.trim().slice(0, 200) : user.company,
      plan: currentPlan,
    };
    if (req.user.role === 'admin' && plan) {
      updates.minutesLimit = planConfig.callsPerMonth;
      updates.callsLimit = planConfig.callsPerMonth;
    }
    if (password) {
      if (isSelf) {
        if (!oldPassword) {
          return res.status(400).json({ message: 'Current password is required to change your password' });
        }
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
      }
      const pwdErr = passwordError(password);
      if (pwdErr) return res.status(400).json({ message: pwdErr });
      updates.password = await bcrypt.hash(password, 12);
      updates.passwordChangedAt = new Date();
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).lean();

    res.json({
      user: {
        id: updated._id, email: updated.email, name: updated.name,
        phoneNumber: updated.phoneNumber, role: updated.role, company: updated.company,
        plan: updated.plan, minutesUsed: updated.minutesUsed, minutesLimit: updated.minutesLimit,
        callsUsed: updated.callsUsed || 0, callsLimit: updated.callsLimit,
        isActive: updated.isActive, createdAt: updated.createdAt, updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    log.error('update_user_error', { error: error.message, userId: req.user.userId });
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role !== 'admin' && req.user.userId === id) {
      const target = await User.findById(id).select('role').lean();
      if (target?.role === 'admin') {
        return res.status(403).json({ message: 'Admin accounts cannot self-delete' });
      }
    }

    await Appointment.deleteMany({ userId: id });
    await Lead.deleteMany({ userId: id });
    await Call.deleteMany({ userId: id });

    const agents = await Agent.find({ userId: id }).lean();
    for (const agent of agents) {
      if (agent.vapiId) {
        try {
          const { deleteVapiAssistant } = await import('../services/vapi.js');
          await deleteVapiAssistant(agent.vapiId);
        } catch { /* proceed */ }
      }
    }
    await Agent.deleteMany({ userId: id });
    await UpgradeRequest.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    securityEvent('user_deleted', { deletedId: id, byUser: req.user.userId });
    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    log.error('delete_user_error', { error: error.message, userId: req.user.userId });
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.put('/:id/block', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await User.findByIdAndUpdate(id, { isActive });
    res.json({ message: 'User updated' });
  } catch (error) {
    log.error('block_user_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.put('/:id/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!VALID_PLANS.includes(plan)) {
      return res.status(400).json({ message: `Plan must be one of: ${VALID_PLANS.join(', ')}` });
    }

    const planConfig = PLAN_CONFIG[plan];
    const updated = await User.findByIdAndUpdate(id, {
      plan,
      minutesLimit: planConfig.callsPerMonth,
      callsLimit: planConfig.callsPerMonth,
    }, { new: true }).lean();

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update plan' });
    }

    res.json({
      user: {
        id: updated._id, email: updated.email, name: updated.name,
        phoneNumber: updated.phoneNumber, role: updated.role, company: updated.company,
        plan: updated.plan, minutesUsed: updated.minutesUsed, minutesLimit: updated.minutesLimit,
        callsUsed: updated.callsUsed || 0, callsLimit: updated.callsLimit,
        isActive: updated.isActive, createdAt: updated.createdAt, updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    log.error('upgrade_plan_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to upgrade plan' });
  }
});

export default router;
