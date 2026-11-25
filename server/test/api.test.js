import { app } from '../index.js';
import { initDatabase, closeDatabase } from '../db/index.js';
import http from 'node:http';

async function runTests() {
  await initDatabase();
  console.log('\n======================================================');
  console.log('🧪 Starting UniverseDIU Automated API & Auth Test Suite');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:5099/api';

  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${desc} - ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    await assert('GET /health returns status ok', async () => {
      const res = await fetch(`${baseUrl}/health`);
      const data = await res.json();
      if (res.status !== 200 || data.status !== 'ok') throw new Error(`Status ${res.status}`);
    });

    // 2. Student Login
    let studentToken = '';
    await assert('POST /auth/login with valid student credentials succeeds', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrStudentId: 'student@diu.edu.bd', password: 'password123' })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.token) throw new Error(data.error || 'No token');
      studentToken = data.token;
      if (data.user.role !== 'STUDENT') throw new Error('Role mismatch');
    });

    // 3. Invalid credentials
    await assert('POST /auth/login with bad password returns 401', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrStudentId: 'student@diu.edu.bd', password: 'wrongpassword' })
      });
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    });

    // 4. Admin Login
    let adminToken = '';
    await assert('POST /auth/login with admin credentials succeeds with ADMIN role', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrStudentId: 'admin@diu.edu.bd', password: 'admin123' })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.token) throw new Error(data.error || 'No token');
      adminToken = data.token;
      if (data.user.role !== 'ADMIN') throw new Error(`Expected ADMIN, got ${data.user.role}`);
    });

    // 5. Feed Posts
    let testPostId = null;
    await assert('GET /posts returns published community posts with attachments', async () => {
      const res = await fetch(`${baseUrl}/posts`);
      const data = await res.json();
      if (res.status !== 200 || !Array.isArray(data.posts) || data.posts.length === 0) {
        throw new Error('No posts returned');
      }
      testPostId = data.posts[0].id;
      if (!data.posts[0].title || !data.posts[0].author) throw new Error('Missing fields');
    });

    // 6. Helpful Like toggle
    await assert('POST /posts/:id/helpful increments helpful count', async () => {
      const res = await fetch(`${baseUrl}/posts/${testPostId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      });
      const data = await res.json();
      if (res.status !== 200 || typeof data.helpfulCount !== 'number') {
        throw new Error('Helpful toggle failed');
      }
    });

    // 7. Add Comment
    await assert('POST /comments/post/:id creates a new comment', async () => {
      const res = await fetch(`${baseUrl}/comments/post/${testPostId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ content: 'Automated test verification comment!' })
      });
      const data = await res.json();
      if (res.status !== 201 || !data.comment) throw new Error('Failed to create comment');
    });

    // 8. Courses
    await assert('GET /courses/SE-322 returns course info & resources', async () => {
      const res = await fetch(`${baseUrl}/courses/SE-322`);
      const data = await res.json();
      if (res.status !== 200 || data.course.code !== 'SE-322') throw new Error('Course mismatch');
    });

    // 9. RBAC Protection: Student blocked from Admin API
    await assert('GET /admin/stats rejects student with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
    });

    // 10. Admin allowed to access Admin stats
    await assert('GET /admin/stats allows admin and returns real KPIs', async () => {
      const res = await fetch(`${baseUrl}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.status !== 200 || !data.kpis || typeof data.kpis.totalStudents !== 'number') {
        throw new Error('Invalid KPI payload');
      }
    });

    // 11. Admin Moderation Queue
    await assert('GET /admin/reports returns flagged content for moderation', async () => {
      const res = await fetch(`${baseUrl}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.status !== 200 || !Array.isArray(data.reports)) {
        throw new Error('Reports queue fetch failed');
      }
    });

  } finally {
    server.close();
  await closeDatabase();
    console.log('\n------------------------------------------------------');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('------------------------------------------------------\n');
    if (failed > 0) process.exit(1);
  }
}

runTests();
