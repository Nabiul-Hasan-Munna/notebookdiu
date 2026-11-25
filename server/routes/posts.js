
import { Router } from 'express';
import { query, asyncRoute, pool } from "../db/index.js";
import { canAccessPost } from "../middleware/postAccess.js";
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { upload, UPLOAD_DIR } from '../middleware/upload.js';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';

const router = Router();

const allowedPostTypes = [
  'Knowledge',
  'Resource',
  'Question',
  'Project',
  'Link',
  'Media',
  'Discussion'
];

function parseTags(tags) {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      return tags ? [tags] : [];
    }
  }

  return [];
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function getAttachments(postIds) {
  if (!postIds.length) return new Map();

  const placeholders = postIds.map(() => '?').join(',');

  const rows = await query.all(
    `SELECT id, post_id, file_name, file_size, file_type
     FROM attachments
     WHERE post_id IN (${placeholders})
     ORDER BY id ASC`,
    ...postIds
  );

  const attachmentMap = new Map();

  for (const row of rows) {
    if (!attachmentMap.has(row.post_id)) {
      attachmentMap.set(row.post_id, []);
    }

    attachmentMap.get(row.post_id).push({
      id: row.id,
      name: row.file_name,
      size: row.file_size,
      type: row.file_type,
      url: `/api/posts/attachments/${row.id}/download`
    });
  }

  return attachmentMap;
}

function formatPost(row, attachments = []) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    tags: parseTags(row.tags),
    helpfulCount: row.helpful_count,
    commentsCount: row.comments_count,
    hasLiked: Boolean(row.has_liked),
    isSaved: Boolean(row.is_saved),
    createdAt: row.created_at,
    author: {
      id: row.author_id,
      name: row.author_name,
      meta: `${row.author_department} â€¢ Batch ${row.author_batch}`,
      avatar: row.author_avatar
    },
    course: row.course_code
      ? { code: row.course_code, name: row.course_name }
      : null,
    attachments,
    attachment: attachments[0] || null
  };
}

// GET /api/posts - Browse Feed
router.get('/', optionalAuth, asyncRoute(async (req, res) => {
  const { course, type, search } = req.query;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const currentUserId = req.user ? req.user.id : 0;

  let sql = `
    SELECT
      p.id, p.type, p.title, p.content, p.tags,
      p.helpful_count, p.comments_count, p.created_at,
      u.id AS author_id, u.name AS author_name,
      u.department AS author_department, u.batch AS author_batch,
      u.avatar_url AS author_avatar,
      c.code AS course_code, c.name AS course_name,
      EXISTS(
        SELECT 1 FROM post_likes
        WHERE post_id = p.id AND user_id = ?
      ) AS has_liked,
      EXISTS(
        SELECT 1 FROM saved_posts
        WHERE post_id = p.id AND user_id = ?
      ) AS is_saved
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN courses c ON p.course_id = c.id
    WHERE p.status = 'PUBLISHED'
  `;

  const params = [currentUserId, currentUserId];

    if (course) {
    sql += ` AND c.code = ? AND p.course_id IS NOT NULL`;
    params.push(course);

    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user?.role)) {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required." });
      }

      sql += ` AND EXISTS (
        SELECT 1
        FROM course_enrollments ce
        WHERE ce.course_id = p.course_id
          AND ce.user_id = ?
      )`;
      params.push(req.user.id);
    }
  } else {
    sql += ` AND p.course_id IS NULL`;
  }

  if (type && type !== 'all') {
    sql += ` AND LOWER(p.type) = LOWER(?)`;
    params.push(type);
  }

  if (search) {
    sql += ` AND (p.title LIKE ? OR p.content LIKE ? OR p.tags LIKE ?)`;
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }

  sql += ` ORDER BY p.created_at DESC LIMIT ?`;
  params.push(limit);

  const rows = await query.all(sql, ...params);

  const attachmentMap = await getAttachments(rows.map(row => row.id));

  const posts = rows.map(row =>
    formatPost(row, attachmentMap.get(row.id) || [])
  );

  res.json({ posts });
}));

// GET /api/posts/attachments/:id/download
// Authenticated attachment download
router.get('/attachments/:id/download', verifyToken, asyncRoute(async (req, res) => {
  const attachment = await query.get(
    'SELECT file_name, file_url FROM attachments WHERE id = ?',
    req.params.id
  );

    const access = await query.get(
      "SELECT post_id FROM attachments WHERE id = ?",
      req.params.id,
    );

    if (!access || !(await canAccessPost(req.user, access.post_id))) {
      return res.status(403).json({ error: "Access denied." });
    }

  if (!attachment || !attachment.file_url) {
    return res.status(404).json({ error: 'Attachment not found.' });
  }

  const storedFilename = basename(attachment.file_url);
  const filePath = join(UPLOAD_DIR, storedFilename);

  res.download(filePath, attachment.file_name, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ error: 'File could not be downloaded.' });
    }
  });
}));


