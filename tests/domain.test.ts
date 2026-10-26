import { describe, it, expect } from "vitest";
import { accountingEngine } from "../src/domain/accounting";
import { stockTransfer } from "../src/domain/inventory";
import { attendanceManagement } from "../src/domain/attendance";
import { createMockD1Database } from "./helpers/d1-mock";

describe("Domain Modules Seam & Depth Tests", () => {
  describe("Accounting Engine Module", () => {
    it("should calculate balanced trial balance directly through module interface", async () => {
      const mockD1 = createMockD1Database([]);
      const balance = await accountingEngine.getTrialBalance(mockD1);
      expect(balance.isBalanced).toBe(true);
      expect(balance.totalDebit).toBe(0);
      expect(balance.totalCredit).toBe(0);
    });

    it("should compile balanced journal entry statements atomically without HTTP layer", async () => {
      let batchedStatements: any[] = [];
      const mockD1 = {
        ...createMockD1Database([]),
        batch: async (statements: any[]) => {
          batchedStatements = statements;
          return statements.map(() => ({ results: [], success: true }));
        },
      } as unknown as D1Database;

      const invoice = await accountingEngine.createInvoice(mockD1, {
        studentId: "std_01",
        amountTotal: 750000,
        description: "SPP Desember 2026",
      });

      expect(invoice.amountTotal).toBe(750000);
      expect(invoice.amountResidual).toBe(750000);
      expect(batchedStatements.length).toBe(3); // 1 move + 1 debit line + 1 credit line
    });
  });

  describe("Stock Transfer Module", () => {
    it("should execute stock transfer and batch picking + moves atomically", async () => {
      let batchedCount = 0;
      const mockD1 = {
        ...createMockD1Database([]),
        batch: async (statements: any[]) => {
          batchedCount = statements.length;
          return statements.map(() => ({ results: [], success: true }));
        },
      } as unknown as D1Database;

      const picking = await stockTransfer.executeTransfer(mockD1, {
        schoolId: "school_sma_hb",
        pickingType: "outgoing",
        moves: [
          { productId: "prod_01", locationId: "loc_wh", locationDestId: "loc_student", productQty: 2 },
          { productId: "prod_02", locationId: "loc_wh", locationDestId: "loc_student", productQty: 1 },
        ],
      });

      expect(picking.pickingType).toBe("outgoing");
      expect(picking.state).toBe("done");
      expect(batchedCount).toBe(2); // 1 picking + 1 bulk moves
    });
  });

  describe("Attendance Management Module", () => {
    it("should derive headcounts internally and commit sheet + lines atomically", async () => {
      const mockD1 = {
        ...createMockD1Database([]),
        batch: async (statements: any[]) => {
          return statements.map(() => ({ results: [], success: true }));
        },
      } as unknown as D1Database;

      const sheet = await attendanceManagement.recordSheet(mockD1, {
        schoolId: "school_sma_hb",
        classroomId: "cls_10a",
        facultyId: "fac_01",
        lines: [
          { studentId: "std_01", status: "present" },
          { studentId: "std_02", status: "absent" },
          { studentId: "std_03", status: "sick" },
          { studentId: "std_04", status: "excused" },
          { studentId: "std_05", status: "present" },
        ],
      });

      expect(sheet.totalPresent).toBe(2);
      expect(sheet.totalAbsent).toBe(1);
      expect(sheet.totalSick).toBe(1);
      expect(sheet.totalExcused).toBe(1);
    });
  });
});
