import express from 'express';
import UpgradeRequest from '../db/models/UpgradeRequest.js';
import User from '../db/models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { log } from '../services/logger.js';
import { parsePage, paginatedResponse } from '../services/pagination.js';

const router = express.Router();
router.use(authenticate);

const PLAN_CONFIG = {
  pilot:      { callsPerMonth: 30,    setupFee: 0,     monthlyPrice: 4999  },
  foundation: { callsPerMonth: 120,   setupFee: 14999, monthlyPrice: 14999 },
  scale:      { callsPerMonth: 400,   setupFee: 39999, monthlyPrice: 29999 },
  dominate:   { callsPerMonth: 1200,  setupFee: 89999, monthlyPrice: 74999 },
};
const VALID_UPGRADE_PLANS = ['foundation', 'scale', 'dominate'];

router.post('/', async (req, res) => {
  try {
    const { requestedPlan } = req.body;
    if (!VALID_UPGRADE_PLANS.includes(requestedPlan)) {
      return res.status(400).json({ message: `Plan must be one of: ${VALID_UPGRADE_PLANS.join(', ')}` });
    }

    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.plan === requestedPlan) {
      return res.status(400).json({ message: `You are already on the ${requestedPlan} plan` });
    }

    const existing = await UpgradeRequest.findOne({ userId: user._id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending upgrade request' });
    }

    const request = await UpgradeRequest.create({
      userId: user._id,
      currentPlan: user.plan,
      requestedPlan,
      status: 'pending',
    });

    res.status(201).json({ request });
  } catch (error) {
    log.error('create_upgrade_request_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to create upgrade request' });
  }
});

router.get('/my', async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);
    const filter = { userId: req.user.userId };
    const [requests, total] = await Promise.all([
      UpgradeRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UpgradeRequest.countDocuments(filter),
    ]);
    res.json(paginatedResponse({ items: requests, total, page, limit }));
  } catch (error) {
    log.error('get_my_upgrade_requests_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch upgrade requests' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = parsePage(req.query);
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      UpgradeRequest.find(filter).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UpgradeRequest.countDocuments(filter),
    ]);

    const result = requests.map(r => ({
      ...r,
      id: r._id,
      userName: r.userId?.name || null,
      userEmail: r.userId?.email || null,
      userId: r.userId?._id || r.userId,
    }));

    res.json(paginatedResponse({ items: result, total, page, limit }));
  } catch (error) {
    log.error('get_upgrade_requests_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to fetch upgrade requests' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
    }

    const request = await UpgradeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Upgrade request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request was already ${request.status}` });
    }

    request.status = status;
    await request.save();

    if (status === 'approved') {
      const planConfig = PLAN_CONFIG[request.requestedPlan];
      if (planConfig) {
        await User.findByIdAndUpdate(request.userId, {
          plan: request.requestedPlan,
          minutesLimit: planConfig.callsPerMonth,
          callsLimit: planConfig.callsPerMonth,
        });
      }
    }

    res.json({ request });
  } catch (error) {
    log.error('process_upgrade_request_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to process upgrade request' });
  }
});

export default router;