// GET /api/posts/attachments/:id/preview
// Authenticated inline attachment preview

// GET /api/posts/attachments/:id/preview
// Authenticated inline attachment preview
router.get('/attachments/:id/preview', verifyToken, asyncRoute(async (req, res) => {
  const attachment = await query.get(
    'SELECT file_name, file_type, file_url FROM attachments WHERE id = ?',
    req.params.id
  );

  if (!attachment || !attachment.file_url) {
    return res.status(404).json({ error: 'Attachment not found.' });
  }

  // Check access to the parent post
  const access = await query.get(
    'SELECT post_id FROM attachments WHERE id = ?',
    req.params.id
  );

  if (!access || !(await canAccessPost(req.user, access.post_id))) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const isImage = attachment.file_type?.startsWith('image/');
  const isPDF = attachment.file_type === 'application/pdf';

  if (!isImage && !isPDF) {
    return res.status(400).json({
      error: 'This attachment type cannot be previewed.'
    });
  }

  const storedFilename = basename(attachment.file_url);
  const filePath = join(UPLOAD_DIR, storedFilename);

  res.type(attachment.file_type);
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ error: 'Image could not be previewed.' });
    }
  });
}));



// GET /api/posts/user/saved - Get Bookmarked Resources
// Keep this route before /:id.
router.get('/user/saved', verifyToken, asyncRoute(async (req, res) => {
  const sql = `
    SELECT
      p.id, p.type, p.title, p.tags, p.created_at,
      u.name AS author_name
    FROM saved_posts s
    JOIN posts p ON s.post_id = p.id
    JOIN users u ON p.author_id = u.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `;

  const rows = await query.all(sql, req.user.id);
  const attachmentMap = await getAttachments(rows.map(row => row.id));

  const items = rows.map(row => {
    const attachments = attachmentMap.get(row.id) || [];
    const firstAttachment = attachments[0] || null;

    return {
      id: row.id,
      title: row.title,
      author: row.author_name,
      type: row.type,
      fileType: firstAttachment?.type || 'PDF',
      fileName: firstAttachment?.name || null,
      fileSize: firstAttachment?.size || null,
      attachments,
      tags: parseTags(row.tags),
      createdAt: row.created_at
    };
  });

  res.json({ savedItems: items });
}));

// GET /api/posts/:id - Single Post Detail
router.get('/:id', optionalAuth, asyncRoute(async (req, res) => {
  const currentUserId = req.user ? req.user.id : 0;

  const sql = `
    SELECT
      p.id, p.type, p.title, p.content, p.tags,
      p.helpful_count, p.comments_count, p.created_at,
      u.id AS author_id, u.name AS author_name,
      u.department AS author_department, u.batch AS author_batch,
      u.avatar_url AS author_avatar,
      c.code AS course_code, c.name AS course_name,
      EXISTS(
        SELECT 1 FROM post_likes
        WHERE post_id = p.id AND user_id = ?
      ) AS has_liked,
      EXISTS(
        SELECT 1 FROM saved_posts
        WHERE post_id = p.id AND user_id = ?
      ) AS is_saved
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN courses c ON p.course_id = c.id
    WHERE p.id = ?
  `;

  const row = await query.get(
    sql,
    currentUserId,
    currentUserId,
    req.params.id
  );

  if (!row) {
    return res.status(404).json({ error: 'Post not found.' });
  }

    // Prevent unauthorized access to private course posts
  if (!(await canAccessPost(req.user, row.id))) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const attachmentMap = await getAttachments([row.id]);
  const post = formatPost(row, attachmentMap.get(row.id) || []);

  res.json({ post });
}));

