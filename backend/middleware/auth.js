import { verifyAccessToken, authSecurityEvent } from '../services/tokenService.js';
import { extractTokenFromCookie } from '../services/cookieService.js';
import User from '../db/models/User.js';

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const [scheme, token] = authHeader.split(' ');
    if (scheme === 'Bearer' && token) return token.trim();
  }
  return extractTokenFromCookie(req);
}

export function authenticate(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = verifyAccessToken(token);

    if (decoded.kind === 'refresh') {
      authSecurityEvent('refresh_token_used_as_access', { ip: req.ip });
      return res.status(401).json({ message: 'Invalid token type' });
    }

    if (!decoded.userId || !decoded.role) {
      authSecurityEvent('jwt_invalid_payload', { ip: req.ip });
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      userId: String(decoded.userId),
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    authSecurityEvent('jwt_verify_failed', { ip: req.ip, reason: err.message });
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `${role} access required` });
    }
    return next();
  };
}

export function requireOwnershipOrAdmin(getOwnerId) {
  return async (req, res, next) => {
    try {
      const ownerId = await getOwnerId(req);
      if (!ownerId) return res.status(404).json({ message: 'Resource not found' });
      if (req.user.role === 'admin') return next();
      if (String(ownerId) === String(req.user.userId)) return next();
      authSecurityEvent('ownership_violation', { ip: req.ip, userId: req.user.userId, ownerId: String(ownerId) });
      return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
      return next(err);
    }
  };
}

