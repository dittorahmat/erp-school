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
