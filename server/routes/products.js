import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, requireRoles } from "../auth.js";
import { getDatabase } from "../db.js";

const router = Router();

function publicProduct(product) {
  return { ...product, id: product._id.toString(), _id: undefined };
}

function productPayload(body) {
  const { name, description = "", category, imageUrl = "", unit = "pza", priceCents, stock = 0, active = true } = body ?? {};
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 140) throw new Error("Invalid product name.");
  if (typeof category !== "string" || !category.trim() || category.trim().length > 80) throw new Error("Invalid category.");
  if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > 10_000_000) throw new Error("Invalid price.");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Invalid stock.");
  if (typeof imageUrl !== "string" || imageUrl.length > 2_000) throw new Error("Invalid image URL.");
  return { name: name.trim(), description: String(description).trim(), category: category.trim(), imageUrl, unit: String(unit).trim(), priceCents, stock, active: Boolean(active), updatedAt: new Date() };
}

router.get("/", async (req, res, next) => {
  try {
    const products = await getDatabase().collection("products").find({ active: true }).sort({ category: 1, name: 1 }).toArray();
    return res.json({ products: products.map(publicProduct) });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, requireRoles("admin"), async (req, res, next) => {
  try {
    const product = { ...productPayload(req.body), createdAt: new Date() };
    const result = await getDatabase().collection("products").insertOne(product);
    product._id = result.insertedId;
    return res.status(201).json({ product: publicProduct(product) });
  } catch (error) {
    return error.message?.startsWith("Invalid") ? res.status(400).json({ message: error.message }) : next(error);
  }
});

router.patch("/:id", requireAuth, requireRoles("admin"), async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid product id." });
    const update = productPayload(req.body);
    const result = await getDatabase().collection("products").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
      { returnDocument: "after" },
    );
    if (!result) return res.status(404).json({ message: "Product not found." });
    return res.json({ product: publicProduct(result) });
  } catch (error) {
    return error.message?.startsWith("Invalid") ? res.status(400).json({ message: error.message }) : next(error);
  }
});

router.patch("/:id/stock", requireAuth, requireRoles("admin", "inventory"), async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id) || !Number.isInteger(req.body?.stock) || req.body.stock < 0) {
      return res.status(400).json({ message: "Invalid product id or stock." });
    }
    const product = await getDatabase().collection("products").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { stock: req.body.stock, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    return res.json({ product: publicProduct(product) });
  } catch (error) {
    return next(error);
  }
});

export default router;
