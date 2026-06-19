import { verifyAccessToken, authSecurityEvent } from '../services/tokenService.js';

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
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