export function requireFeature(feature) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Admins bypass plan restrictions
      if (req.user.role === 'admin') {
        return next();
      }

      const user = await User.findById(req.user.userId).lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let chatPlan = user.chatPlan;
      let voicePlan = user.voicePlan;
      // Resolve from user.plan if chatPlan/voicePlan are missing, 'none', or invalid
      if (!chatPlan || chatPlan === 'none' || !User.PLAN_CONFIG[chatPlan]) {
        const plan = user.plan || 'chat_free';
        if (plan.startsWith('chat_')) {
          chatPlan = plan;
          voicePlan = voicePlan || 'none';
        } else if (plan.startsWith('voice_')) {
          chatPlan = 'none';
          voicePlan = plan;
        } else if (plan.startsWith('both_')) {
          chatPlan = plan.replace('both_', 'chat_');
          voicePlan = plan.replace('both_', 'voice_');
        } else {
          chatPlan = `chat_${plan}`;
          voicePlan = `voice_${plan}`;
        }
      }
      if (!voicePlan || voicePlan === 'none' || !User.PLAN_CONFIG[voicePlan]) {
        const plan = user.plan || 'chat_free';
        if (plan.startsWith('voice_')) voicePlan = plan;
        else if (plan.startsWith('both_')) voicePlan = plan.replace('both_', 'voice_');
        else voicePlan = `voice_${plan}`;
      }
      chatPlan = chatPlan || 'none';
      voicePlan = voicePlan || 'none';

      if (feature === 'chat') {
        if (chatPlan !== 'none') {
          return next();
        }
        return res.status(403).json({
          message: 'Chat features are not included in your current subscription plan. Please upgrade.',
          code: 'CHAT_ACCESS_DENIED'
        });
      }

      if (feature === 'voice') {
        if (voicePlan !== 'none') {
          return next();
        }
        return res.status(403).json({
          message: 'Voice/Agent features are not included in your current subscription plan. Please upgrade.',
          code: 'VOICE_ACCESS_DENIED'
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

// ─── Limit enforcement middleware ──────────────────────────────────────────────

// Check if user has exceeded their chat conversation limit
export function checkChatLimit() {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') return next();

      const user = await User.findById(req.user.userId).lean();
      if (!user) return res.status(404).json({ message: 'User not found' });

      const PLAN_CONFIG = User.PLAN_CONFIG;
      let chatPlan = user.chatPlan || 'none';
      if (!chatPlan || chatPlan === 'none' || !PLAN_CONFIG[chatPlan]) {
        const p = user.plan || 'chat_free';
        if (p.startsWith('chat_')) chatPlan = p;
        else if (p.startsWith('both_')) chatPlan = p.replace('both_', 'chat_');
        else chatPlan = `chat_${p}`;
      }

      const cfg = PLAN_CONFIG[chatPlan];
      if (!cfg) return res.status(403).json({ message: 'Invalid chat plan', code: 'INVALID_PLAN' });

      const limit = cfg.limits.conversations;
      if (limit === -1) return next();

      if (user.chatUsed >= limit) {
        return res.status(403).json({
          message: `Monthly conversation limit reached (${limit}). Please upgrade your plan.`,
          code: 'CHAT_LIMIT_EXCEEDED',
          used: user.chatUsed,
          limit,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Check if user has exceeded their voice call limit
export function checkVoiceLimit() {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') return next();

      const user = await User.findById(req.user.userId).lean();
      if (!user) return res.status(404).json({ message: 'User not found' });

      const PLAN_CONFIG = User.PLAN_CONFIG;
      let voicePlan = user.voicePlan || 'none';
      if (!voicePlan || voicePlan === 'none' || !PLAN_CONFIG[voicePlan]) {
        const p = user.plan || 'chat_free';
        if (p.startsWith('voice_')) voicePlan = p;
        else if (p.startsWith('both_')) voicePlan = p.replace('both_', 'voice_');
        else voicePlan = `voice_${p}`;
      }

      const cfg = PLAN_CONFIG[voicePlan];
      if (!cfg) return res.status(403).json({ message: 'Invalid voice plan', code: 'INVALID_PLAN' });

      const callLimit = cfg.limits.calls;
      if (callLimit !== -1 && user.callsUsed >= callLimit) {
        return res.status(403).json({
          message: `Monthly call limit reached (${callLimit}). Please upgrade your plan.`,
          code: 'VOICE_CALL_LIMIT_EXCEEDED',
          used: user.callsUsed,
          limit: callLimit,
        });
      }

      const minuteLimit = cfg.limits.minutes;
      if (minuteLimit !== -1 && user.minutesUsed >= minuteLimit) {
        return res.status(403).json({
          message: `Monthly minute limit reached (${minuteLimit}). Please upgrade your plan.`,
          code: 'VOICE_MINUTE_LIMIT_EXCEEDED',
          used: user.minutesUsed,
          limit: minuteLimit,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Check a specific named feature against the user's plan
export function checkPlanFeature(featureName) {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') return next();

      const user = await User.findById(req.user.userId).lean();
      if (!user) return res.status(404).json({ message: 'User not found' });

      let chatPlan = user.chatPlan || 'none';
      let voicePlan = user.voicePlan || 'none';
      if (!chatPlan || chatPlan === 'none' || !User.PLAN_CONFIG[chatPlan]) {
        const p = user.plan || 'chat_free';
        if (p.startsWith('chat_')) { chatPlan = p; voicePlan = voicePlan || 'none'; }
        else if (p.startsWith('voice_')) { chatPlan = 'none'; voicePlan = p; }
        else if (p.startsWith('both_')) { chatPlan = p.replace('both_', 'chat_'); voicePlan = p.replace('both_', 'voice_'); }
        else { chatPlan = `chat_${p}`; voicePlan = `voice_${p}`; }
      }
      if (!voicePlan || voicePlan === 'none' || !User.PLAN_CONFIG[voicePlan]) {
        const p = user.plan || 'chat_free';
        if (p.startsWith('voice_')) voicePlan = p;
        else if (p.startsWith('both_')) voicePlan = p.replace('both_', 'voice_');
        else voicePlan = `voice_${p}`;
      }

      const PLAN_CONFIG = User.PLAN_CONFIG;

      // Check chat plan features
      if (chatPlan !== 'none') {
        const cfg = PLAN_CONFIG[chatPlan];
        if (cfg && cfg.features && cfg.features[featureName] === true) return next();
      }

      // Check voice plan features
      if (voicePlan !== 'none') {
        const cfg = PLAN_CONFIG[voicePlan];
        if (cfg && cfg.features && cfg.features[featureName] === true) return next();
      }

      return res.status(403).json({
        message: `This feature requires a higher plan. Please upgrade to access ${featureName}.`,
        code: 'FEATURE_NOT_AVAILABLE',
        feature: featureName,
      });
    } catch (err) {
      next(err);
    }
  };
}