// POST /api/posts - Create Post with Multiple Attachments
router.post(
  '/',
  verifyToken,
  upload.array('attachments', 10),
  asyncRoute(async (req, res) => {
console.log('[POST DEBUG] Request body:', req.body);
console.log('[POST DEBUG] Uploaded files:', req.files?.length || 0);
    const { title, content, type = "Knowledge", courseCode = null } = req.body;

    const tags = parseTags(req.body.tags);
    const files = req.files || [];

    if (!title?.trim() || !content?.trim()) {
      for (const file of files) {
        await unlink(file.path).catch(() => {});
      }

      return res.status(400).json({
        error: 'Post title and description are required.'
      });
    }

    if (!allowedPostTypes.includes(type)) {
      for (const file of files) {
        await unlink(file.path).catch(() => {});
      }

      return res.status(400).json({
        error: 'Invalid post type.'
      });
    }

    let postId = null;

    try {
      let courseId = null;

      if (courseCode) {
        const course = await query.get(
          'SELECT id FROM courses WHERE code = ?',
          courseCode
        );

        
        if (type === "Resource" && course) {
          courseId = course.id;
        }

        // Course resources require valid course enrollment.
        if (type === "Resource") {
          if (!course) {
            for (const file of files) {
              await unlink(file.path).catch(() => {});
            }

            return res.status(404).json({
              error: "Course not found.",
            });
          }

          const enrollment = await query.get(
            `SELECT id FROM course_enrollments
             WHERE user_id = ? AND course_id = ?`,
            req.user.id,
            course.id,
          );

          if (!enrollment) {
            for (const file of files) {
              await unlink(file.path).catch(() => {});
            }

            return res.status(403).json({
              error: "You must be enrolled in this course to upload resources.",
            });
          }
        }

      }

      const tagsJson = JSON.stringify(tags);

      const insertPost = await query.run(`
        INSERT INTO posts
          (author_id, course_id, type, title, content, tags)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        req.user.id,
        courseId,
        type,
        title.trim(),
        content.trim(),
        tagsJson
      );

      postId = insertPost.lastInsertRowid;

      // Insert all uploaded files.
      for (const file of files) {
        await query.run(`
          INSERT INTO attachments
            (post_id, file_name, file_size, file_type, file_url)
          VALUES (?, ?, ?, ?, ?)
        `,
          postId,
          file.originalname,
          formatFileSize(file.size),
          file.mimetype,
          file.filename
        );
      }

      // Preserve support for older JSON-based single attachments.
      if (files.length === 0 && req.body.attachment) {
        let attachment = req.body.attachment;

        if (typeof attachment === 'string') {
          try {
            attachment = JSON.parse(attachment);
          } catch {
            attachment = null;
          }
        }

        if (attachment?.name) {
          await query.run(`
            INSERT INTO attachments
              (post_id, file_name, file_size, file_type, file_url)
            VALUES (?, ?, ?, ?, ?)
          `,
            postId,
            attachment.name,
            attachment.size || '1.0 MB',
            attachment.type || 'PDF',
            attachment.url || ''
          );
        }
      }

      await query.run(
        'UPDATE users SET knowledge_points = knowledge_points + 10 WHERE id = ?',
        req.user.id
      );

      res.status(201).json({
        message: 'Post published successfully!',
        postId,
        attachmentCount: files.length
      });
    } catch (error) {
      // Remove uploaded files if post creation fails.
      for (const file of files) {
        await unlink(file.path).catch(() => {});
      }

      // Remove the incomplete post and its attachment records.
      if (postId) {
        await query.run('DELETE FROM posts WHERE id = ?', postId).catch(() => {});
      }

      throw error;
    }
  })
);


// DELETE /api/posts/:id - Delete Own Post
router.delete('/:id', verifyToken, asyncRoute(async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: 'Invalid post ID.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [posts] = await connection.execute(
      'SELECT id, author_id FROM posts WHERE id = ? FOR UPDATE',
      [postId]
    );

    if (!posts.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (Number(posts[0].author_id) !== Number(userId)) {
      await connection.rollback();
      return res.status(403).json({
        error: 'You are not allowed to delete this post.'
      });
    }

    const [attachments] = await connection.execute(
      'SELECT file_url FROM attachments WHERE post_id = ?',
      [postId]
    );

    await connection.execute(
      'DELETE FROM posts WHERE id = ? AND author_id = ?',
      [postId, userId]
    );

    await connection.commit();

    for (const attachment of attachments) {
      const filename = basename(attachment.file_url || '');

      if (filename) {
        await unlink(join(UPLOAD_DIR, filename)).catch(() => {});
      }
    }

    return res.json({
      message: 'Post deleted successfully!',
      postId
    });

  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}));


// PUT /api/posts/:id - Edit Existing Post
router.put(
  '/:id',
  verifyToken,
  upload.array('attachments', 10),
  asyncRoute(async (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.user.id;
    const files = req.files || [];

    const cleanupFiles = async () => {
      for (const file of files) {
        await unlink(file.path).catch(() => {});
      }
    };

    const {
      title,
      content,
      type,
      courseCode
    } = req.body;

    const tags = parseTags(req.body.tags);

    if (!Number.isInteger(postId) || postId <= 0) {
      await cleanupFiles();
      return res.status(400).json({ error: 'Invalid post ID.' });
    }

    if (!title?.trim() || !content?.trim()) {
      await cleanupFiles();
      return res.status(400).json({
        error: 'Post title and description are required.'
      });
    }

    if (!allowedPostTypes.includes(type)) {
      await cleanupFiles();
      return res.status(400).json({
        error: 'Invalid post type.'
      });
    }

    let connection;

    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Check post ownership.
      const [posts] = await connection.execute(
        'SELECT id, author_id FROM posts WHERE id = ? FOR UPDATE',
        [postId]
      );

      if (!posts.length) {
        await connection.rollback();
        await cleanupFiles();
        return res.status(404).json({ error: 'Post not found.' });
      }

      if (Number(posts[0].author_id) !== Number(userId)) {
        await connection.rollback();
        await cleanupFiles();
        return res.status(403).json({
          error: 'You are not allowed to edit this post.'
        });
      }

      // Find the selected course.
      let courseId = null;

      if (courseCode?.trim()) {
        const [courses] = await connection.execute(
          'SELECT id FROM courses WHERE code = ?',
          [courseCode.trim()]
        );

        if (courses.length) {
          courseId = courses[0].id;
        }
      }

      // Update post information.
      await connection.execute(
        `UPDATE posts
         SET title = ?, content = ?, type = ?, course_id = ?, tags = ?
         WHERE id = ? AND author_id = ?`,
        [
          title.trim(),
          content.trim(),
          type,
          courseId,
          JSON.stringify(tags),
          postId,
          userId
        ]
      );

      // Add newly uploaded attachments.
      // Existing attachments remain untouched.
      for (const file of files) {
        await connection.execute(
          `INSERT INTO attachments
            (post_id, file_name, file_size, file_type, file_url)
           VALUES (?, ?, ?, ?, ?)`,
          [
            postId,
            file.originalname,
            formatFileSize(file.size),
            file.mimetype,
            file.filename
          ]
        );
      }

      await connection.commit();

      res.json({
        message: 'Post updated successfully!',
        postId,
        attachmentCount: files.length
      });

    } catch (error) {
      if (connection) {
        await connection.rollback().catch(() => {});
      }

      await cleanupFiles();
      throw error;

    } finally {
      if (connection) {
        connection.release();
      }
    }
  })
);

// POST /api/posts/:id/helpful - Toggle Helpful Upvote

// POST /api/posts/:id/helpful - Toggle Helpful Upvote
router.post('/:id/helpful', verifyToken, asyncRoute(async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  const post = await query.get(
    'SELECT id, author_id FROM posts WHERE id = ?',
    postId
  );

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const existing = await query.get(
    'SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?',
    userId,
    postId
  );

  // Remove helpful reaction.
  if (existing) {
    await query.run(
      'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
      userId,
      postId
    );

    await query.run(
      'UPDATE posts SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = ?',
      postId
    );

    await query.run(`
      UPDATE users
      SET knowledge_points = GREATEST(0, knowledge_points - 5)
      WHERE id = ?
    `, post.author_id);

    const updated = await query.get(
      'SELECT helpful_count FROM posts WHERE id = ?',
      postId
    );

    return res.json({
      hasLiked: false,
      helpfulCount: updated.helpful_count
    });
  }

  // Add helpful reaction.
  await query.run(
    'INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)',
    userId,
    postId
  );

  await query.run(
    'UPDATE posts SET helpful_count = helpful_count + 1 WHERE id = ?',
    postId
  );

  await query.run(
    'UPDATE users SET knowledge_points = knowledge_points + 5 WHERE id = ?',
    post.author_id
  );

  // Notify post owner, excluding self-reactions.
  if (post.author_id !== userId) {
    await query.run(`
      INSERT INTO notifications
        (user_id, actor_id, post_id, type, message)
      VALUES (?, ?, ?, 'HELPFUL', ?)
    `,
      post.author_id,
      userId,
      postId,
      'marked your post as helpful'
    );
  }

  const updated = await query.get(
    'SELECT helpful_count FROM posts WHERE id = ?',
    postId
  );

  res.json({
    hasLiked: true,
    helpfulCount: updated.helpful_count
  });
}));


// POST /api/posts/:id/save - Toggle Save Bookmark
router.post('/:id/save', verifyToken, asyncRoute(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const existing = await query.get(
    'SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?',
    userId,
    postId
  );

  if (existing) {
    await query.run(
      'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?',
      userId,
      postId
    );

    return res.json({
      isSaved: false,
      message: 'Removed from saved resources.'
    });
  }

  await query.run(
    'INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)',
    userId,
    postId
  );

  res.json({
    isSaved: true,
    message: 'Saved to your personal resources! ðŸ”–'
  });
}));

export default router;


