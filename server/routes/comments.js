import { Router } from "express";
import { query, asyncRoute } from "../db/index.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import { canAccessPost } from "../middleware/postAccess.js";

const router = Router();

// GET /api/comments/post/:postId - Get Threaded Comments
router.get(
  "/post/:postId",
  optionalAuth,
  asyncRoute(async (req, res) => {
    const postId = req.params.postId;

    if (!(await canAccessPost(req.user, postId))) {
      return res.status(403).json({ error: "You do not have access to this post." });
    }

    const sql = `
    SELECT
      c.id, c.content, c.parent_comment_id, c.helpful_count, c.created_at,
      u.id AS author_id, u.name AS author_name,
      u.department AS author_department,
      u.batch AS author_batch,
      u.avatar_url AS author_avatar,
      u.role AS author_role,
      (p.author_id = u.id) AS is_post_author
    FROM comments c
    JOIN users u ON c.author_id = u.id
    JOIN posts p ON c.post_id = p.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC, c.id ASC
  `;

    const rows = await query.all(sql, postId);
    const commentsMap = new Map();
    const rootComments = [];

    rows.forEach((r) => {
      commentsMap.set(r.id, {
        id: r.id,
        content: r.content,
        helpfulCount: r.helpful_count,
        createdAt: r.created_at,
        author: {
          id: r.author_id,
          name: r.author_name,
          meta: `${r.author_department} â€¢ Batch ${r.author_batch}`,
          avatar: r.author_avatar,
          role: r.author_role,
          isAuthor: Boolean(r.is_post_author),
        },
        replies: [],
      });
    });

    rows.forEach((r) => {
      const comment = commentsMap.get(r.id);

      if (r.parent_comment_id && commentsMap.has(r.parent_comment_id)) {
        commentsMap.get(r.parent_comment_id).replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    res.json({ comments: rootComments });
  }),
);

// POST /api/comments/post/:postId - Add Comment or Reply
router.post(
  "/post/:postId",
  verifyToken,
  asyncRoute(async (req, res) => {
    const postId = Number(req.params.postId);
    const userId = req.user.id;
    const { content, parentCommentId } = req.body;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ error: "Invalid post ID." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "Comment content cannot be empty.",
      });
    }

    // Find the post owner.
    const post = await query.get(
      "SELECT id, author_id FROM posts WHERE id = ?",
      postId,
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (!(await canAccessPost(req.user, postId))) {
      return res.status(403).json({ error: "You do not have access to this post." });
    }

    let recipientId = post.author_id;
    let notificationType = "COMMENT";
    let notificationMessage = "commented on your post";

    // If this is a reply, notify the parent comment's author.
    if (parentCommentId) {
      const parent = await query.get(
        `SELECT id, author_id
       FROM comments
       WHERE id = ? AND post_id = ?`,
        Number(parentCommentId),
        postId,
      );

      if (!parent) {
        return res.status(400).json({
          error: "Parent comment not found.",
        });
      }

      recipientId = parent.author_id;
      notificationType = "REPLY";
      notificationMessage = "replied to your comment";
    }

    const result = await query.run(
      `
    INSERT INTO comments (post_id, author_id, parent_comment_id, content)
    VALUES (?, ?, ?, ?)
  `,
      postId,
      userId,
      parentCommentId || null,
      content.trim(),
    );

    // Update post comment count.
    await query.run(
      "UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?",
      postId,
    );

    // Award knowledge points.
    await query.run(
      "UPDATE users SET knowledge_points = knowledge_points + 2 WHERE id = ?",
      userId,
    );

    // Create notification, excluding the user's own actions.
    if (recipientId !== userId) {
      await query.run(
        `
      INSERT INTO notifications
        (user_id, actor_id, post_id, comment_id, type, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
        recipientId,
        userId,
        postId,
        result.lastInsertRowid,
        notificationType,
        notificationMessage,
      );
    }

    const newComment = await query.get(
      `
    SELECT
      c.id, c.content, c.parent_comment_id, c.helpful_count, c.created_at,
      u.id AS author_id, u.name AS author_name,
      u.department AS author_department,
      u.batch AS author_batch,
      u.avatar_url AS author_avatar
    FROM comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.id = ?
  `,
      result.lastInsertRowid,
    );

    res.status(201).json({
      message: "Comment posted successfully!",
      comment: {
        id: newComment.id,
        content: newComment.content,
        helpfulCount: newComment.helpful_count,
        createdAt: newComment.created_at,
        author: {
          id: newComment.author_id,
          name: newComment.author_name,
          meta: `${newComment.author_department} â€¢ Batch ${newComment.author_batch}`,
          avatar: newComment.author_avatar,
        },
        replies: [],
      },
    });
  }),
);

export default router;


