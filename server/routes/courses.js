import { Router } from "express";
import { query, asyncRoute } from "../db/index.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

const studentOnly = [verifyToken, requireRole(["STUDENT"])];

// GET /api/courses/enrolled
router.get(
  "/enrolled",
  ...studentOnly,
  asyncRoute(async (req, res) => {
    const courses = await query.all(
      `
    SELECT
      c.id,
      c.code,
      c.name,
      c.semester,
      c.description,
      d.name AS department_name,
      ce.enrolled_at
    FROM course_enrollments ce
    JOIN courses c ON c.id = ce.course_id
    LEFT JOIN departments d ON d.id = c.department_id
    WHERE ce.user_id = ?
    ORDER BY ce.enrolled_at DESC
  `,
      req.user.id,
    );

    res.json({ courses });
  }),
);

// POST /api/courses/:id/enroll
router.post(
  "/:id/enroll",
  ...studentOnly,
  asyncRoute(async (req, res) => {
    const courseId = Number(req.params.id);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({ error: "Invalid course ID." });
    }

    const course = await query.get(
      "SELECT id FROM courses WHERE id = ?",
      courseId,
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    try {
      await query.run(
        `
      INSERT INTO course_enrollments (user_id, course_id)
      VALUES (?, ?)
    `,
        req.user.id,
        courseId,
      );

      res.status(201).json({
        message: "Successfully enrolled in course.",
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "You are already enrolled in this course.",
        });
      }

      throw error;
    }
  }),
);

// DELETE /api/courses/:id/enroll
router.delete(
  "/:id/enroll",
  ...studentOnly,
  asyncRoute(async (req, res) => {
    const courseId = Number(req.params.id);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({ error: "Invalid course ID." });
    }

    const result = await query.run(
      `
    DELETE FROM course_enrollments
    WHERE user_id = ? AND course_id = ?
  `,
      req.user.id,
      courseId,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "You are not enrolled in this course.",
      });
    }

    res.json({ message: "Successfully unenrolled from course." });
  }),
);

// GET /api/courses
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const courses = await query.all(`
    SELECT
      c.id,
      c.code,
      c.name,
      c.semester,
  
      c.description,
      d.name AS department_name,
      d.code AS department_code,
      (SELECT COUNT(*) FROM posts WHERE course_id = c.id)
        AS resources_count
    FROM courses c
    JOIN departments d ON c.department_id = d.id
    ORDER BY c.code ASC
  `);

    res.json({ courses });
  }),
);

// GET /api/courses/:code
router.get(
  "/:code",
  asyncRoute(async (req, res) => {
    const code = req.params.code.toUpperCase();

    const course = await query.get(
      `
    SELECT
      c.id,
      c.code,
      c.name,
      c.semester,
      c.instructor_name,
      c.instructor_title,
      c.description,
      d.name AS department_name,
      d.code AS department_code
    FROM courses c
    JOIN departments d ON c.department_id = d.id
    WHERE c.code = ?
  `,
      code,
    );

    if (!course) {
      return res.status(404).json({
        error: `Course ${code} not found.`,
      });
    }

 
    const resources = await query.all(
      `
      SELECT
        p.id,
        p.title,
        p.content,
        p.type,
        p.tags,
        p.created_at,
        u.name AS author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.course_id = ?
      ORDER BY p.created_at DESC
      LIMIT 50
      `,
      course.id,
    );

    const resourceIds = resources.map((r) => r.id);
    let attachments = [];

    if (resourceIds.length > 0) {
      const placeholders = resourceIds.map(() => "?").join(",");

      attachments = await query.all(
        `
        SELECT id, post_id, file_name, file_size, file_type
        FROM attachments
        WHERE post_id IN (${placeholders})
        ORDER BY id ASC
        `,
        ...resourceIds,
      );
    }

    const attachmentMap = new Map();

    for (const file of attachments) {
      if (!attachmentMap.has(file.post_id)) {
        attachmentMap.set(file.post_id, []);
      }

      attachmentMap.get(file.post_id).push({
        id: file.id,
        name: file.file_name,
        size: file.file_size,
        type: file.file_type,
        url: `/api/posts/attachments/${file.id}/download`,
      });
    }

    res.json({
      course,
      resources: resources.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        type: r.type,
        tags: r.tags,
        author: r.author_name,
        createdAt: r.created_at,
        attachments: attachmentMap.get(r.id) || [],
      })),
    });


    res.json({
      course,
      resources: resources.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        author: r.author_name,
        fileType: r.file_type || "PDF",
        createdAt: r.created_at,
      })),
    });
  }),
);

export default router;
