import { Router } from 'express';
import { query, asyncRoute } from '../db/index.js';

const router = Router();

// GET /api/users/:identifier (id, email or studentId)
router.get('/:identifier', asyncRoute(async (req, res) => {
  const param = req.params.identifier;
  const user = await query.get(`
    SELECT id, name, email, student_id, role, department, batch, avatar_url, knowledge_points, created_at
    FROM users 
    WHERE id = ? OR student_id = ? OR email = ?
  `, param, param, param);

  if (!user) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }

  // Calculate stats
  const postsCount = await query.get('SELECT count(*) as count FROM posts WHERE author_id = ?', user.id).count;
  const resourcesCount = await query.get("SELECT count(*) as count FROM posts WHERE author_id = ? AND type = 'Resource'", user.id).count;
  const answersCount = await query.get('SELECT count(*) as count FROM comments WHERE author_id = ?', user.id).count;
  const helpfulCount = await query.get('SELECT COALESCE(SUM(helpful_count), 0) as total FROM posts WHERE author_id = ?', user.id).total;

  // Recent posts by user
  const userPosts = await query.all(`
    SELECT id, type, title, content, tags, helpful_count, comments_count, created_at
    FROM posts
    WHERE author_id = ?
    ORDER BY created_at DESC LIMIT 10
  `, user.id);

  res.json({
    user: {
      ...user,
      stats: {
        posts: postsCount,
        resources: resourcesCount,
        answers: answersCount,
        helpful: helpfulCount
      }
    },
    posts: userPosts.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    }))
  });
}));

export default router;
