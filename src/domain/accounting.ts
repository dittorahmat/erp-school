import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "../lib/utils";

export interface CreateInvoiceParams {
  id?: string;
  schoolId?: string;
  journalId?: string;
  studentId?: string;
  partnerId?: string | null;
  name?: string;
  date?: string;
  dueDate?: string | null;
  description?: string;
  amountTotal?: number;
  receivableAccountId?: string;
  incomeAccountId?: string;
}

export interface BatchMonthlyInvoiceParams {
  amount?: number;
  monthName?: string;
  dueDate?: string;
}

export interface RecordPaymentParams {
  id?: string;
  schoolId?: string;
  journalId?: string;
  moveId?: string | null;
  studentId?: string;
  name?: string;
  paymentDate?: string;
  amount: number;
  paymentMethod?: string;
  reference?: string | null;
}

/**
 * Deep Accounting Engine Module.
 * Encapsulates double-entry balancing invariants, residual calculations,
 * and Cloudflare D1 atomic batch compilation behind a minimal interface.
 */
export const accountingEngine = {
  async getAccounts(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.chartOfAccounts).orderBy(schema.chartOfAccounts.code);
  },

  async getInvoices(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db
      .select()
      .from(schema.accountMoves)
      .where(eq(schema.accountMoves.moveType, "out_invoice"))
      .orderBy(desc(schema.accountMoves.date));
  },

  async createInvoice(d1: D1Database, params: CreateInvoiceParams) {
    const db = drizzle(d1, { schema });
    const moveId = params.id || generateId("inv");
    const amount = Number(params.amountTotal || 500000);
    const studentId = params.studentId || params.partnerId || null;

    const move = {
      id: moveId,
      schoolId: params.schoolId || "school_sma_hb",
      journalId: params.journalId || "jrn_sale",
      studentId: studentId,
      name: params.name || `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      date: params.date || new Date().toISOString().split("T")[0],
      moveType: "out_invoice",
      amountTotal: amount,
      amountResidual: amount,
      state: "posted",
      paymentState: "not_paid",
      invoiceDueDate: params.dueDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const lineDebit = {
      id: generateId("aml_deb"),
      moveId,
      accountId: params.receivableAccountId || "coa_ar",
      studentId: studentId,
      name: params.description || "Tagihan SPP Siswa",
      debit: amount,
      credit: 0,
      reconciled: false,
      createdAt: new Date(),
    };

    const lineCredit = {
      id: generateId("aml_crd"),
      moveId,
      accountId: params.incomeAccountId || "coa_rev_spp",
      studentId: studentId,
      name: params.description || "Pendapatan SPP",
      debit: 0,
      credit: amount,
      reconciled: false,
      createdAt: new Date(),
    };

    await db.batch([
      db.insert(schema.accountMoves).values(move),
      db.insert(schema.accountMoveLines).values(lineDebit),
      db.insert(schema.accountMoveLines).values(lineCredit),
    ]);

    return move;
  },

  async createBatchMonthlyInvoices(d1: D1Database, params: BatchMonthlyInvoiceParams) {
    const db = drizzle(d1, { schema });
    const studentsList = await db.select().from(schema.students).where(eq(schema.students.status, "active"));
    const amount = Number(params.amount || 500000);
    const monthName = params.monthName || "November 2026";

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
        invoiceDueDate: params.dueDate || "2026-11-10",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      createdMoves.push(move);
      statements.push(db.insert(schema.accountMoves).values(move));
      statements.push(
        db.insert(schema.accountMoveLines).values({
          id: generateId("aml_deb"),
          moveId,
          accountId: "coa_ar",
          studentId: s.id,
          name: `SPP ${monthName} - ${s.name}`,
          debit: amount,
          credit: 0,
          reconciled: false,
          createdAt: new Date(),
        })
      );
      statements.push(
        db.insert(schema.accountMoveLines).values({
          id: generateId("aml_crd"),
          moveId,
          accountId: "coa_rev_spp",
          studentId: s.id,
          name: `Pendapatan SPP ${monthName}`,
          debit: 0,
          credit: amount,
          reconciled: false,
          createdAt: new Date(),
        })
      );
    }

    if (statements.length > 0) {
      await db.batch(statements as any);
    }

    return createdMoves;
  },

  async recordPayment(d1: D1Database, params: RecordPaymentParams) {
    const db = drizzle(d1, { schema });
    const paymentId = params.id || generateId("pay");
    const amount = Number(params.amount);

    const payment = {
      id: paymentId,
      schoolId: params.schoolId || "school_sma_hb",
      journalId: params.journalId || "jrn_cash",
      moveId: params.moveId || null,
      studentId: params.studentId,
      name: params.name || `PAY/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      paymentDate: params.paymentDate || new Date().toISOString().split("T")[0],
      amount,
      paymentMethod: params.paymentMethod || "cash",
      reference: params.reference || null,
      state: "posted",
      createdAt: new Date(),
    };

    const stmts: any[] = [db.insert(schema.accountPayments).values(payment)];
    if (params.moveId) {
      stmts.push(
        db
          .update(schema.accountMoves)
          .set({ paymentState: "paid", amountResidual: 0, updatedAt: new Date() })
          .where(eq(schema.accountMoves.id, params.moveId))
      );
    }
    await db.batch(stmts as any);

    return payment;
  },

  async getInvoiceById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db
      .select()
      .from(schema.accountMoves)
      .where(eq(schema.accountMoves.id, id))
      .limit(1);
    return results[0] || null;
  },

  async deleteInvoice(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const invoice = await this.getInvoiceById(d1, id);
    if (!invoice) {
      throw new Error("Invoice tidak ditemukan");
    }
    if (invoice.paymentState === "paid") {
      throw new Error("Invoice yang sudah lunas tidak dapat dihapus");
    }

    // Atomic batch delete for move lines and the move header
    await db.batch([
      db.delete(schema.accountMoveLines).where(eq(schema.accountMoveLines.moveId, id)),
      db.delete(schema.accountMoves).where(eq(schema.accountMoves.id, id)),
    ]);

    return { success: true, id };
  },

  async getTrialBalance(d1: D1Database) {
    const db = drizzle(d1, { schema });
    const lines = await db.select().from(schema.accountMoveLines);
    const totalDebit = lines.reduce((acc, curr) => acc + curr.debit, 0);
    const totalCredit = lines.reduce((acc, curr) => acc + curr.credit, 0);

    return {
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
      lineCount: lines.length,
    };
  },
};
