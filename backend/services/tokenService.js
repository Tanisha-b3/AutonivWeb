import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { securityEvent, IS_PROD, log } from '../services/logger.js';

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (IS_PROD) {
      log.fatal('startup_fatal_missing_jwt_secret');
      process.exit(1);
    } else {
      log.warn('jwt_secret_using_insecure_dev_fallback');
      return 'dev-fallback-secret-do-not-use-in-production';
    }
  }
  return secret;
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || getAccessSecret();
}

function getSecrets() {
  return { access: getAccessSecret(), refresh: getRefreshSecret() };
}

const ALGORITHM = 'HS256';
const ISSUER = 'autoniv';
const AUDIENCE = 'autoniv-api';

export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || '15m';
export const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL || '7d';
export const REFRESH_TOKEN_TTL_MS = ms(REFRESH_TOKEN_TTL);

function ms(str) {
  const m = String(str).match(/^(\d+)(ms|s|m|h|d)?$/);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const unit = m[2] || 'ms';
  const mult = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return n * mult;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getAccessSecret(), {
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: ACCESS_TOKEN_TTL,
    noTimestamp: false,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, kind: 'refresh' }, getRefreshSecret(), {
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: REFRESH_TOKEN_TTL,
    noTimestamp: false,
    jwtid: crypto.randomBytes(16).toString('hex'),
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getAccessSecret(), {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: 5,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getRefreshSecret(), {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: 5,
  });
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function tokenResponse({ user, dashboardStats, accessToken, refreshToken }) {
  const out = {
    accessToken,
    token: accessToken,
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
  };
  if (refreshToken) out.refreshToken = refreshToken;
  if (dashboardStats) out.dashboardStats = dashboardStats;
  return out;
}

export function authSecurityEvent(event, extra) {
  securityEvent(`auth.${event}`, extra);
}
