import "dotenv/config";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { connectDatabase, closeDatabase, getDatabase } from "../db.js";

const [emailArgument, ...nameParts] = process.argv.slice(2);
const email = emailArgument?.trim().toLowerCase();
const fullName = nameParts.join(" ").trim();

if (!email || !fullName) {
  console.error("Usage: npm run create-admin -- admin@example.com \"Full Name\"");
  process.exit(1);
}

const input = createInterface({ input: stdin, output: stdout });
try {
  const password = await input.question("Administrator password (minimum 12 characters): ");
  if (password.length < 12 || password.length > 72) {
    throw new Error("The password must contain between 12 and 72 characters.");
  }
  await connectDatabase();
  const users = getDatabase().collection("users");
  const existingUser = await users.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);
  if (existingUser) {
    await users.updateOne({ _id: existingUser._id }, { $set: { fullName, passwordHash, role: "admin", active: true, updatedAt: new Date() } });
  } else {
    await users.insertOne({ fullName, email, passwordHash, role: "admin", active: true, createdAt: new Date(), updatedAt: new Date() });
  }
  console.log(`Admin account ready for ${email}`);
} finally {
  input.close();
  await closeDatabase();
}
