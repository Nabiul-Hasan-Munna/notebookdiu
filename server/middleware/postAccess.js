import { query } from "../db/index.js";

export async function canAccessPost(user, postId) {
  const post = await query.get(
    `SELECT id, course_id FROM posts WHERE id = ?`,
    postId,
  );

  if (!post) return false;

  // Public posts are accessible to everyone.
  if (!post.course_id) return true;

  // Private course posts require authentication.
  if (!user) return false;

  // Admins can access all course posts.
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return true;
  }

  // Other users must be enrolled.
  const enrollment = await query.get(
    `SELECT id FROM course_enrollments
     WHERE user_id = ? AND course_id = ?`,
    user.id,
    post.course_id,
  );

  return !!enrollment;
}
