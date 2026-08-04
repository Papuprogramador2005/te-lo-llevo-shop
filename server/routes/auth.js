import { Router } from "express";
import bcrypt from "bcryptjs";
import { createAccessToken, publicUser, requireAuth, loadCurrentUser } from "../auth.js";
import { getDatabase } from "../db.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration({ fullName, email, password }) {
  if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
    return "Enter a name between 2 and 100 characters.";
  }
  if (typeof email !== "string" || !emailPattern.test(email.trim()) || email.length > 255) {
    return "Enter a valid email address.";
  }
  if (typeof password !== "string" || password.length < 12 || password.length > 72) {
    return "Your password must contain between 12 and 72 characters.";
  }
  return null;
}

router.post("/register", async (req, res, next) => {
  try {
    const validationError = validateRegistration(req.body ?? {});
    if (validationError) return res.status(400).json({ message: validationError });

    const fullName = req.body.fullName.trim();
    const email = req.body.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = {
      fullName,
      email,
      passwordHash,
      role: "user",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await getDatabase().collection("users").insertOne(user);
    user._id = result.insertedId;
    return res.status(201).json({ token: createAccessToken(user), user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "An account already exists with that email." });
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const user = await getDatabase().collection("users").findOne({ email });
    const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !user.active || !validPassword) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    return res.json({ token: createAccessToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, loadCurrentUser, (req, res) => res.json({ user: publicUser(req.currentUser) }));

export default router;
