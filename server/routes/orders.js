import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, requireRoles } from "../auth.js";
import { getClient, getDatabase } from "../db.js";

const router = Router();
const statuses = new Set(["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"]);

function publicOrder(order) {
  return JSON.parse(JSON.stringify({ ...order, id: order._id.toString(), _id: undefined }));
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const filter = req.auth.role === "admin"
      ? {}
      : req.auth.role === "employee"
        ? { assignedEmployeeId: req.auth.userId }
        : { userId: req.auth.userId };
    const orders = await getDatabase().collection("orders").find(filter).sort({ createdAt: -1 }).toArray();
    return res.json({ orders: orders.map(publicOrder) });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  const session = getClient().startSession();
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ message: "Your cart is empty." });
    if (typeof req.body?.deliveryMethod !== "string" || typeof req.body?.paymentMethod !== "string") {
      return res.status(400).json({ message: "Delivery and payment methods are required." });
    }

    const itemQuantities = new Map();
    for (const item of items) {
      if (!ObjectId.isValid(item?.productId) || !Number.isInteger(item?.quantity) || item.quantity < 1 || item.quantity > 99) {
        return res.status(400).json({ message: "Your cart contains an invalid product." });
      }
      const id = item.productId;
      itemQuantities.set(id, (itemQuantities.get(id) ?? 0) + item.quantity);
    }

    const productIds = [...itemQuantities.keys()].map((id) => new ObjectId(id));
    let order;
    await session.withTransaction(async () => {
      const products = await getDatabase().collection("products").find(
        { _id: { $in: productIds }, active: true },
        { session },
      ).toArray();
      if (products.length !== productIds.length) throw new Error("One or more products are unavailable.");

      const orderItems = products.map((product) => {
        const quantity = itemQuantities.get(product._id.toString());
        if (product.stock < quantity) throw new Error(`${product.name} does not have enough stock.`);
        return { productId: product._id, name: product.name, imageUrl: product.imageUrl, unit: product.unit, quantity, unitPriceCents: product.priceCents, subtotalCents: product.priceCents * quantity };
      });
      const now = new Date();
      order = {
        userId: req.auth.userId,
        status: "pending",
        deliveryMethod: req.body.deliveryMethod,
        paymentMethod: req.body.paymentMethod,
        address: String(req.body.address ?? "").trim().slice(0, 500),
        notes: String(req.body.notes ?? "").trim().slice(0, 1_000),
        items: orderItems,
        totalCents: orderItems.reduce((total, item) => total + item.subtotalCents, 0),
        createdAt: now,
        updatedAt: now,
      };

      for (const item of orderItems) {
        const stockResult = await getDatabase().collection("products").updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session },
        );
        if (stockResult.modifiedCount !== 1) throw new Error(`${item.name} does not have enough stock.`);
      }

      const result = await getDatabase().collection("orders").insertOne(order, { session });
      order._id = result.insertedId;
    });
    return res.status(201).json({ order: publicOrder(order) });
  } catch (error) {
    return error.message?.includes("stock") || error.message?.includes("unavailable") ? res.status(400).json({ message: error.message }) : next(error);
  } finally {
    await session.endSession();
  }
});

router.patch("/:id/assign", requireAuth, requireRoles("admin"), async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body?.employeeId)) return res.status(400).json({ message: "Invalid order or employee id." });
    const employeeId = new ObjectId(req.body.employeeId);
    const employee = await getDatabase().collection("users").findOne({ _id: employeeId, role: "employee", active: true });
    if (!employee) return res.status(400).json({ message: "The selected account is not an active employee." });
    const order = await getDatabase().collection("orders").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { assignedEmployeeId: employeeId, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!order) return res.status(404).json({ message: "Order not found." });
    return res.json({ order: publicOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", requireAuth, requireRoles("admin", "employee"), async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id) || !statuses.has(req.body?.status)) return res.status(400).json({ message: "Invalid order or status." });
    const filter = req.auth.role === "admin"
      ? { _id: new ObjectId(req.params.id) }
      : { _id: new ObjectId(req.params.id), assignedEmployeeId: req.auth.userId };
    const order = await getDatabase().collection("orders").findOneAndUpdate(
      filter,
      { $set: { status: req.body.status, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!order) return res.status(404).json({ message: "Order not found or not assigned to you." });
    return res.json({ order: publicOrder(order) });
  } catch (error) {
    return next(error);
  }
});

export default router;
