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

// List all vendor bills (in_invoice)
purchasingRouter.get("/bills", async (c) => {
  const schoolId = c.req.query("schoolId");
  const bills = await purchasingEngine.getVendorBills(c.env.DB, schoolId);
  return c.json({ data: bills });
});

// Get vendor bill by ID
purchasingRouter.get("/bills/:id", async (c) => {
  const id = c.req.param("id");
  const bill = await purchasingEngine.getVendorBillById(c.env.DB, id);
  if (!bill) {
    return c.json({ error: "Vendor bill not found" }, 404);
  }
  return c.json({ success: true, data: bill });
});

// Convert approved PO to vendor bill with inventory receipt
purchasingRouter.post("/orders/:id/create-bill", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  try {
    const bill = await purchasingEngine.createVendorBillFromPO(c.env.DB, {
      schoolId: body.schoolId,
      orderId: id,
      billDate: body.billDate,
      expenseAccountId: body.expenseAccountId,
      payableAccountId: body.payableAccountId,
    });
    return c.json({ success: true, data: bill }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to create vendor bill from PO" }, 400);
  }
});

// Pay vendor bill
purchasingRouter.post("/bills/:id/pay", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  try {
    const result = await purchasingEngine.payVendorBill(c.env.DB, {
      schoolId: body.schoolId,
      billId: id,
      paymentDate: body.paymentDate,
      paymentMethod: body.paymentMethod,
      amount: body.amount,
      paymentAccountId: body.paymentAccountId,
      payableAccountId: body.payableAccountId,
    });
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to record vendor bill payment" }, 400);
  }
});

