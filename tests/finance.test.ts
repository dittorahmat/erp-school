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
});
