import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDatabase } from "./db.js";

const roles = new Set(["admin", "employee", "inventory", "user"]);

export function assertRole(role) {
  if (!roles.has(role)) throw new Error("Invalid role");
}

export function createAccessToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  return jwt.sign(
    { role: user.role, email: user.email },
    secret,
    { subject: user._id.toString(), expiresIn: "30m", issuer: "te-lo-llevo-api", audience: "te-lo-llevo-web" },
  );
}

export async function requireAuth(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "te-lo-llevo-api",
      audience: "te-lo-llevo-web",
    });
    const userId = new ObjectId(payload.sub);
    const user = await getDatabase().collection("users").findOne(
      { _id: userId },
      { projection: { passwordHash: 0 } },
    );
    if (!user || !user.active) return res.status(401).json({ message: "This account is unavailable." });
    req.auth = { userId, role: user.role, email: user.email };
    req.currentUser = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }
    return next();
  };
}

export async function loadCurrentUser(req, res, next) {
  try {
    if (req.currentUser) return next();
    const user = await getDatabase().collection("users").findOne(
      { _id: req.auth.userId },
      { projection: { passwordHash: 0 } },
    );
    if (!user || !user.active) return res.status(401).json({ message: "This account is unavailable." });
    req.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}
