import { describe, it, expect } from "vitest";
import app from "../src/index";
import { createMockD1Database } from "./helpers/d1-mock";

describe("Purchase Order API & Lifecycle Suite (Odoo Purchase Model)", () => {
  it("should return purchase order list via GET /api/purchasing/orders", async () => {
    const mockOrders = [
      ["po_001", "school_sma_hb", "PO/2026/0001", "PT Gramedia", "2026-10-28", 1500000, "draft", "Notes", null, 1761476400, 1761476400]
    ];
    const mockDb = createMockD1Database(mockOrders);

    const res = await app.request("/api/purchasing/orders?schoolId=school_sma_hb", {}, { DB: mockDb } as any);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("should create a draft purchase order via POST /api/purchasing/orders", async () => {
    let batchCalled = false;
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          run: async () => ({ success: true }),
          raw: async () => [
            ["po_new", "school_sma_hb", "PO/2026/NEW", "PT Vendor Sukses", "2026-10-28", 500000, "draft", null, null, 1761476400, 1761476400]
          ],
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (stmts: any[]) => {
        batchCalled = true;
        return stmts.map(() => ({ results: [], success: true }));
      },
      exec: async () => ({ count: 1, duration: 1 }),
    };

    const payload = {
      schoolId: "school_sma_hb",
      partnerName: "PT Vendor Sukses",
      orderDate: "2026-10-28",
      lines: [
        {
          productId: "prod_01",
          productQty: 10,
          priceUnit: 50000,
          notes: "10 rim kertas",
        },
      ],
    };

    const res = await app.request(
      "/api/purchasing/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(201);
    expect(batchCalled).toBe(true);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
  });

  it("should validate required fields when creating PO", async () => {
    const mockDb = createMockD1Database([]);
    const res = await app.request(
      "/api/purchasing/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: "sch_01" }),
      },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(400);
    const json = (await res.json()) as any;
    expect(json.error).toBeDefined();
  });

  it("should approve a purchase order via POST /api/purchasing/orders/:id/approve", async () => {
    let updated = false;
    const mockDb = {
      prepare: () => ({
        bind: (...args: any[]) => ({
          run: async () => {
            updated = true;
            return { success: true };
          },
          raw: async () => [
            // Return draft first time, approved second time
            ["po_appr", "school_sma_hb", "PO/2026/0002", "Vendor A", "2026-10-28", 100000, updated ? "approved" : "draft", null, null, 1761476400, 1761476400]
          ],
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (stmts: any[]) => stmts.map(() => ({ results: [], success: true })),
      exec: async () => ({ count: 1, duration: 1 }),
    };

    const res = await app.request(
      "/api/purchasing/orders/po_appr/approve",
      { method: "POST" },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("approved");
  });

  it("should cancel a purchase order via POST /api/purchasing/orders/:id/cancel", async () => {
    let updated = false;
    const mockDb = {
      prepare: () => ({
        bind: (...args: any[]) => ({
          run: async () => {
            updated = true;
            return { success: true };
          },
          raw: async () => [
            ["po_cnc", "school_sma_hb", "PO/2026/0003", "Vendor B", "2026-10-28", 200000, updated ? "cancelled" : "draft", null, null, 1761476400, 1761476400]
          ],
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (stmts: any[]) => stmts.map(() => ({ results: [], success: true })),
      exec: async () => ({ count: 1, duration: 1 }),
    };

    const res = await app.request(
      "/api/purchasing/orders/po_cnc/cancel",
      { method: "POST" },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("cancelled");
  });

  it("should create vendor bill (in_invoice) from approved PO with atomic batch and balanced move lines", async () => {
    let batchStatements: any[] = [];
    const mockOrder = [
      "po_appr_01",
      "school_sma_hb",
      "PO/2026/0004",
      "PT Gramedia Edukasi",
      "2026-10-28",
      1500000,
      "approved",
      "Pengadaan buku",
      null,
      1761476400,
      1761476400,
    ];

    const mockLines = [
      [
        "pol_01",
        "po_appr_01",
        "prd_buku_mat",
        "Buku Matematika",
        "BK-MAT-10",
        "pcs",
        20,
        75000,
        1500000,
        null,
        1761476400,
      ],
    ];

    const mockAccounts = [
      ["coa_exp", "school_sma_hb", "51000", "Beban Pengadaan Barang", "expense", 0, 1761476400],
      ["coa_ap", "school_sma_hb", "21000", "Utang Usaha / Vendor", "liability", 0, 1761476400],
    ];

    const mockJournals = [
      ["jrn_purchase", "school_sma_hb", "Jurnal Pembelian", "BILL", "purchase", "coa_ap", 1761476400],
    ];

    const mockDb = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => ({
          run: async () => ({ success: true }),
          raw: async () => {
            if (query.includes("chart_of_accounts")) return mockAccounts;
            if (query.includes("journals")) return mockJournals;
            if (query.includes("purchase_order_lines")) return mockLines;
            if (query.includes("purchase_orders")) return [mockOrder];
            if (query.includes("account_moves")) {
              return [
                ["bill_01", "school_sma_hb", "jrn_purchase", null, "BILL/2026/0004", "2026-10-28", "in_invoice", 1500000, 1500000, "posted", "not_paid", "2026-10-28", 1761476400, 1761476400],
              ];
            }
            return [];
          },
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (stmts: any[]) => {
        batchStatements = stmts;
        return stmts.map(() => ({ results: [], success: true }));
      },
      exec: async () => ({ count: 1, duration: 1 }),
    };

    const res = await app.request(
      "/api/purchasing/orders/po_appr_01/create-bill",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: "school_sma_hb" }),
      },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.moveType).toBe("in_invoice");
    expect(batchStatements.length).toBeGreaterThanOrEqual(4); // bill, debit line, credit line, stock picking/moves, po update
  });

  it("should pay vendor bill and record reconciliation journal entry", async () => {
    let batchStatements: any[] = [];
    const mockBill = [
      "bill_01",
      "school_sma_hb",
      "jrn_purchase",
      null,
      "BILL/2026/0004",
      "2026-10-28",
      "in_invoice",
      1500000,
      1500000,
      "posted",
      "not_paid",
      "2026-10-28",
      1761476400,
      1761476400,
    ];

    const mockAccounts = [
      ["coa_bank", "school_sma_hb", "1120", "Bank BCA Operasional", "asset", 1, 1761476400],
      ["coa_ap", "school_sma_hb", "21000", "Utang Usaha / Vendor", "liability", 0, 1761476400],
    ];

    const mockJournals = [
      ["jrn_bank", "school_sma_hb", "Rekening Bank BCA", "BNK", "bank", "coa_bank", 1761476400],
    ];

    const mockDb = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => ({
          run: async () => ({ success: true }),
          raw: async () => {
            if (query.includes("chart_of_accounts")) return mockAccounts;
            if (query.includes("journals")) return mockJournals;
            if (query.includes("account_moves")) return [mockBill];
            return [];
          },
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (stmts: any[]) => {
        batchStatements = stmts;
        return stmts.map(() => ({ results: [], success: true }));
      },
      exec: async () => ({ count: 1, duration: 1 }),
    };

    const res = await app.request(
      "/api/purchasing/bills/bill_01/pay",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: "school_sma_hb",
          amount: 1500000,
          paymentMethod: "bank_transfer",
        }),
      },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.payment).toBeDefined();
    expect(batchStatements.length).toBeGreaterThanOrEqual(4); // payment record, payment move, debit AP, credit Bank, bill residual update
  });
});

