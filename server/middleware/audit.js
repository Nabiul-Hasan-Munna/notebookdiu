import { query } from '../db/index.js';
export async function logAudit(actorId, action, targetType, targetId, details = null) {
  try { const detailsStr = typeof details === 'object' && details !== null ? JSON.stringify(details) : details; await query.run('INSERT INTO audit_logs (actor_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)', actorId, action, targetType, targetId, detailsStr); }
  catch (err) { console.error('[AUDIT ERROR]', err); }
}
