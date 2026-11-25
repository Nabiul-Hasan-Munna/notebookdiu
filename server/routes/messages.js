import { Router } from 'express';
import { query, pool, asyncRoute } from '../db/index.js';
import { unlink } from "node:fs/promises";
import { upload, UPLOAD_DIR } from "../middleware/upload.js";
import { basename, join } from "node:path";
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

// Temporary in-memory typing status (no database required)
const typingUsers = new Map();

const TYPING_TIMEOUT = 4000;

// POST /api/messages/conversations/:id/typing
router.post('/conversations/:id/typing', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const conversationId = Number(req.params.id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: 'Invalid conversation ID.' });
  }

  const participant = await query.get(
    `SELECT id FROM conversation_participants
     WHERE conversation_id = ? AND user_id = ?`,
    conversationId, userId
  );

  if (!participant) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const key = `${conversationId}:${userId}`;

  if (req.body.isTyping) {
    typingUsers.set(key, Date.now());
  } else {
    typingUsers.delete(key);
  }

  res.json({ success: true });
}));

// GET /api/messages/conversations/:id/typing
router.get('/conversations/:id/typing', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const conversationId = Number(req.params.id);

  const participant = await query.get(
    `SELECT id FROM conversation_participants
     WHERE conversation_id = ? AND user_id = ?`,
    conversationId, userId
  );

  if (!participant) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const otherUsers = await query.all(
    `SELECT user_id FROM conversation_participants
     WHERE conversation_id = ? AND user_id != ?`,
    conversationId, userId
  );

  const now = Date.now();

  const isTyping = otherUsers.some(({ user_id }) => {
    const key = `${conversationId}:${user_id}`;
    const timestamp = typingUsers.get(key);

    if (!timestamp || now - timestamp > TYPING_TIMEOUT) {
      typingUsers.delete(key);
      return false;
    }

    return true;
  });

  res.json({ isTyping });
}));




// GET /api/messages/students?search=keyword
// Search active students to start a conversation.
router.get('/students', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const search = String(req.query.search || '').trim();

  if (search.length < 2) {
    return res.json({ students: [] });
  }

  const keyword = `%${search}%`;

  const students = await query.all(`
    SELECT
      id, name, email, student_id,
      department, batch, avatar_url
    FROM users
    WHERE id != ?
      AND status = 'ACTIVE'
      AND (
        name LIKE ?
        OR email LIKE ?
        OR student_id LIKE ?
      )
    ORDER BY name ASC
    LIMIT 20
  `, userId, keyword, keyword, keyword);

  res.json({ students });
}));


// GET /api/messages/conversations
// List the logged-in student's private conversations.
router.get('/conversations', asyncRoute(async (req, res) => {
  const userId = req.user.id;

  const conversations = await query.all(`
    SELECT
      c.id,
      c.type,
      c.created_at,
      c.updated_at,
      u.id AS other_user_id,
      u.name AS other_user_name,
      u.email AS other_user_email,
      u.student_id AS other_student_id,
      u.department AS other_user_department,
      u.batch AS other_user_batch,
      u.avatar_url AS other_user_avatar,
      (
        SELECT m.body
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.id DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT m.created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.id DESC
        LIMIT 1
      ) AS last_message_at,
      (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender_id != ?
          AND m.created_at > COALESCE(mine.last_read_at, '1970-01-01')
          AND m.deleted_at IS NULL
      ) AS unread_count
    FROM conversations c
    INNER JOIN conversation_participants mine
      ON mine.conversation_id = c.id
      AND mine.user_id = ?
    INNER JOIN conversation_participants other
      ON other.conversation_id = c.id
      AND other.user_id != ?
    INNER JOIN users u ON u.id = other.user_id
    WHERE c.type = 'DIRECT'
    ORDER BY COALESCE(c.updated_at, c.created_at) DESC
  `, userId, userId, userId);

  res.json({ conversations });
}));

