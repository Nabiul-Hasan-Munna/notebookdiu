import { Router } from "express";
import { query, asyncRoute } from "../db/index.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

const getUserId = (req) =>
  req.user?.id ?? req.user?.userId ?? req.user?.user_id;

// GET /api/notifications
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const notifications = await query.all(
      `SELECT n.*, 
            u.name AS actor_name,
            u.avatar_url AS actor_avatar
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50`,
      userId,
    );

    res.json({ notifications });
  }),
);

// GET /api/notifications/unread-count
// GET /api/notifications/unread-count
router.get(
  "/unread-count",
  asyncRoute(async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rows = await query.all(
      `SELECT id FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      userId
    );

    const count = rows.length;

    console.log("[NOTIFICATIONS] Unread count:", count);

    return res
      .status(200)
      .set("Cache-Control", "no-store")
      .json({ count });
  })
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  asyncRoute(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await query.run(
      `UPDATE notifications
     SET is_read = 1
     WHERE id = ? AND user_id = ?`,
      Number(req.params.id),
      userId,
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  }),
);

// PATCH /api/notifications/read-all
router.patch(
  "/read-all",
  asyncRoute(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await query.run(
      `UPDATE notifications
     SET is_read = 1
     WHERE user_id = ? AND is_read = 0`,
      userId,
    );

    res.json({ success: true });
  }),
);

// DELETE /api/notifications/:id
router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await query.run(
      `DELETE FROM notifications
     WHERE id = ? AND user_id = ?`,
      Number(req.params.id),
      userId,
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  }),
);

export default router;
