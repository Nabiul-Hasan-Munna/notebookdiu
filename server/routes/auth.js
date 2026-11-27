import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomInt } from "crypto";
import { query, asyncRoute } from "../db/index.js";
import { JWT_SECRET, verifyToken } from "../middleware/auth.js";
import { sendVerificationEmail } from "../services/email.js";

const router = Router();

const hashCode = (code) =>
  createHash("sha256").update(String(code)).digest("hex");

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student_id,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

// POST /api/auth/login
router.post(
  "/login",
  asyncRoute(async (req, res) => {
    const { emailOrStudentId, password } = req.body;

    if (!emailOrStudentId || !password) {
      return res.status(400).json({
        error: "Please provide student ID or email, and password.",
      });
    }

    const identifier = emailOrStudentId.trim();

    const user = await query.get(
      "SELECT * FROM users WHERE email = ? OR student_id = ?",
      identifier.toLowerCase(),
      identifier,
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid university credentials." });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        error: "Your account is suspended. Contact the DIU administrator.",
      });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const token = createToken(user);
    const { password_hash, ...sanitizedUser } = user;

    return res.json({
      message: "Login successful",
      token,
      user: sanitizedUser,
    });
  }),
);

// POST /api/auth/register
// Creates a pending registration and emails a verification code.
router.post(
  "/register",
  asyncRoute(async (req, res) => {
    const { name, email, studentId, password, department, batch } = req.body;

    if (!name?.trim() || !email?.trim() || !studentId?.trim() || !password) {
      return res.status(400).json({
        error:
          "All fields (Name, DIU Email, Student ID, Password) are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = studentId.trim();

    if (!cleanEmail.endsWith("@diu.edu.bd")) {
      return res.status(400).json({
        error:
          "Registration is restricted to official DIU emails (@diu.edu.bd).",
      });
    }

    const existing = await query.get(
      "SELECT id FROM users WHERE email = ? OR student_id = ?",
      cleanEmail,
      cleanStudentId,
    );

    if (existing) {
      return res.status(409).json({
        error:
          "A student account with this email or Student ID already exists.",
      });
    }

    const pending = await query.get(
      "SELECT email, student_id FROM pending_registrations WHERE email = ? OR student_id = ?",
      cleanEmail,
      cleanStudentId,
    );

    if (
      pending &&
      (pending.email !== cleanEmail || pending.student_id !== cleanStudentId)
    ) {
      return res.status(409).json({
        error:
          "This email or Student ID is already being used in another pending registration.",
      });
    }

    const code = String(randomInt(100000, 1000000));
    const passwordHash = bcrypt.hashSync(password, 10);

    await query.run(
      "DELETE FROM pending_registrations WHERE email = ? OR student_id = ?",
      cleanEmail,
      cleanStudentId,
    );

    await query.run(
      `
    INSERT INTO pending_registrations
      (name, email, student_id, password_hash, department, batch,
       avatar_url, code_hash, expires_at, attempts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
  `,
      name.trim(),
      cleanEmail,
      cleanStudentId,
      passwordHash,
      department || "Software Engineering",
      batch || "43",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      hashCode(code),
    );

    try {
      await sendVerificationEmail(cleanEmail, code, name.trim());
    } catch (error) {
      await query.run(
        "DELETE FROM pending_registrations WHERE email = ?",
        cleanEmail,
      );
      console.error("Verification email failed:", error.message);

      return res.status(502).json({
        error:
          "Could not send the verification email. Please try registering again.",
      });
    }

    return res.status(201).json({
      message: "Verification code sent to your DIU email.",
      email: cleanEmail,
    });
  }),
);

// POST /api/auth/verify-registration
router.post(
  "/verify-registration",
  asyncRoute(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const code = String(req.body.code || "").trim();

    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: "Please provide your email and the six-digit verification code.",
      });
    }

    const pending = await query.get(
      "SELECT * FROM pending_registrations WHERE email = ?",
      email,
    );

    if (!pending) {
      return res.status(404).json({
        error: "No pending registration found. Please register again.",
      });
    }

    if (new Date(pending.expires_at).getTime() <= Date.now()) {
      await query.run(
        "DELETE FROM pending_registrations WHERE email = ?",
        email,
      );
      return res.status(400).json({
        error: "Verification code expired. Please register again.",
      });
    }

    if (pending.attempts >= 5) {
      return res.status(429).json({
        error: "Too many incorrect attempts. Please request a new code.",
      });
    }

    if (hashCode(code) !== pending.code_hash) {
      await query.run(
        "UPDATE pending_registrations SET attempts = attempts + 1 WHERE email = ?",
        email,
      );
      return res.status(400).json({
        error: "Incorrect verification code.",
      });
    }

    const existing = await query.get(
      "SELECT id FROM users WHERE email = ? OR student_id = ?",
      pending.email,
      pending.student_id,
    );

    if (existing) {
      await query.run(
        "DELETE FROM pending_registrations WHERE email = ?",
        email,
      );
      return res.status(409).json({
        error: "An account with this email or Student ID already exists.",
      });
    }

    await query.run(
      `
    INSERT INTO users
      (name, email, student_id, password_hash, role, department,
       batch, avatar_url, knowledge_points)
    VALUES (?, ?, ?, ?, 'STUDENT', ?, ?, ?, 10)
  `,
      pending.name,
      pending.email,
      pending.student_id,
      pending.password_hash,
      pending.department,
      pending.batch,
      pending.avatar_url,
    );

    const newUser = await query.get(
      `SELECT id, name, email, student_id, role, department, batch,
            avatar_url, knowledge_points, status
     FROM users WHERE email = ?`,
      email,
    );

    await query.run("DELETE FROM pending_registrations WHERE email = ?", email);

    return res.status(201).json({
      message: "Email verified! Your UniverseDIU account is ready.",
      token: createToken(newUser),
      user: newUser,
    });
  }),
);

// POST /api/auth/resend-verification
router.post(
  "/resend-verification",
  asyncRoute(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const pending = await query.get(
      "SELECT * FROM pending_registrations WHERE email = ?",
      email,
    );

    if (!pending) {
      return res.status(404).json({
        error: "No pending registration found. Please register again.",
      });
    }

    const code = String(randomInt(100000, 1000000));

    await query.run(
      `
    UPDATE pending_registrations
    SET code_hash = ?,
        expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
        attempts = 0
    WHERE email = ?
  `,
      hashCode(code),
      email,
    );

    try {
      await sendVerificationEmail(email, code, pending.name);
    } catch (error) {
      console.error("Resend verification email failed:", error.message);
      return res.status(502).json({
        error: "Could not send the verification email. Please try again.",
      });
    }

    return res.json({ message: "A new verification code has been sent." });
  }),
);

// GET /api/auth/me
router.get('/me', verifyToken, asyncRoute(async (req, res) => {
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
