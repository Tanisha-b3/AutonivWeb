import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../db/models/User.js';
import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import RefreshToken from '../db/models/RefreshToken.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, registerLimiter, authLimiter } from '../middleware/rateLimiters.js';
import { contentFilter } from '../services/contentModeration.js';
import {
  isValidEmail,
  passwordError,
  phoneError,
  normalizeEmail,
  trimString,
  NAME_MAX_LENGTH,
  COMPANY_MAX_LENGTH,
} from '../services/validators.js';
import {
  isAccountLocked,
  getLockRemainingMs,
  recordFailedLogin,
  recordSuccessfulLogin,
} from '../middleware/accountLockout.js';
import { log, IS_PROD } from '../services/logger.js';
import { constantTimeStringEqual } from '../services/crypto.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  tokenResponse,
  authSecurityEvent,
} from '../services/tokenService.js';

const router = express.Router();

const BCRYPT_COST = 10;

function getClientIp(req) {
  return (req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '').toString().slice(0, 64);
}

function getUserAgent(req) {
  const ua = req.headers['user-agent'];
  return typeof ua === 'string' ? ua.slice(0, 500) : null;
}

async function issueTokensForUser({ user, req }) {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = hashRefreshToken(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    createdAtIp: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  RefreshToken.deleteMany({
    userId: user._id,
    expiresAt: { $lt: new Date() },
  }).catch(() => {});

  return { accessToken, refreshToken };
}

async function performLoginAttempt(req, email, password) {
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    await bcrypt.compare(password, '$2b$12$invalidhashplaceholderforconstttimepadding..').catch(() => false);
    return { ok: false, status: 401, message: 'Invalid email or password' };
  }

  if (isAccountLocked(user)) {
    const remainingMin = Math.ceil(getLockRemainingMs(user) / 60000);
    return {
      ok: false,
      status: 423,
      message: `Account temporarily locked. Try again in ${remainingMin} minute${remainingMin === 1 ? '' : 's'}.`,
    };
  }

  if (user.isActive === false) {
    return { ok: false, status: 403, message: 'Account is disabled. Contact support.' };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await recordFailedLogin(user);
    authSecurityEvent('login_failed', { email, userId: String(user._id), ip: getClientIp(req) });
    return { ok: false, status: 401, message: 'Invalid email or password' };
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { loginAttempts: 0, lastLoginAt: new Date(), lastLoginIp: getClientIp(req) }, $unset: { lockUntil: '' } },
  );

  const [{ accessToken, refreshToken }, dashboardStats] = await Promise.all([
    issueTokensForUser({ user, req }),
    (async () => {
      if (user.role === 'admin') {
        const [totalUsers, activeAgents, totalMinutesResult, callsToday] = await Promise.all([
          User.countDocuments({ role: 'user' }),
          Agent.countDocuments({ isActive: true }),
          User.aggregate([{ $group: { _id: null, total: { $sum: '$minutesUsed' } } }]),
          Call.countDocuments({
            startedAt: { $gte: new Date(new Date().toISOString().split('T')[0]) },
          }),
        ]);
        return {
          totalUsers,
          activeAgents,
          totalMinutes: Math.round(totalMinutesResult[0]?.total || 0),
          callsToday,
        };
      } else {
        const [agentCount, callCount, leadCount, calls] = await Promise.all([
          Agent.countDocuments({ userId: user._id }),
          Call.countDocuments({ userId: user._id }),
          Lead.countDocuments({ userId: user._id }),
          Call.find({
            userId: user._id,
            status: 'completed',
            endedAt: { $ne: null },
            startedAt: { $ne: null },
          }).lean(),
        ]);
        const minuteUsed = calls.reduce((sum, c) => {
          const diff = new Date(c.endedAt) - new Date(c.startedAt);
          return sum + Math.max(0, Math.floor(diff / 60000));
        }, 0);
        return { agentCount, callCount, leadCount, minuteUsed };
      }
    })(),
  ]);

  log.info('login_success', { userId: String(user._id), role: user.role, ip: getClientIp(req) });

  return {
    ok: true,
    payload: tokenResponse({ user, dashboardStats, accessToken, refreshToken }),
  };
}

