import { Hono } from "hono";
import { accountingEngine } from "../domain/accounting";
import type { Bindings } from "../index";

export const financeRouter = new Hono<{ Bindings: Bindings }>();

financeRouter.get("/accounts", async (c) => {
  const accounts = await accountingEngine.getAccounts(c.env.DB);
  return c.json({ data: accounts });
});

financeRouter.get("/invoices", async (c) => {
  const invoices = await accountingEngine.getInvoices(c.env.DB);
  return c.json({ data: invoices });
});

financeRouter.get("/invoices/:id", async (c) => {
  const id = c.req.param("id");
  const invoice = await accountingEngine.getInvoiceById(c.env.DB, id);
  if (!invoice) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  return c.json({ success: true, data: invoice });
});

financeRouter.delete("/invoices/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await accountingEngine.deleteInvoice(c.env.DB, id);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to delete invoice" }, 400);
  }
});

financeRouter.post("/invoices", async (c) => {
  const body = await c.req.json();
  const move = await accountingEngine.createInvoice(c.env.DB, body);
  return c.json({ success: true, data: move }, 201);
});

financeRouter.post("/invoices/batch", async (c) => {
  const body = await c.req.json();
  const createdMoves = await accountingEngine.createBatchMonthlyInvoices(c.env.DB, body);
  return c.json({ success: true, totalGenerated: createdMoves.length, data: createdMoves }, 201);
});

financeRouter.post("/payments", async (c) => {
  const body = await c.req.json();
  const payment = await accountingEngine.recordPayment(c.env.DB, body);
  return c.json({ success: true, data: payment }, 201);
});

financeRouter.get("/trial-balance", async (c) => {
  const result = await accountingEngine.getTrialBalance(c.env.DB);
  return c.json(result);
});
