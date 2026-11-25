import { Router } from 'express';
import { query, asyncRoute } from '../db/index.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Protect all admin routes
router.use(verifyToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']));


// GET /api/admin/stats
router.get('/stats', asyncRoute(async (req, res) => {
  const studentsRow = await query.get(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'STUDENT'"
  );

  const resourcesRow = await query.get(
    "SELECT COUNT(*) AS count FROM posts WHERE type = 'Resource'"
  );

  const postsRow = await query.get(
    "SELECT COUNT(*) AS count FROM posts"
  );

  const commentsRow = await query.get(
    "SELECT COUNT(*) AS count FROM comments"
  );

  const coursesRow = await query.get(
    "SELECT COUNT(*) AS count FROM courses"
  );

  const reportsRow = await query.get(
    "SELECT COUNT(*) AS count FROM reports WHERE status = 'PENDING'"
  );

  // Convert MySQL COUNT results to JavaScript numbers.
  const totalStudents = Number(studentsRow?.count ?? 0);
  const totalResources = Number(resourcesRow?.count ?? 0);
  const totalDiscussions =
    Number(postsRow?.count ?? 0) + Number(commentsRow?.count ?? 0);
  const totalCourses = Number(coursesRow?.count ?? 0);
  const reportedContent = Number(reportsRow?.count ?? 0);

  // Get actual post uploads for the last six calendar months.
  const monthlyRows = await query.all(`
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month_key,
      COUNT(*) AS uploads
    FROM posts
    WHERE created_at >= DATE_SUB(
      DATE_FORMAT(CURDATE(), '%Y-%m-01'),
      INTERVAL 5 MONTH
    )
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month_key ASC
  `);

  const monthlyMap = new Map(
    monthlyRows.map(row => [row.month_key, Number(row.uploads)])
  );

  const chartData = [];

  const currentMonth = new Date();
  currentMonth.setDate(1);

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(monthDate.getMonth() - i);

    const year = monthDate.getFullYear();
    const monthNumber = String(monthDate.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${monthNumber}`;

    chartData.push({
      month: monthDate.toLocaleString('en-US', { month: 'short' }),
      uploads: monthlyMap.get(monthKey) ?? 0
    });
  }

  res.json({
    kpis: {
      totalStudents,
      totalResources,
      totalDiscussions,
      totalCourses,
      reportedContent
    },
    chartData
  });
}));


// GET /api/admin/reports - Content Moderation Queue
router.get('/reports', asyncRoute(async (req, res) => {
  const sql = `
    SELECT 
      r.id, r.reason, r.status, r.created_at,
      p.id as post_id, p.title as post_title, p.content as post_content,
      u.name as reporter_name, u.email as reporter_email
    FROM reports r
    JOIN posts p ON r.post_id = p.id
    JOIN users u ON r.reporter_id = u.id
    ORDER BY r.created_at DESC
  `;

  const reports = await query.all(sql);
  res.json({ reports });
}));

// PATCH /api/admin/reports/:id - Resolve or Dismiss Report
router.patch('/reports/:id', asyncRoute(async (req, res) => {
  const { status, action } = req.body; // status: 'RESOLVED' or 'DISMISSED'
  const reportId = req.params.id;

  const report = await query.get('SELECT * FROM reports WHERE id = ?', reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  await query.run('UPDATE reports SET status = ? WHERE id = ?', status || 'RESOLVED', reportId);

  // If action is to delete post
  if (action === 'DELETE_POST') {
    await query.run('DELETE FROM posts WHERE id = ?', report.post_id);
    await logAudit(req.user.id, 'DELETE_REPORTED_POST', 'POST', report.post_id, { reportId, reason: report.reason });
  } else {
    await logAudit(req.user.id, 'RESOLVE_REPORT', 'REPORT', reportId, { status, reason: report.reason });
  }

  res.json({ message: `Report marked as ${status}.`, success: true });
}));

// GET /api/admin/users - User Directory & RBAC management
router.get('/users', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const { search, role, status } = req.query;

  let sql = `
    SELECT id, name, email, student_id, role, department, batch, knowledge_points, status, created_at
    FROM users
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
    const pat = `%${search}%`;
    params.push(pat, pat, pat);
  }
  if (role) {
    sql += ` AND role = ?`;
    params.push(role);
  }
  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY created_at DESC LIMIT 100`;

  const users = await query.all(sql, ...params);
  res.json({ users });
}));

// PATCH /api/admin/users/:id/role - Role Assignment (Admin only)
router.patch('/users/:id/role', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const { role } = req.body;
  const targetUserId = req.params.id;

  if (!['STUDENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  // Prevent regular admin from promoting to super admin
  if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Administrators can assign the Super Admin role.' });
  }

  await query.run('UPDATE users SET role = ? WHERE id = ?', role, targetUserId);
  await logAudit(req.user.id, 'CHANGE_ROLE', 'USER', targetUserId, { newRole: role });

  res.json({ message: `User role updated to ${role}.`, success: true });
}));

// PATCH /api/admin/users/:id/status - Account Suspension / Activation
router.patch('/users/:id/status', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const { status } = req.body; // 'ACTIVE', 'SUSPENDED'
  const targetUserId = req.params.id;

  if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid account status.' });
  }

  await query.run('UPDATE users SET status = ? WHERE id = ?', status, targetUserId);
  await logAudit(req.user.id, 'CHANGE_USER_STATUS', 'USER', targetUserId, { newStatus: status });

  res.json({ message: `User account status updated to ${status}.`, success: true });
}));

// GET /api/admin/audit-logs - View Audit History
router.get('/audit-logs', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const sql = `
    SELECT 
      a.id, a.action, a.target_type, a.target_id, a.details, a.created_at,
      u.name as actor_name, u.email as actor_email, u.role as actor_role
    FROM audit_logs a
    JOIN users u ON a.actor_id = u.id
    ORDER BY a.created_at DESC LIMIT 50
  `;

  const logs = await query.all(sql);
  res.json({ logs });
}));


// ==========================================
// COURSE MANAGEMENT (ADMIN / SUPER ADMIN ONLY)
// ==========================================

// GET /api/admin/departments
router.get('/departments', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const departments = await query.all(
    'SELECT id, code, name FROM departments ORDER BY name ASC'
  );

  res.json({ departments });
}));

// GET /api/admin/courses
router.get('/courses', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const courses = await query.all(`
    SELECT
      c.id,
      c.code,
      c.name,
      c.department_id,
      c.semester,
      c.description,
      d.name AS department_name,
      d.code AS department_code,
      (SELECT COUNT(*) FROM posts p WHERE p.course_id = c.id) AS resources_count
    FROM courses c
    LEFT JOIN departments d ON d.id = c.department_id
    ORDER BY c.code ASC
  `);

  res.json({ courses });
}));

// POST /api/admin/courses
router.post('/courses', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const { code, name, department_id, semester, description } = req.body;

  const cleanCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanSemester = typeof semester === 'string' ? semester.trim() : '';
  const cleanDescription = typeof description === 'string' ? description.trim() : '';

  if (!cleanCode || !cleanName || !department_id || !cleanSemester) {
    return res.status(400).json({
      error: 'Course code, name, department, and semester are required.'
    });
  }

  if (cleanCode.length > 50 || cleanName.length > 255 || cleanSemester.length > 100) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length.' });
  }

  const department = await query.get(
    'SELECT id FROM departments WHERE id = ?',
    department_id
  );

  if (!department) {
    return res.status(400).json({ error: 'Selected department does not exist.' });
  }

  const existing = await query.get(
    'SELECT id FROM courses WHERE code = ?',
    cleanCode
  );

  if (existing) {
    return res.status(409).json({ error: 'A course with this code already exists.' });
  }

  const result = await query.run(
    `INSERT INTO courses (code, name, department_id, semester, description)
     VALUES (?, ?, ?, ?, ?)`,
    cleanCode,
    cleanName,
    Number(department_id),
    cleanSemester,
    cleanDescription || null
  );

  await logAudit(req.user.id, 'CREATE_COURSE', 'COURSE', result.insertId, {
    code: cleanCode,
    name: cleanName
  });

  res.status(201).json({
    success: true,
    message: 'Course created successfully.',
    courseId: result.insertId
  });
}));

// PUT /api/admin/courses/:id
router.put('/courses/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const courseId = Number(req.params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ error: 'Invalid course ID.' });
  }

  const { code, name, department_id, semester, description } = req.body;

  const cleanCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanSemester = typeof semester === 'string' ? semester.trim() : '';
  const cleanDescription = typeof description === 'string' ? description.trim() : '';

  if (!cleanCode || !cleanName || !department_id || !cleanSemester) {
    return res.status(400).json({
      error: 'Course code, name, department, and semester are required.'
    });
  }

  if (cleanCode.length > 50 || cleanName.length > 255 || cleanSemester.length > 100) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length.' });
  }

  const currentCourse = await query.get(
    'SELECT id FROM courses WHERE id = ?',
    courseId
  );

  if (!currentCourse) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  const department = await query.get(
    'SELECT id FROM departments WHERE id = ?',
    department_id
  );

  if (!department) {
    return res.status(400).json({ error: 'Selected department does not exist.' });
  }

  const duplicate = await query.get(
    'SELECT id FROM courses WHERE code = ? AND id <> ?',
    cleanCode,
    courseId
  );

  if (duplicate) {
    return res.status(409).json({ error: 'Another course already uses this code.' });
  }

  await query.run(
    `UPDATE courses
     SET code = ?, name = ?, department_id = ?, semester = ?, description = ?
     WHERE id = ?`,
    cleanCode,
    cleanName,
    Number(department_id),
    cleanSemester,
    cleanDescription || null,
    courseId
  );

  await logAudit(req.user.id, 'UPDATE_COURSE', 'COURSE', courseId, {
    code: cleanCode,
    name: cleanName
  });

  res.json({ success: true, message: 'Course updated successfully.' });
}));

// DELETE /api/admin/courses/:id
router.delete('/courses/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), asyncRoute(async (req, res) => {
  const courseId = Number(req.params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ error: 'Invalid course ID.' });
  }

  const course = await query.get(
    'SELECT id, code, name FROM courses WHERE id = ?',
    courseId
  );

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  const resourceCount = await query.get(
    'SELECT COUNT(*) AS count FROM posts WHERE course_id = ?',
    courseId
  );

  if (Number(resourceCount?.count || 0) > 0) {
    return res.status(409).json({
      error: `This course has ${resourceCount.count} associated posts/resources. Remove or reassign them before deleting the course.`
    });
  }

  await query.run('DELETE FROM courses WHERE id = ?', courseId);

  await logAudit(req.user.id, 'DELETE_COURSE', 'COURSE', courseId, {
    code: course.code,
    name: course.name
  });

  res.json({ success: true, message: 'Course deleted successfully.' });
}));


export default router;
