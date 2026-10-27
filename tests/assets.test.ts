import { describe, it, expect } from "vitest";
import app from "../src/index";
import { calculateStraightLineSchedule } from "../src/domain/assets";

describe("Fixed Asset Management & Straight-Line Depreciation API Suite", () => {
  describe("Straight-Line Depreciation Calculation Math", () => {
    it("should calculate exact straight-line monthly depreciation and residual balance", () => {
      // Asset: Rp 12.000.000, Nilai residu Rp 0, Masa manfaat 12 bulan
      const schedule = calculateStraightLineSchedule(12000000, 0, 12, "2026-01-01");
      expect(schedule).toHaveLength(12);
      expect(schedule[0].amount).toBe(1000000);
      expect(schedule[0].accumulatedAmount).toBe(1000000);
      expect(schedule[0].remainingValue).toBe(11000000);

      // Last period should reach exactly purchaseValue - salvageValue
      expect(schedule[11].accumulatedAmount).toBe(12000000);
      expect(schedule[11].remainingValue).toBe(0);
    });

    it("should calculate straight-line with salvage value accurately", () => {
      // Asset: Rp 25.000.000, Nilai residu Rp 1.000.000, Masa manfaat 24 bulan
      // Depreciable = 24.000.000 / 24 = 1.000.000 / bulan
      const schedule = calculateStraightLineSchedule(25000000, 1000000, 24, "2026-01-15");
      expect(schedule).toHaveLength(24);
      expect(schedule[0].amount).toBe(1000000);
      expect(schedule[23].accumulatedAmount).toBe(24000000);
      expect(schedule[23].remainingValue).toBe(1000000); // Remaining value equals salvage value
    });

    it("should handle rounding remainders on the final period", () => {
      // Depreciable = Rp 10.000.000 / 3 bulan = 3.333.333,33 / bulan
      const schedule = calculateStraightLineSchedule(10000000, 0, 3, "2026-01-01");
      expect(schedule).toHaveLength(3);
      const sum = schedule.reduce((acc, curr) => acc + curr.amount, 0);
      expect(Math.round(sum)).toBe(10000000);
      expect(schedule[2].accumulatedAmount).toBe(10000000);
      expect(schedule[2].remainingValue).toBe(0);
    });
  });

  describe("API Endpoints", () => {
    it("should return list of fixed assets on GET /api/assets", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => [],
            }),
          }),
        },
      };
      const res = await app.request("/api/assets", {}, mockEnv as any);
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("should reject asset registration without required fields", async () => {
      const mockEnv = { DB: {} };
      const res = await app.request(
        "/api/assets",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Komputer Baru" }),
        },
        mockEnv as any
      );
      expect(res.status).toBe(400);
    });

    it("should register fixed asset and generate schedule lines on POST /api/assets", async () => {
      let batchedStatements: any[] = [];
      const mockEnv = {
        DB: {
          prepare: (query: string) => ({
            bind: (...args: any[]) => ({
              run: async () => ({ success: true }),
              raw: async () => [], // returns empty for existing asset code check & accounts fallback
            }),
          }),
          batch: async (stmts: any[]) => {
            batchedStatements = stmts;
            return stmts.map(() => ({ results: [], success: true }));
          },
        },
      };

      const payload = {
        schoolId: "school_sma_hb",
        name: "Laptop Laboratorium IPA Asus ExpertBook",
        code: "AST-LAP-001",
        category: "electronic",
        purchaseDate: "2026-01-01",
        purchaseValue: 12000000,
        salvageValue: 0,
        durationMonths: 12,
        notes: "Hibah lab komputer",
      };

      const res = await app.request(
        "/api/assets",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        mockEnv as any
      );

      expect(res.status).toBe(201);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.name).toBe(payload.name);
      expect(json.data.code).toBe("AST-LAP-001");
      expect(json.data.lines).toHaveLength(12);

      // Verify D1 batch was called atomically: 1 insert for fixedAssets + 12 inserts for lines
      expect(batchedStatements.length).toBe(13);
    });

    it("should post depreciation run atomically to balanced double-entry moves (Debit Beban = Credit Akumulasi)", async () => {
      let batchedStatements: any[] = [];

      // Mock D1 eligible draft line + joined fixed asset
      const mockEligibleRows = [
        [
          "astl_01",              // line.id
          "ast_srv_01",          // line.assetId
          "school_sma_hb",       // line.schoolId
          1,                     // line.sequence
          "2026-02-01",          // line.depreciationDate
          1000000,               // line.amount
          1000000,               // line.accumulatedAmount
          11000000,              // line.remainingValue
          "draft",               // line.status
          null,                  // line.moveId
          Date.now(),            // line.createdAt
          Date.now(),            // line.updatedAt
          // joined fixedAsset:
          "ast_srv_01",          // asset.id
          "school_sma_hb",       // asset.schoolId
          "Server Dell PowerEdge", // asset.name
          "AST-SRV-001",         // asset.code
          "equipment",           // asset.category
          "2026-01-01",          // asset.purchaseDate
          12000000,              // asset.purchaseValue
          0,                     // asset.salvageValue
          12000000,              // asset.depreciableValue
          "straight_line",       // asset.method
          12,                    // asset.durationMonths
          "coa_asset_fixed",     // asset.assetAccountId
          "coa_asset_depr_accum",// asset.depreciationAccountId
          "coa_exp_depr",        // asset.expenseAccountId
          "jrn_misc",            // asset.journalId
          "running",             // asset.status
          null,                  // asset.notes
          Date.now(),            // asset.createdAt
          Date.now(),            // asset.updatedAt
        ],
      ];

      const mockEnv = {
        DB: {
          prepare: (query: string) => ({
            bind: (...args: any[]) => ({
              run: async () => ({ success: true }),
              raw: async () => mockEligibleRows,
            }),
          }),
          batch: async (stmts: any[]) => {
            batchedStatements = stmts;
            return stmts.map(() => ({ results: [], success: true }));
          },
        },
      };

      const res = await app.request(
        "/api/assets/depreciation/post",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolId: "school_sma_hb",
            assetId: "ast_srv_01",
            cutoffDate: "2026-02-28",
          }),
        },
        mockEnv as any
      );

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.postedCount).toBe(1);
      expect(json.data.totalAmount).toBe(1000000);
      expect(json.data.moves).toHaveLength(1);

      // Verify batch statements count:
      // 1 move header + 1 debit line + 1 credit line + 1 status update = 4 statements
      expect(batchedStatements.length).toBe(4);
    });
  });
});
