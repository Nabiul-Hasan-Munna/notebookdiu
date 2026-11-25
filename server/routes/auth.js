import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, asyncRoute } from '../db/index.js';
import { JWT_SECRET, verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', asyncRoute(async (req, res) => {
  const { emailOrStudentId, password } = req.body;

  if (!emailOrStudentId || !password) {
    return res.status(400).json({ error: 'Please provide student ID or email, and password.' });
  }

  // Lookup by email or student ID
  const user = await query.get(
    'SELECT * FROM users WHERE email = ? OR student_id = ?',
    emailOrStudentId.trim().toLowerCase(),
    emailOrStudentId.trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid university credentials.' });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'Your account is suspended. Contact the DIU administrator.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, studentId: user.student_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...sanitizedUser } = user;
  return res.json({
    message: 'Login successful',
    token,
    user: sanitizedUser
  });
}));

// POST /api/auth/register
router.post('/register', asyncRoute(async (req, res) => {
  const { name, email, studentId, password, department, batch } = req.body;

  if (!name || !email || !studentId || !password) {
    return res.status(400).json({ error: 'All fields (Name, DIU Email, Student ID, Password) are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@diu.edu.bd')) {
    return res.status(400).json({ error: 'Registration is restricted strictly to official DIU emails (@diu.edu.bd).' });
  }

  // Check unique constraints
  const existing = await query.get('SELECT id FROM users WHERE email = ? OR student_id = ?', cleanEmail, studentId.trim());
  if (existing) {
    return res.status(409).json({ error: 'A student account with this email or Student ID already exists.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`;

  const result = await query.run(`
    INSERT INTO users (name, email, student_id, password_hash, role, department, batch, avatar_url, knowledge_points)
    VALUES (?, ?, ?, ?, 'STUDENT', ?, ?, ?, 10)
  `, name.trim(), cleanEmail, studentId.trim(), hash, department || 'Software Engineering', batch || '43', defaultAvatar);

  const newUser = await query.get('SELECT id, name, email, student_id, role, department, batch, avatar_url, knowledge_points, status FROM users WHERE id = ?', result.lastInsertRowid);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, studentId: newUser.student_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    message: 'Account created successfully! Welcome to UniverseDIU.',
    token,
    user: newUser
  });
}));

// GET /api/auth/me
router.get('/me', verifyToken, asyncRoute(async (req, res) => {
  // Aggregate user stats
  const postsCount = await query.get('SELECT count(*) as count FROM posts WHERE author_id = ?', req.user.id).count;
  const resourcesCount = await query.get("SELECT count(*) as count FROM posts WHERE author_id = ? AND type = 'Resource'", req.user.id).count;
  const answersCount = await query.get('SELECT count(*) as count FROM comments WHERE author_id = ?', req.user.id).count;
  const helpfulCount = await query.get('SELECT COALESCE(SUM(helpful_count), 0) as total FROM posts WHERE author_id = ?', req.user.id).total;

  res.json({
    user: {
      ...req.user,
      stats: {
        posts: postsCount,
        resources: resourcesCount,
        answers: answersCount,
        helpful: helpfulCount
      }
    }
  });
}));

export default router;
