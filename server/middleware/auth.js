import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_ENVIRONMENT';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = await query.get('SELECT id, name, email, student_id, role, department, batch, avatar_url, knowledge_points, status FROM users WHERE id = ?', decoded.id);
    if (!user) return res.status(401).json({ error: 'User no longer exists.' });
    if (['SUSPENDED','BANNED'].includes(user.status)) return res.status(403).json({ error: 'Your account has been suspended. Please contact the administrator.' });
    req.user = user; next();
  } catch (err) { if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Invalid or expired session token.' }); next(err); }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try { const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET); const user = await query.get('SELECT id, name, email, role, status FROM users WHERE id = ?', decoded.id); if (user?.status === 'ACTIVE') req.user = user; } catch (err) { if (!['JsonWebTokenError','TokenExpiredError'].includes(err.name)) return next(err); }
  }
  next();
}

export function requireRole(allowedRoles) { return (req, res, next) => { if (!req.user) return res.status(401).json({ error: 'Authentication required.' }); if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: `Access denied. Requires one of [${allowedRoles.join(', ')}] privileges. Your role is ${req.user.role}.` }); next(); }; }
