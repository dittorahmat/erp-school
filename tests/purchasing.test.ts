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
});
