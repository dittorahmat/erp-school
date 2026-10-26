import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "../lib/utils";
import type { Bindings } from "../index";

export const financeRouter = new Hono<{ Bindings: Bindings }>();

financeRouter.get("/accounts", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  return c.json({ data: await db.select().from(schema.chartOfAccounts).orderBy(schema.chartOfAccounts.code) });
});

financeRouter.get("/invoices", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  return c.json({
    data: await db.select().from(schema.accountMoves).where(eq(schema.accountMoves.moveType, "out_invoice")).orderBy(desc(schema.accountMoves.date))
  });
});

// Single Invoice with Atomic Batch Insert for balanced moves
financeRouter.post("/invoices", async (c) => {
  const b = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const moveId = b.id || generateId("inv");
  const amount = Number(b.amountTotal || 500000);

  const move = {
    id: moveId,
    schoolId: b.schoolId || "school_sma_hb",
    journalId: b.journalId || "jrn_sale",
    studentId: b.studentId,
    name: b.name || `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
    date: b.date || new Date().toISOString().split("T")[0],
    moveType: "out_invoice",
    amountTotal: amount,
    amountResidual: amount,
    state: "posted",
    paymentState: "not_paid",
    invoiceDueDate: b.dueDate || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const lineDebit = {
    id: generateId("aml_deb"),
    moveId,
    accountId: b.receivableAccountId || "coa_ar",
    studentId: b.studentId,
    name: b.description || "Tagihan SPP Siswa",
    debit: amount,
    credit: 0,
    reconciled: false,
    createdAt: new Date()
  };

  const lineCredit = {
    id: generateId("aml_crd"),
    moveId,
    accountId: b.incomeAccountId || "coa_rev_spp",
    studentId: b.studentId,
    name: b.description || "Pendapatan SPP",
    debit: 0,
    credit: amount,
    reconciled: false,
    createdAt: new Date()
  };

  await db.batch([
    db.insert(schema.accountMoves).values(move),
    db.insert(schema.accountMoveLines).values(lineDebit),
    db.insert(schema.accountMoveLines).values(lineCredit)
  ]);

  return c.json({ success: true, data: move }, 201);
});

// Batch Monthly Fee Invoicing Wizard via db.batch()
financeRouter.post("/invoices/batch", async (c) => {
  const b = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const studentsList = await db.select().from(schema.students).where(eq(schema.students.status, "active"));
  const amount = Number(b.amount || 500000);
  const monthName = b.monthName || "November 2026";

  const statements: any[] = [];
  const createdMoves: any[] = [];

  for (const s of studentsList) {
    const moveId = generateId("inv");
    const move = {
      id: moveId,
      schoolId: s.schoolId,
      journalId: "jrn_sale",
      studentId: s.id,
      name: `INV/${new Date().getFullYear()}/${Math.random().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      moveType: "out_invoice",
      amountTotal: amount,
      amountResidual: amount,
      state: "posted",
      paymentState: "not_paid",
      invoiceDueDate: b.dueDate || "2026-11-10",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    createdMoves.push(move);
    statements.push(db.insert(schema.accountMoves).values(move));
    statements.push(db.insert(schema.accountMoveLines).values({
      id: generateId("aml_deb"),
      moveId,
      accountId: "coa_ar",
      studentId: s.id,
      name: `SPP ${monthName} - ${s.name}`,
      debit: amount,
      credit: 0,
      reconciled: false,
      createdAt: new Date()
    }));
    statements.push(db.insert(schema.accountMoveLines).values({
      id: generateId("aml_crd"),
      moveId,
      accountId: "coa_rev_spp",
      studentId: s.id,
      name: `Pendapatan SPP ${monthName}`,
      debit: 0,
      credit: amount,
      reconciled: false,
      createdAt: new Date()
    }));
  }

  if (statements.length > 0) {
    await db.batch(statements as any);
  }

  return c.json({ success: true, totalGenerated: createdMoves.length, data: createdMoves }, 201);
});

financeRouter.post("/payments", async (c) => {
  const b = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const paymentId = b.id || generateId("pay");
  const amount = Number(b.amount);

  const payment = {
    id: paymentId,
    schoolId: b.schoolId || "school_sma_hb",
    journalId: b.journalId || "jrn_cash",
    moveId: b.moveId || null,
    studentId: b.studentId,
    name: b.name || `PAY/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
    paymentDate: b.paymentDate || new Date().toISOString().split("T")[0],
    amount,
    paymentMethod: b.paymentMethod || "cash",
    reference: b.reference || null,
    state: "posted",
    createdAt: new Date()
  };

  const stmts: any[] = [db.insert(schema.accountPayments).values(payment)];
  if (b.moveId) {
    stmts.push(
      db.update(schema.accountMoves).set({ paymentState: "paid", amountResidual: 0, updatedAt: new Date() }).where(eq(schema.accountMoves.id, b.moveId))
    );
  }
  await db.batch(stmts as any);

  return c.json({ success: true, data: payment }, 201);
});

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
