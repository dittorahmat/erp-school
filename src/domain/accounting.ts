import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
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
 * Resolves standard accounts receivable and income accounts, plus default sale journal for a school.
 */
export async function resolveDefaultAccountsAndJournal(
  db: any,
  schoolId: string,
  preferred?: { receivableAccountId?: string; incomeAccountId?: string; journalId?: string }
) {
  let recAccountId = preferred?.receivableAccountId;
  let incAccountId = preferred?.incomeAccountId;
  let journalId = preferred?.journalId;

  if (!recAccountId || !incAccountId) {
    const allAccounts = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.schoolId, schoolId));
    recAccountId =
      recAccountId ||
      allAccounts.find((a: any) => (a.accountType === 'asset' || a.type === 'asset'))?.id ||
      allAccounts[0]?.id ||
      'coa_ar';
    incAccountId =
      incAccountId ||
      allAccounts.find((a: any) => (a.accountType === 'income' || a.type === 'income'))?.id ||
      allAccounts[1]?.id ||
      allAccounts[0]?.id ||
      'coa_rev_other';
  }

  if (!journalId) {
    const jrnList = await db
      .select()
      .from(schema.journals)
      .where(eq(schema.journals.schoolId, schoolId));
    const saleJournal = jrnList.find((j: any) => j.type === 'sale') || jrnList[0];
    journalId = saleJournal?.id || 'jrn_sale';
  }

  return { recAccountId, incAccountId, journalId };
}

/**
 * Deep Accounting Engine Module.
 * Encapsulates double-entry balancing invariants, residual calculations,
 * and Cloudflare D1 atomic batch compilation behind a minimal interface.
 */
export const accountingEngine = {
  async getAccounts(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    if (schoolId) {
      return db
        .select()
        .from(schema.chartOfAccounts)
        .where(eq(schema.chartOfAccounts.schoolId, schoolId))
        .orderBy(schema.chartOfAccounts.code);
    }
    return db.select().from(schema.chartOfAccounts).orderBy(schema.chartOfAccounts.code);
  },

  async createAccount(
    d1: D1Database,
    params: {
      id?: string;
      schoolId: string;
      code: string;
      name: string;
      type: "asset" | "liability" | "equity" | "income" | "expense";
      reconcile?: boolean;
    }
  ) {
    const db = drizzle(d1, { schema });
    // Guardrail: check code uniqueness per school
    const existing = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(
        and(
          eq(schema.chartOfAccounts.schoolId, params.schoolId),
          eq(schema.chartOfAccounts.code, params.code)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Kode akun ${params.code} sudah digunakan di sekolah ini`);
    }

    const id = params.id || generateId("coa");
    const newAccount = {
      id,
      schoolId: params.schoolId,
      code: params.code,
      name: params.name,
      type: params.type,
      reconcile: Boolean(params.reconcile),
      createdAt: new Date(),
    };
    await db.insert(schema.chartOfAccounts).values(newAccount);
    return newAccount;
  },

  async updateAccount(
    d1: D1Database,
    id: string,
    params: {
      name?: string;
      code?: string;
      type?: "asset" | "liability" | "equity" | "income" | "expense";
      reconcile?: boolean;
    }
  ) {
    const db = drizzle(d1, { schema });
    // Guardrail: check if account is locked by journal transactions
    const existingLines = await db
      .select()
      .from(schema.accountMoveLines)
      .where(eq(schema.accountMoveLines.accountId, id))
      .limit(1);

    if (existingLines.length > 0 && (params.code !== undefined || params.type !== undefined)) {
      throw new Error("Kode dan klasifikasi akun tidak dapat diubah karena sudah memiliki riwayat transaksi/jurnal");
    }

    const updateData: any = {};
    if (params.name !== undefined) updateData.name = params.name;
    if (params.code !== undefined) updateData.code = params.code;
    if (params.type !== undefined) updateData.type = params.type;
    if (params.reconcile !== undefined) updateData.reconcile = params.reconcile;

    await db
      .update(schema.chartOfAccounts)
      .set(updateData)
      .where(eq(schema.chartOfAccounts.id, id));

    const updated = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.id, id))
      .limit(1);
    return updated[0] || null;
  },

  async deleteAccount(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    // Guardrail: check if account has existing journal move lines
    const existingLines = await db
      .select()
      .from(schema.accountMoveLines)
      .where(eq(schema.accountMoveLines.accountId, id))
      .limit(1);

    if (existingLines.length > 0) {
      throw new Error("Akun tidak dapat dihapus karena sudah memiliki riwayat transaksi/jurnal");
    }

    await db.delete(schema.chartOfAccounts).where(eq(schema.chartOfAccounts.id, id));
    return { success: true, id };
  },

  async seedPsakAccounts(d1: D1Database, schoolId: string) {
    const db = drizzle(d1, { schema });
    const defaultPsak = [
      { code: "1-1101", name: "Kas Operasional Sekolah", type: "asset" as const, reconcile: true },
      { code: "1-1102", name: "Bank Yayasan (Operasional)", type: "asset" as const, reconcile: true },
      { code: "1-1201", name: "Piutang SPP Siswa", type: "asset" as const, reconcile: true },
      { code: "1-1202", name: "Piutang Uang Gedung / PPDB", type: "asset" as const, reconcile: true },
      { code: "2-1101", name: "Utang Gaji Guru & Staf", type: "liability" as const, reconcile: true },
      { code: "2-1102", name: "Utang Operasional / Vendor", type: "liability" as const, reconcile: false },
      { code: "3-1101", name: "Aset Bersih Tidak Terikat (Ekuitas)", type: "equity" as const, reconcile: false },
      { code: "4-1101", name: "Pendapatan SPP Bulanan", type: "income" as const, reconcile: false },
      { code: "4-1102", name: "Pendapatan Uang Pangkal / PPDB", type: "income" as const, reconcile: false },
      { code: "4-1201", name: "Pendapatan Denda & Layanan Perpustakaan", type: "income" as const, reconcile: false },
      { code: "5-1101", name: "Beban Gaji Pokok & Tunjangan Guru", type: "expense" as const, reconcile: false },
      { code: "5-1102", name: "Beban Honor Jam Mengajar", type: "expense" as const, reconcile: false },
      { code: "5-1201", name: "Beban Operasional & Pembelajaran", type: "expense" as const, reconcile: false },
    ];

    const stmts = defaultPsak.map((item) =>
      db.insert(schema.chartOfAccounts).values({
        id: generateId("coa"),
        schoolId,
        code: item.code,
        name: item.name,
        type: item.type,
        reconcile: item.reconcile,
        createdAt: new Date(),
      })
    );

    await db.batch(stmts as any);
    return { success: true, count: defaultPsak.length };
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