router.post('/register', registerLimiter, contentFilter('name', 'company'), async (req, res) => {
  try {
    const name = trimString(req.body?.name, NAME_MAX_LENGTH);
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const company = trimString(req.body?.company, COMPANY_MAX_LENGTH);
    const phoneNumber = trimString(req.body?.phoneNumber, 30);

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Valid email is required' });
    const pwdErr = passwordError(password);
    if (pwdErr) return res.status(400).json({ message: pwdErr });
    const phoneErr = phoneError(phoneNumber);
    if (phoneErr) return res.status(400).json({ message: phoneErr });

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      company,
      role: 'user',
      plan: 'free',
      minutesLimit: 100,
      callsLimit: 100,
      isVerified: true,
      passwordChangedAt: new Date(),
    });

    const { accessToken, refreshToken } = await issueTokensForUser({ user, req });

    log.info('user_registered', { userId: String(user._id), ip: getClientIp(req) });

    return res.status(201).json(
      tokenResponse({ user, accessToken, refreshToken }),
    );
  } catch (error) {
    log.error('register_error', { error: error.message, stack: error.stack, email: req.body?.email });
    return res.status(500).json({ message: 'Registration failed', detail: IS_PROD ? undefined : error.message });
  }
});

router.post('/register-admin', registerLimiter, contentFilter('name', 'company'), async (req, res) => {
  try {
    const name = trimString(req.body?.name, NAME_MAX_LENGTH);
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const company = trimString(req.body?.company, COMPANY_MAX_LENGTH);
    const secret = typeof req.body?.secret === 'string' ? req.body.secret : '';

    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret) {
      authSecurityEvent('admin_register_no_secret_configured', { ip: getClientIp(req) });
      return res.status(503).json({ message: 'Admin registration not configured' });
    }
    if (!constantTimeStringEqual(secret, expectedSecret)) {
      authSecurityEvent('admin_register_bad_secret', { ip: getClientIp(req) });
      return res.status(403).json({ message: 'Invalid admin secret' });
    }

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Valid email is required' });
    const pwdErr = passwordError(password);
    if (pwdErr) return res.status(400).json({ message: pwdErr });

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      company,
      role: 'admin',
      plan: 'enterprise',
      minutesLimit: 100000,
      callsLimit: 100000,
      passwordChangedAt: new Date(),
    });

    const { accessToken, refreshToken } = await issueTokensForUser({ user, req });

    log.info('admin_registered', { userId: String(user._id), ip: getClientIp(req) });

    return res.status(201).json(
      tokenResponse({ user, accessToken, refreshToken }),
    );
  } catch (error) {
    log.error('register_admin_error', { error: error.message });
    return res.status(500).json({ message: 'Admin registration failed' });
  }
});

