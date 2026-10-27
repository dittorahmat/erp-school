import { Hono } from "hono";
import { purchasingEngine } from "../domain";
import type { Bindings } from "../index";

export const purchasingRouter = new Hono<{ Bindings: Bindings }>();

// List all purchase orders
purchasingRouter.get("/orders", async (c) => {
  const schoolId = c.req.query("schoolId");
  const orders = await purchasingEngine.getPurchaseOrders(c.env.DB, schoolId);
  return c.json({ data: orders });
});

// Get purchase order details with lines
purchasingRouter.get("/orders/:id", async (c) => {
  const id = c.req.param("id");
  const order = await purchasingEngine.getPurchaseOrderById(c.env.DB, id);
  if (!order) {
    return c.json({ error: "Purchase order not found" }, 404);
  }
  return c.json({ success: true, data: order });
});

// Create new purchase order (draft)
purchasingRouter.post("/orders", async (c) => {
  const body = await c.req.json();
  if (!body.schoolId || !body.partnerName || !body.lines || !Array.isArray(body.lines) || body.lines.length === 0) {
    return c.json({ error: "schoolId, partnerName, and non-empty lines array are required" }, 400);
  }

  try {
    const order = await purchasingEngine.createPurchaseOrder(c.env.DB, body);
    return c.json({ success: true, data: order }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to create purchase order" }, 400);
  }
});

// Approve purchase order
purchasingRouter.post("/orders/:id/approve", async (c) => {
  const id = c.req.param("id");
  try {
    const order = await purchasingEngine.approvePurchaseOrder(c.env.DB, id);
    return c.json({ success: true, data: order });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to approve purchase order" }, 400);
  }
});

// Cancel purchase order
purchasingRouter.post("/orders/:id/cancel", async (c) => {
  const id = c.req.param("id");
  try {
    const order = await purchasingEngine.cancelPurchaseOrder(c.env.DB, id);
    return c.json({ success: true, data: order });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to cancel purchase order" }, 400);
  }
});
