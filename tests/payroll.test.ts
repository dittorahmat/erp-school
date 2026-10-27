import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("HR & Payroll API Suite (Odoo/OpenEduCat Model)", () => {
  it("should return empty list or 200 on GET /api/payroll/employees", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [],
          }),
        }),
      },
    };
    const res = await app.request("/api/payroll/employees", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("should create employee on POST /api/payroll/employees", async () => {
    let boundValues: any[] = [];
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: (...args: any[]) => ({
            run: async () => {
              boundValues = args;
              return { success: true };
            },
            raw: async () => [],
          }),
        }),
      },
    };

    const payload = {
      schoolId: "school_sma_hb",
      name: "Budi Santoso, S.Pd",
      nip: "198501012010011001",
      email: "budi.santoso@sekolah.id",
      type: "faculty",
      jobTitle: "Guru Fisika & Wali Kelas",
      bankName: "BCA",
      bankAccountNumber: "8820129381",
    };

    const res = await app.request(
      "/api/payroll/employees",
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
    expect(json.data.name).toBe("Budi Santoso, S.Pd");
    expect(json.data.type).toBe("faculty");
  });

  it("should reject employee creation when required fields are missing", async () => {
    const mockEnv = { DB: {} };
    const res = await app.request(
      "/api/payroll/employees",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Incomplete Guru" }),
      },
      mockEnv as any
    );
    expect(res.status).toBe(400);
  });

  it("should set salary structure on POST /api/payroll/structures", async () => {
    const mockEnv = {
      DB: {
        prepare: (query: string) => ({
          bind: (...args: any[]) => ({
            run: async () => ({ success: true }),
            raw: async () => [], // returns empty for existing structure check
          }),
        }),
      },
    };

    const payload = {
      schoolId: "school_sma_hb",
      employeeId: "emp_budi",
      baseSalary: 4500000,
      hourlyTeachingRate: 75000,
      fixedAllowance: 500000,
      fixedDeduction: 150000,
    };

    const res = await app.request(
      "/api/payroll/structures",
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
    expect(json.data.baseSalary).toBe(4500000);
    expect(json.data.hourlyTeachingRate).toBe(75000);
  });
});