router.post('/login', authLimiter, loginLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +isVerified');
    if (!user) {
      await bcrypt.compare(password, '$2b$12$invalidhashplaceholderforconstttimepadding..').catch(() => false);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (isAccountLocked(user)) {
      const remainingMin = Math.ceil(getLockRemainingMs(user) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked. Try again in ${remainingMin} minute${remainingMin === 1 ? '' : 's'}.`,
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is disabled. Contact support.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await recordFailedLogin(user);
      authSecurityEvent('login_failed', { email, userId: String(user._id), ip: getClientIp(req) });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: 0, lastLoginAt: new Date(), lastLoginIp: getClientIp(req) }, $unset: { lockUntil: '' } },
    );

    const { accessToken, refreshToken } = await issueTokensForUser({ user, req });

    log.info('login_success', { userId: String(user._id), role: user.role, ip: getClientIp(req) });

    return res.json(tokenResponse({ user, accessToken, refreshToken }));
  } catch (error) {
    log.error('login_error', { error: error.message, stack: error.stack, email: req.body?.email });
    return res.status(500).json({ message: 'Login failed', detail: IS_PROD ? undefined : error.message });
  }
});

// ─── Dashboard Stats (deferred — no longer blocks login) ────────────────────
router.get('/dashboard-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    let stats;
    if (user.role === 'admin') {
      const [totalUsers, activeAgents, totalMinutesResult, callsToday] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        Agent.countDocuments({ isActive: true }),
        User.aggregate([{ $group: { _id: null, total: { $sum: '$minutesUsed' } } }]),
        Call.countDocuments({
          startedAt: { $gte: new Date(new Date().toISOString().split('T')[0]) },
        }),
      ]);
      stats = {
        totalUsers,
        activeAgents,
        totalMinutes: Math.round(totalMinutesResult[0]?.total || 0),
        callsToday,
      };
    } else {
      const [agentCount, callCount, leadCount, calls] = await Promise.all([
        Agent.countDocuments({ userId }),
        Call.countDocuments({ userId }),
        Lead.countDocuments({ userId }),
        Call.find({
          userId,
          status: 'completed',
          endedAt: { $ne: null },
          startedAt: { $ne: null },
        }).lean(),
      ]);
      const minuteUsed = calls.reduce((sum, c) => {
        const diff = new Date(c.endedAt) - new Date(c.startedAt);
        return sum + Math.max(0, Math.floor(diff / 60000));
      }, 0);
      stats = { agentCount, callCount, leadCount, minuteUsed };
    }

    res.json(stats);
  } catch (error) {
    log.error('dashboard_stats_error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
});

router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken.trim() : '';
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Refresh token expired', code: 'REFRESH_EXPIRED' });
      }
      authSecurityEvent('refresh_verify_failed', { ip: getClientIp(req), reason: err.message });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (decoded.kind !== 'refresh' || !decoded.userId) {
      authSecurityEvent('refresh_wrong_kind', { ip: getClientIp(req) });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.revokedAt) {
      if (stored && stored.revokedAt) {
        await RefreshToken.updateMany(
          { userId: stored.userId, revokedAt: null },
          { $set: { revokedAt: new Date(), revokedReason: 'reuse_detected' } },
        );
        authSecurityEvent('refresh_reuse_detected', {
          userId: String(stored.userId),
          ip: getClientIp(req),
        });
      }
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    if (stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired', code: 'REFRESH_EXPIRED' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.isActive === false) {
      return res.status(401).json({ message: 'User no longer active' });
    }

    const newPayload = { userId: user._id.toString(), role: user.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);
    const newTokenHash = hashRefreshToken(newRefreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      createdAtIp: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    await RefreshToken.updateOne(
      { _id: stored._id },
      { $set: { revokedAt: new Date(), revokedReason: 'rotated', replacedByHash: newTokenHash } },
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    log.error('refresh_error', { error: error.message });
    return res.status(500).json({ message: 'Refresh failed' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken.trim() : null;
    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await RefreshToken.updateOne(
        { tokenHash, userId: req.user.userId, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedReason: 'logout' } },
      );
    } else {
      await RefreshToken.updateMany(
        { userId: req.user.userId, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedReason: 'logout' } },
      );
    }
    log.info('logout', { userId: req.user.userId, ip: getClientIp(req) });
    return res.json({ message: 'Logged out' });
  } catch (error) {
    log.error('logout_error', { error: error.message });
    return res.status(500).json({ message: 'Logout failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        company: user.company,
        plan: user.plan,
        minutesUsed: user.minutesUsed,
        minutesLimit: user.minutesLimit,
        callsUsed: user.callsUsed || 0,
        callsLimit: user.callsLimit || 30,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    log.error('me_error', { error: error.message });
    return res.status(500).json({ message: 'Failed to get user' });
  }
});

// ─── Forgot Password ────────────────────────────────────────────────────────

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    log.info('forgot_password_request', { email, ip: getClientIp(req) });

    return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    log.error('forgot_password_error', { error: error.message, email: req.body?.email });
    return res.status(500).json({ message: 'Failed to process request' });
  }
});

// ─── Reset Password ─────────────────────────────────────────────────────────

router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const newPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const pwdErr = passwordError(newPassword);
    if (pwdErr) return res.status(400).json({ message: pwdErr });

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: 'password_reset' } },
    );

    log.info('password_reset', { userId: String(user._id), ip: getClientIp(req) });

    return res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    log.error('reset_password_error', { error: error.message, email: req.body?.email });
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

// ─── Change Password (authenticated) ────────────────────────────────────────

router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const pwdErr = passwordError(newPassword);
    if (pwdErr) return res.status(400).json({ message: pwdErr });

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: 'password_changed' } },
    );

    log.info('password_changed', { userId: req.user.userId, ip: getClientIp(req) });

    return res.json({ message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    log.error('change_password_error', { error: error.message, userId: req.user.userId });
    return res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;