// POST /api/messages/conversations
// Create or retrieve a direct conversation with another student.
router.post('/conversations', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const recipientId = Number(req.body.recipientId);

  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    return res.status(400).json({ error: 'A valid recipientId is required.' });
  }

  if (recipientId === userId) {
    return res.status(400).json({ error: 'You cannot start a conversation with yourself.' });
  }

  const recipient = await query.get(
    `SELECT id, name, email, student_id, department, batch, avatar_url
     FROM users
     WHERE id = ? AND status = 'ACTIVE'`,
    recipientId
  );

  if (!recipient) {
    return res.status(404).json({ error: 'Student not found or unavailable.' });
  }

  const firstId = Math.min(userId, recipientId);
  const secondId = Math.max(userId, recipientId);
  const directKey = `${firstId}:${secondId}`;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [conversationResult] = await connection.execute(
      `INSERT INTO conversations (type, direct_key, created_by)
       VALUES ('DIRECT', ?, ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [directKey, userId]
    );

    const conversationId = conversationResult.insertId;

    await connection.execute(
      `INSERT IGNORE INTO conversation_participants
       (conversation_id, user_id)
       VALUES (?, ?), (?, ?)`,
      [conversationId, userId, conversationId, recipientId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      conversation: {
        id: conversationId,
        type: 'DIRECT',
        other_user: recipient
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// GET /api/messages/conversations/:id/messages
// Only conversation participants can read messages.
// GET messages with attachments
router.get('/conversations/:id/messages', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const conversationId = Number(req.params.id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: 'Invalid conversation ID.' });
  }

  const participant = await query.get(
    `SELECT id FROM conversation_participants
     WHERE conversation_id = ? AND user_id = ?`,
    conversationId, userId
  );

  if (!participant) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  await query.run(
    `UPDATE conversation_participants
     SET last_read_at = CURRENT_TIMESTAMP
     WHERE conversation_id = ? AND user_id = ?`,
    conversationId, userId
  );

const messages = await query.all(
  `SELECT
      m.*,
      u.name AS sender_name,
      u.avatar_url AS sender_avatar,
      replied.body AS reply_to_body,
      replied.sender_id AS reply_to_sender_id,
      reply_sender.name AS reply_to_sender_name,
      CASE
        WHEN m.sender_id = ?
          AND other.last_read_at >= m.created_at
        THEN 1
        ELSE 0
      END AS is_read
   FROM messages m
   INNER JOIN users u ON u.id = m.sender_id
   LEFT JOIN conversation_participants other
     ON other.conversation_id = m.conversation_id
     AND other.user_id != ?
   LEFT JOIN messages replied
     ON replied.id = m.reply_to_message_id
   LEFT JOIN users reply_sender
     ON reply_sender.id = replied.sender_id
   WHERE m.conversation_id = ?
   ORDER BY m.id ASC
   LIMIT 200`,
  userId,
  userId,
  conversationId,
);

  for (const message of messages) {
    message.attachments = await query.all(
      `SELECT id, message_id, file_name, file_size, file_type
       FROM message_attachments
       WHERE message_id = ?`,
      message.id
    );

    message.attachments = message.attachments.map(file => ({
      ...file,
      download_url: `/api/messages/attachments/${file.id}`
    }));
  }

  res.json({ messages });
}));

// POST /api/messages/conversations/:id/messages
// Send a text message as the authenticated user.
// POST text message with multiple attachments
router.post(
  '/conversations/:id/messages',
  upload.array('attachments', 10),
  asyncRoute(async (req, res) => {
    const userId = req.user.id;
    const conversationId = Number(req.params.id);
    const body = typeof req.body.body === 'string'
      ? req.body.body.trim()
      : '';

    const files = req.files || [];

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: 'Invalid conversation ID.' });
    }

    if (!body && files.length === 0) {
      return res.status(400).json({
        error: 'Write a message or attach a file.'
      });
    }

    if (body.length > 5000) {
      return res.status(400).json({
        error: 'Message cannot exceed 5000 characters.'
      });
    }

    const participant = await query.get(
      `SELECT id FROM conversation_participants
       WHERE conversation_id = ? AND user_id = ?`,
      conversationId, userId
    );

    if (!participant) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const replyToMessageId = req.body.replyToMessageId
      ? Number(req.body.replyToMessageId)
      : null;

    if (
      replyToMessageId !== null &&
      (!Number.isInteger(replyToMessageId) || replyToMessageId <= 0)
    ) {
      return res.status(400).json({
        error: "Invalid reply message.",
      });
    }

    if (replyToMessageId !== null) {
      const originalMessage = await query.get(
        `SELECT id FROM messages
     WHERE id = ? AND conversation_id = ?`,
        replyToMessageId,
        conversationId,
      );

      if (!originalMessage) {
        return res.status(404).json({
          error: "Original message not found.",
        });
      }
    }

    const result = await query.run(
      `INSERT INTO messages
   (conversation_id, sender_id, body, reply_to_message_id)
   VALUES (?, ?, ?, ?)`,
      conversationId,
      userId,
      body,
      replyToMessageId,
    );

    for (const file of files) {
      await query.run(
        `INSERT INTO message_attachments
         (message_id, file_name, file_size, file_type, file_url)
         VALUES (?, ?, ?, ?, ?)`,
        result.insertId,
        file.originalname,
        file.size,
        file.mimetype,
        file.filename
      );
    }

    await query.run(
      `UPDATE conversations
       SET updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      conversationId
    );

   const message = await query.get(
     `SELECT
      m.*,
      u.name AS sender_name,
      u.avatar_url AS sender_avatar,
      replied.body AS reply_to_body,
      replied.sender_id AS reply_to_sender_id,
      reply_sender.name AS reply_to_sender_name
   FROM messages m
   INNER JOIN users u ON u.id = m.sender_id
   LEFT JOIN messages replied
      ON replied.id = m.reply_to_message_id
   LEFT JOIN users reply_sender
      ON reply_sender.id = replied.sender_id
   WHERE m.id = ?`,
     result.insertId,
   );

    message.attachments = await query.all(
      `SELECT id, message_id, file_name, file_size, file_type
       FROM message_attachments
       WHERE message_id = ?`,
      result.insertId
    );

    message.attachments = message.attachments.map(file => ({
      ...file,
      download_url: `/api/messages/attachments/${file.id}`
    }));

    res.status(201).json({
      success: true,
      message
    });
  })
);

