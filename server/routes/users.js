import { Router } from "express";
import { ObjectId } from "mongodb";
import { assertRole, publicUser, requireAuth, requireRoles } from "../auth.js";
import { getDatabase } from "../db.js";

const router = Router();

router.get("/", requireAuth, requireRoles("admin"), async (_req, res, next) => {
  try {
    const users = await getDatabase().collection("users").find(
      {},
      { projection: { passwordHash: 0 } },
    ).sort({ createdAt: -1 }).toArray();
    return res.json({ users: users.map(publicUser) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/role", requireAuth, requireRoles("admin"), async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid user id." });
    assertRole(req.body?.role);
    const userId = new ObjectId(req.params.id);
    if (userId.equals(req.auth.userId) && req.body.role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own administrator role." });
    }
    const user = await getDatabase().collection("users").findOneAndUpdate(
      { _id: userId },
      { $set: { role: req.body.role, updatedAt: new Date() } },
      { projection: { passwordHash: 0 }, returnDocument: "after" },
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return error.message === "Invalid role" ? res.status(400).json({ message: "Invalid role." }) : next(error);
  }
});

export default router;
