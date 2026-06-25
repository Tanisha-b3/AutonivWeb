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
      if (!chatPlan && !voicePlan) {
        const plan = user.plan || 'chat_free';
        if (plan.startsWith('chat_')) {
          chatPlan = plan;
          voicePlan = 'none';
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