// DELETE /api/messages/:id
// Users can permanently delete only their own messages.
router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const userId = req.user.id;
    const messageId = Number(req.params.id);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return res.status(400).json({
        error: "Invalid message ID.",
      });
    }

    const connection = await pool.getConnection();
    let attachmentFiles = [];

    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute(
        `SELECT id, conversation_id, sender_id
       FROM messages
       WHERE id = ?
       FOR UPDATE`,
        [messageId],
      );

      const message = rows[0];

      if (!message) {
        await connection.rollback();

        return res.status(404).json({
          error: "Message not found.",
        });
      }

      if (Number(message.sender_id) !== Number(userId)) {
        await connection.rollback();

        return res.status(403).json({
          error: "You can only delete your own messages.",
        });
      }

      const [participants] = await connection.execute(
        `SELECT id FROM conversation_participants
       WHERE conversation_id = ? AND user_id = ?`,
        [message.conversation_id, userId],
      );

      if (participants.length === 0) {
        await connection.rollback();

        return res.status(403).json({
          error: "Access denied.",
        });
      }

      const [attachments] = await connection.execute(
        `SELECT file_url
       FROM message_attachments
       WHERE message_id = ?`,
        [messageId],
      );

      attachmentFiles = attachments;

      await connection.execute(
        `DELETE FROM message_attachments
       WHERE message_id = ?`,
        [messageId],
      );

      await connection.execute(
        `DELETE FROM messages
       WHERE id = ? AND sender_id = ?`,
        [messageId, userId],
      );

      await connection.execute(
        `UPDATE conversations
       SET updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
        [message.conversation_id],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // Remove physical attachment files after successful database deletion.
    for (const attachment of attachmentFiles) {
      if (!attachment.file_url) continue;

      const storedName = basename(attachment.file_url);

      try {
        await unlink(join(UPLOAD_DIR, storedName));
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Attachment cleanup failed:", error);
        }
      }
    }

    res.json({
      success: true,
      message: "Message permanently deleted.",
    });
  }),
);
// GET attachment - conversation participants only
router.get('/attachments/:id', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const attachmentId = Number(req.params.id);

  if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
    return res.status(400).json({ error: 'Invalid attachment ID.' });
  }

  const attachment = await query.get(
    `SELECT a.file_name, a.file_type, a.file_url
     FROM message_attachments a
     INNER JOIN messages m ON m.id = a.message_id
     INNER JOIN conversation_participants cp
       ON cp.conversation_id = m.conversation_id
     WHERE a.id = ? AND cp.user_id = ?`,
    attachmentId, userId
  );

  if (!attachment) {
    return res.status(404).json({ error: 'Attachment not found.' });
  }

  const storedName = basename(attachment.file_url);
  const filePath = join(UPLOAD_DIR, storedName);

  res.setHeader(
    'Content-Type',
    attachment.file_type || 'application/octet-stream'
  );

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(attachment.file_name)}"`
  );

  res.sendFile(filePath, error => {
    if (error && !res.headersSent) {
      res.status(404).json({ error: 'File not found.' });
    }
  });
}));

export default router;
