import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, desc } from "drizzle-orm";
import type { Bindings } from "../index";

export const financeRouter = new Hono<{ Bindings: Bindings }>();

// --------------------------------------------------------------------------
// Chart of Accounts (COA)
// --------------------------------------------------------------------------
financeRouter.get("/accounts", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const accounts = await db.select().from(schema.chartOfAccounts).orderBy(schema.chartOfAccounts.code);
  return c.json({ data: accounts });
});

// --------------------------------------------------------------------------
// Invoices (SPP & School Fees - account.move out_invoice)
// --------------------------------------------------------------------------
financeRouter.get("/invoices", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const invoices = await db
    .select()
    .from(schema.accountMoves)
    .where(eq(schema.accountMoves.moveType, "out_invoice"))
    .orderBy(desc(schema.accountMoves.date));
  return c.json({ data: invoices });
});

// Create Invoice with Strict Double-Entry Journal Lines (Debit AR, Credit Income)
financeRouter.post("/invoices", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const moveId = body.id || `inv_${Date.now()}`;
  const amount = Number(body.amountTotal);

  const newMove = {
    id: moveId,
    schoolId: body.schoolId,
    journalId: body.journalId,
    studentId: body.studentId,
    name: body.name || `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
    date: body.date || new Date().toISOString().split("T")[0],
    moveType: "out_invoice",
    amountTotal: amount,
    amountResidual: amount,
    state: "posted",
    paymentState: "not_paid",
    invoiceDueDate: body.dueDate || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(schema.accountMoves).values(newMove);

  // Auto-generate Balanced Double-Entry Move Lines
  // Line 1: Debit Piutang Siswa (Accounts Receivable)
  // Line 2: Credit Pendapatan SPP (School Fee Income)
  const lineDebit = {
    id: `line_deb_${Date.now()}`,
    moveId,
    accountId: body.receivableAccountId, // Piutang Siswa (Asset)
    studentId: body.studentId,
    name: body.description || "Tagihan SPP Siswa",
    debit: amount,
    credit: 0,
    reconciled: false,
    createdAt: new Date()
  };

  const lineCredit = {
    id: `line_crd_${Date.now()}`,
    moveId,
    accountId: body.incomeAccountId, // Pendapatan SPP (Income)
    studentId: body.studentId,
    name: body.description || "Pendapatan SPP",
    debit: 0,
    credit: amount,
    reconciled: false,
    createdAt: new Date()
  };

  await db.insert(schema.accountMoveLines).values([lineDebit, lineCredit]);

  return c.json({ success: true, data: newMove }, 201);
});

// --------------------------------------------------------------------------
// Record Student Payment (Reconcile Invoice with Cash/Bank Journal Entry)
// --------------------------------------------------------------------------
financeRouter.post("/payments", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const paymentId = body.id || `pay_${Date.now()}`;
  const amount = Number(body.amount);

  const newPayment = {
    id: paymentId,
    schoolId: body.schoolId,
    journalId: body.journalId, // Cash / Bank journal
    moveId: body.moveId || null,
    studentId: body.studentId,
    name: body.name || `PAY/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
    paymentDate: body.paymentDate || new Date().toISOString().split("T")[0],
    amount,
    paymentMethod: body.paymentMethod || "cash",
    reference: body.reference || null,
    state: "posted",
    createdAt: new Date()
  };

  await db.insert(schema.accountPayments).values(newPayment);

  // If tied to invoice, update payment status
  if (body.moveId) {
    await db
      .update(schema.accountMoves)
      .set({
        paymentState: "paid",
        amountResidual: 0,
        updatedAt: new Date()
      })
      .where(eq(schema.accountMoves.id, body.moveId));
  }

  return c.json({ success: true, data: newPayment }, 201);
});

// --------------------------------------------------------------------------
// Trial Balance (Neraca Saldo - Verifikasi Total Debit == Total Credit)
// --------------------------------------------------------------------------
financeRouter.get("/trial-balance", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const lines = await db.select().from(schema.accountMoveLines);

  const totalDebit = lines.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = lines.reduce((acc, curr) => acc + curr.credit, 0);

  return c.json({
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
    lineCount: lines.length
  });
});
