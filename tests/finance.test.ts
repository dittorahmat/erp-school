import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Double-Entry Accounting API", () => {
  it("should respond with 200 on chart of accounts list", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };
    const res = await app.request("/api/finance/accounts", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { data: any[] };
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should create a new account in chart of accounts", async () => {
    let insertedValues: any = null;
    const mockEnv = {
      DB: {
        prepare: (query: string) => ({
          bind: (...args: any[]) => ({
            run: async () => {
              insertedValues = args;
              return { success: true };
            },
            raw: async () => []
          })
        })
      }
    };
    const payload = {
      schoolId: "school_sma_hb",
      code: "1-1101",
      name: "Kas Operasional",
      type: "asset",
      reconcile: true
    };
    const res = await app.request("/api/finance/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, mockEnv as any);

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.code).toBe("1-1101");
  });

  it("should reject account creation when required fields are missing", async () => {
    const mockEnv = { DB: {} };
    const res = await app.request("/api/finance/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "1-1101" })
    }, mockEnv as any);
    expect(res.status).toBe(400);
  });

  it("should respond with 200 on GET /api/finance/invoices", async () => {
    const invoiceRow = [
      "inv_01",              // id
      "school_sma_hb",       // schoolId
      "jrn_sale",            // journalId
      "std_01",              // studentId
      "INV/2026/10/001",     // name
      "2026-10-26",          // date
      "out_invoice",         // moveType
      500000,                // amountTotal
      500000,                // amountResidual
      "posted",              // state
      "not_paid",            // paymentState
      "2026-11-10",          // invoiceDueDate
      Date.now(),            // createdAt
      Date.now()             // updatedAt
    ];
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [invoiceRow]
          })
        })
      }
    };
    const res = await app.request("/api/finance/invoices", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { data: any[] };
    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe("INV/2026/10/001");
  });

  it("should respond with 201 on POST /api/finance/invoices and create balanced entries atomically with partnerId", async () => {
    let batchedStatements: any[] = [];
    const mockD1 = {
      prepare: () => ({
        bind: () => ({
          run: async () => ({ success: true })
        })
      }),
      batch: async (statements: any[]) => {
        batchedStatements = statements;
        return statements.map(() => ({ results: [], success: true }));
      }
    };
    const mockEnv = { DB: mockD1 };

    const payload = {
      schoolId: "school_sma_hb",
      partnerId: "std_01",
      name: "INV/2026/10/002",
      date: "2026-10-26",
      dueDate: "2026-11-10",
      amountTotal: 650000,
      description: "Iuran SPP November 2026 - Andi Pratama"
    };

    const res = await app.request(
      "/api/finance/invoices",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.amountTotal).toBe(650000);
    expect(body.data.amountResidual).toBe(650000);
    expect(body.data.studentId).toBe("std_01");
    expect(batchedStatements).toHaveLength(3); // 1 header move + 1 debit line + 1 credit line
  });

  it("should respond with 200 on GET /api/finance/invoices/:id", async () => {
    const invoiceRow = [
      "inv_123",             // id
      "school_sma_hb",       // schoolId
      "jrn_sale",            // journalId
      null,                  // studentId
      "INV/2026/10/123",     // name
      "2026-10-26",          // date
      "out_invoice",         // moveType
      500000,                // amountTotal
      500000,                // amountResidual
      "posted",              // state
      "not_paid",            // paymentState
      "2026-11-10",          // invoiceDueDate
      Date.now(),            // createdAt
      Date.now()             // updatedAt
    ];
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [invoiceRow]
          })
        })
      }
    };

    const res = await app.request("/api/finance/invoices/inv_123", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("inv_123");
  });

  it("should respond with 404 on GET /api/finance/invoices/:id if not found", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };

    const res = await app.request("/api/finance/invoices/non_existent", {}, mockEnv as any);
    expect(res.status).toBe(404);
  });

  it("should respond with 200 on DELETE /api/finance/invoices/:id and delete move & move lines atomically", async () => {
    const invoiceRow = [
      "inv_to_del",          // id
      "school_sma_hb",       // schoolId
      "jrn_sale",            // journalId
      null,                  // studentId
      "INV/2026/10/999",     // name
      "2026-10-26",          // date
      "out_invoice",         // moveType
      500000,                // amountTotal
      500000,                // amountResidual
      "posted",              // state
      "not_paid",            // paymentState
      "2026-11-10",          // invoiceDueDate
      Date.now(),            // createdAt
      Date.now()             // updatedAt
    ];

    let batchedStatements: any[] = [];
    const mockD1 = {
      prepare: () => ({
        bind: () => ({
          raw: async () => [invoiceRow]
        })
      }),
      batch: async (statements: any[]) => {
        batchedStatements = statements;
        return statements.map(() => ({ results: [], success: true }));
      }
    };
    const mockEnv = { DB: mockD1 };

    const res = await app.request(
      "/api/finance/invoices/inv_to_del",
      { method: "DELETE" },
      mockEnv as any
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("inv_to_del");
    expect(batchedStatements).toHaveLength(2); // delete lines + delete move
  });

  it("should reject DELETE /api/finance/invoices/:id with 400 if invoice is already paid", async () => {
    const paidInvoiceRow = [
      "inv_paid",            // id
      "school_sma_hb",       // schoolId
      "jrn_sale",            // journalId
      null,                  // studentId
      "INV/2026/10/PAID",    // name
      "2026-10-26",          // date
      "out_invoice",         // moveType
      500000,                // amountTotal
      0,                     // amountResidual
      "posted",              // state
      "paid",                // paymentState
      "2026-11-10",          // invoiceDueDate
      Date.now(),            // createdAt
      Date.now()             // updatedAt
    ];

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [paidInvoiceRow]
          })
        })
      }
    };

    const res = await app.request(
      "/api/finance/invoices/inv_paid",
      { method: "DELETE" },
      mockEnv as any
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error).toContain("lunas");
  });

  it("should calculate balanced trial balance on empty or balanced data", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };
    const res = await app.request("/api/finance/trial-balance", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { isBalanced: boolean; totalDebit: number; totalCredit: number };
    expect(data.isBalanced).toBe(true);
    expect(data.totalDebit).toBe(0);
    expect(data.totalCredit).toBe(0);
  });

  it("should preserve balanced trial balance after creating invoice and posting double-entry lines", async () => {
    let batchedStatements: any[] = [];
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        }),
        batch: async (statements: any[]) => {
          batchedStatements = statements;
          return statements.map(() => ({ success: true }));
        }
      }
    };

    const payload = {
      schoolId: "school_sma_hb",
      studentId: "std_andi",
      amountTotal: 750000,
      description: "SPP November 2026",
      date: "2026-11-01",
      dueDate: "2026-11-10",
      receivableAccountId: "coa_ar",
      incomeAccountId: "coa_rev_spp"
    };

    const res = await app.request(
      "/api/finance/invoices",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.amountTotal).toBe(750000);
    expect(batchedStatements).toHaveLength(3); // 1 header invoice + 1 debit AR + 1 credit income
  });
});
