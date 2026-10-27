import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "../lib/utils";

export interface CreateEmployeeParams {
  id?: string;
  schoolId: string;
  userId?: string | null;
  name: string;
  nip: string;
  email: string;
  phone?: string | null;
  type?: "faculty" | "staff";
  department?: string | null;
  jobTitle: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  status?: "active" | "inactive";
}

export interface SetSalaryStructureParams {
  id?: string;
  schoolId: string;
  employeeId: string;
  baseSalary: number;
  hourlyTeachingRate?: number;
  fixedAllowance?: number;
  fixedDeduction?: number;
}

/**
 * Deep HR & Payroll Engine Module.
 * Encapsulates employee master, contract rules, teaching session tallies,
 * batch payslip generation, and Cloudflare D1 atomic double-entry move posting.
 */
export const payrollEngine = {
  async getEmployees(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    if (schoolId) {
      return db
        .select()
        .from(schema.employees)
        .where(eq(schema.employees.schoolId, schoolId))
        .orderBy(schema.employees.name);
    }
    return db.select().from(schema.employees).orderBy(schema.employees.name);
  },

  async getEmployeeById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, id))
      .limit(1);
    return results[0] || null;
  },

  async createEmployee(d1: D1Database, params: CreateEmployeeParams) {
    const db = drizzle(d1, { schema });
    const id = params.id || generateId("emp");
    const employee = {
      id,
      schoolId: params.schoolId,
      userId: params.userId || null,
      name: params.name,
      nip: params.nip,
      email: params.email,
      phone: params.phone || null,
      type: params.type || "faculty",
      department: params.department || null,
      jobTitle: params.jobTitle,
      bankName: params.bankName || null,
      bankAccountNumber: params.bankAccountNumber || null,
      status: params.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.employees).values(employee);
    return employee;
  },

  async updateEmployee(d1: D1Database, id: string, params: Partial<CreateEmployeeParams>) {
    const db = drizzle(d1, { schema });
    const updateData: any = { updatedAt: new Date() };
    if (params.name !== undefined) updateData.name = params.name;
    if (params.nip !== undefined) updateData.nip = params.nip;
    if (params.email !== undefined) updateData.email = params.email;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.type !== undefined) updateData.type = params.type;
    if (params.department !== undefined) updateData.department = params.department;
    if (params.jobTitle !== undefined) updateData.jobTitle = params.jobTitle;
    if (params.bankName !== undefined) updateData.bankName = params.bankName;
    if (params.bankAccountNumber !== undefined) updateData.bankAccountNumber = params.bankAccountNumber;
    if (params.status !== undefined) updateData.status = params.status;

    await db.update(schema.employees).set(updateData).where(eq(schema.employees.id, id));
    return this.getEmployeeById(d1, id);
  },

  async getSalaryStructures(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    const structures = await db
      .select({
        id: schema.salaryStructures.id,
        schoolId: schema.salaryStructures.schoolId,
        employeeId: schema.salaryStructures.employeeId,
        baseSalary: schema.salaryStructures.baseSalary,
        hourlyTeachingRate: schema.salaryStructures.hourlyTeachingRate,
        fixedAllowance: schema.salaryStructures.fixedAllowance,
        fixedDeduction: schema.salaryStructures.fixedDeduction,
        status: schema.salaryStructures.status,
        employeeName: schema.employees.name,
        employeeNip: schema.employees.nip,
        jobTitle: schema.employees.jobTitle,
      })
      .from(schema.salaryStructures)
      .leftJoin(schema.employees, eq(schema.salaryStructures.employeeId, schema.employees.id))
      .where(schoolId ? eq(schema.salaryStructures.schoolId, schoolId) : sql`1=1`);
    return structures;
  },

  async setSalaryStructure(d1: D1Database, params: SetSalaryStructureParams) {
    const db = drizzle(d1, { schema });
    const existing = await db
      .select()
      .from(schema.salaryStructures)
      .where(
        and(
          eq(schema.salaryStructures.employeeId, params.employeeId),
          eq(schema.salaryStructures.status, "active")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const structId = existing[0].id;
      await db
        .update(schema.salaryStructures)
        .set({
          baseSalary: Number(params.baseSalary || 0),
          hourlyTeachingRate: Number(params.hourlyTeachingRate || 0),
          fixedAllowance: Number(params.fixedAllowance || 0),
          fixedDeduction: Number(params.fixedDeduction || 0),
          updatedAt: new Date(),
        })
        .where(eq(schema.salaryStructures.id, structId));

      return { ...existing[0], ...params, id: structId };
    }

    const id = params.id || generateId("sal_str");
    const newStructure = {
      id,
      schoolId: params.schoolId,
      employeeId: params.employeeId,
      baseSalary: Number(params.baseSalary || 0),
      hourlyTeachingRate: Number(params.hourlyTeachingRate || 0),
      fixedAllowance: Number(params.fixedAllowance || 0),
      fixedDeduction: Number(params.fixedDeduction || 0),
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.salaryStructures).values(newStructure);
    return newStructure;
  },

  /**
   * Calculates teaching sessions held by teacher in given month/year.
   */
  async getTeachingSessionsCount(d1: D1Database, employeeId: string, month: number, year: number) {
    const db = drizzle(d1, { schema });
    const padMonth = month.toString().padStart(2, "0");
    const prefix = `${year}-${padMonth}`;

    const sheets = await db
      .select()
      .from(schema.attendanceSheets)
      .where(
        and(
          eq(schema.attendanceSheets.facultyId, employeeId),
          sql`${schema.attendanceSheets.date} LIKE ${prefix + "%"}`
        )
      );

    return sheets.length;
  },

  async calculateEmployeePayslip(
    d1: D1Database,
    employeeId: string,
    month: number,
    year: number
  ) {
    const db = drizzle(d1, { schema });
    const emp = await this.getEmployeeById(d1, employeeId);
    if (!emp) throw new Error("Employee not found");

    const structureList = await db
      .select()
      .from(schema.salaryStructures)
      .where(
        and(
          eq(schema.salaryStructures.employeeId, employeeId),
          eq(schema.salaryStructures.status, "active")
        )
      )
      .limit(1);

    const structure = structureList[0];
    const baseSalary = structure ? structure.baseSalary : 0;
    const hourlyRate = structure ? structure.hourlyTeachingRate : 0;
    const allowance = structure ? structure.fixedAllowance : 0;
    const deduction = structure ? structure.fixedDeduction : 0;

    let teachingSessions = 0;
    if (emp.type === "faculty" && hourlyRate > 0) {
      teachingSessions = await this.getTeachingSessionsCount(d1, employeeId, month, year);
    }
    const teachingHonor = teachingSessions * hourlyRate;
    const netSalary = Math.max(0, baseSalary + teachingHonor + allowance - deduction);

    return {
      employeeId,
      employeeName: emp.name,
      employeeNip: emp.nip,
      periodMonth: month,
      periodYear: year,
      baseSalary,
      teachingSessionsCount: teachingSessions,
      teachingHonorAmount: teachingHonor,
      allowanceAmount: allowance,
      deductionAmount: deduction,
      netSalary,
    };
  },

  async generateMonthlyPayslipBatch(
    d1: D1Database,
    schoolId: string,
    month: number,
    year: number,
    name?: string
  ) {
    const db = drizzle(d1, { schema });
    const employeesList = await db
      .select()
      .from(schema.employees)
      .where(and(eq(schema.employees.schoolId, schoolId), eq(schema.employees.status, "active")));

    const batchRunId = generateId("pay_batch");
    let totalBatchAmount = 0;
    const slipStatements: any[] = [];
    const generatedSlips: any[] = [];

    for (const emp of employeesList) {
      const calc = await this.calculateEmployeePayslip(d1, emp.id, month, year);
      const slipId = generateId("slip");
      const slip = {
        id: slipId,
        schoolId,
        batchRunId,
        employeeId: emp.id,
        periodMonth: month,
        periodYear: year,
        baseSalary: calc.baseSalary,
        teachingSessionsCount: calc.teachingSessionsCount,
        teachingHonorAmount: calc.teachingHonorAmount,
        allowanceAmount: calc.allowanceAmount,
        deductionAmount: calc.deductionAmount,
        netSalary: calc.netSalary,
        status: "draft" as const,
        moveId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      totalBatchAmount += calc.netSalary;
      generatedSlips.push({ ...slip, employeeName: emp.name, employeeNip: emp.nip });
      slipStatements.push(db.insert(schema.payslips).values(slip));
    }

    const batchRun = {
      id: batchRunId,
      schoolId,
      name: name || `Gaji Guru & Staf Periode ${month}/${year}`,
      periodMonth: month,
      periodYear: year,
      totalAmount: totalBatchAmount,
      totalEmployees: employeesList.length,
      status: "draft" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.batch([
      db.insert(schema.payslipBatchRuns).values(batchRun),
      ...slipStatements,
    ]);

    return { batchRun, payslips: generatedSlips };
  },

  async confirmPayslipBatch(
    d1: D1Database,
    schoolId: string,
    batchRunId: string,
    params?: { expenseAccountId?: string; paymentAccountId?: string }
  ) {
    const db = drizzle(d1, { schema });
    const batchList = await db
      .select()
      .from(schema.payslipBatchRuns)
      .where(
        and(
          eq(schema.payslipBatchRuns.id, batchRunId),
          eq(schema.payslipBatchRuns.schoolId, schoolId)
        )
      )
      .limit(1);

    if (batchList.length === 0) throw new Error("Payslip batch not found");
    const batch = batchList[0];
    if (batch.status === "confirmed") throw new Error("Batch sudah pernah dikonfirmasi");

    const slips = await db
      .select()
      .from(schema.payslips)
      .where(eq(schema.payslips.batchRunId, batchRunId));

    const totalGross = slips.reduce(
      (sum, s) => sum + s.baseSalary + s.teachingHonorAmount + s.allowanceAmount,
      0
    );
    const totalDeductions = slips.reduce((sum, s) => sum + s.deductionAmount, 0);
    const totalNet = slips.reduce((sum, s) => sum + s.netSalary, 0);

    // Dynamically resolve COA accounts for school if not explicitly provided
    const allAccounts = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.schoolId, schoolId));

    const expenseAccountId =
      params?.expenseAccountId ||
      allAccounts.find((a) => a.type === "expense" && a.code.startsWith("5-11"))?.id ||
      allAccounts.find((a) => a.type === "expense")?.id ||
      "coa_exp_salary";

    const paymentAccountId =
      params?.paymentAccountId ||
      allAccounts.find((a) => a.type === "asset" && (a.code.startsWith("1-11") || a.reconcile))?.id ||
      allAccounts.find((a) => a.type === "asset")?.id ||
      "coa_cash";

    const deductionLiabilityAccountId =
      allAccounts.find((a) => a.type === "liability" && a.code.startsWith("2-11"))?.id ||
      allAccounts.find((a) => a.type === "liability")?.id ||
      "coa_liab_deduction";

    const moveId = generateId("move_pay");
    const journalMove = {
      id: moveId,
      schoolId,
      journalId: "jrn_payroll",
      name: `PAYROLL/${batch.periodYear}/${batch.periodMonth.toString().padStart(2, "0")}/${batch.id.slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      moveType: "entry",
      amountTotal: totalGross,
      amountResidual: 0,
      state: "posted",
      paymentState: "paid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Debit: Beban Gaji Bruto
    const debitLine = {
      id: generateId("aml_deb"),
      moveId,
      accountId: expenseAccountId,
      name: `Beban Gaji Bruto Guru/Staf - ${batch.name}`,
      debit: totalGross,
      credit: 0,
      reconciled: false,
      createdAt: new Date(),
    };

    // Credit: Kas/Bank Netto Dibayarkan
    const creditLine = {
      id: generateId("aml_crd"),
      moveId,
      accountId: paymentAccountId,
      name: `Kas Pembayaran Gaji Bersih - ${batch.name}`,
      debit: 0,
      credit: totalNet,
      reconciled: false,
      createdAt: new Date(),
    };

    const stmts: any[] = [
      db
        .update(schema.payslipBatchRuns)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(schema.payslipBatchRuns.id, batchRunId)),
      db
        .update(schema.payslips)
        .set({ status: "confirmed", moveId, updatedAt: new Date() })
        .where(eq(schema.payslips.batchRunId, batchRunId)),
      db.insert(schema.accountMoves).values(journalMove),
      db.insert(schema.accountMoveLines).values(debitLine),
      db.insert(schema.accountMoveLines).values(creditLine),
    ];

    // Jika ada potongan (BPJS/kasbon), catat credit akun liabilitas penampung potongan sehingga total Debit == total Credit
    if (totalDeductions > 0) {
      const deductionLine = {
        id: generateId("aml_ded"),
        moveId,
        accountId: deductionLiabilityAccountId,
        name: `Potongan Gaji / BPJS Guru/Staf - ${batch.name}`,
        debit: 0,
        credit: totalDeductions,
        reconciled: false,
        createdAt: new Date(),
      };
      stmts.push(db.insert(schema.accountMoveLines).values(deductionLine));
    }

    await db.batch(stmts as any);
    return { success: true, batchRunId, moveId, totalGross, totalNet, totalDeductions };
  },

  async getPayslips(d1: D1Database, schoolId?: string, employeeId?: string) {
    const db = drizzle(d1, { schema });
    let query = db
      .select({
        id: schema.payslips.id,
        schoolId: schema.payslips.schoolId,
        batchRunId: schema.payslips.batchRunId,
        employeeId: schema.payslips.employeeId,
        employeeName: schema.employees.name,
        employeeNip: schema.employees.nip,
        periodMonth: schema.payslips.periodMonth,
        periodYear: schema.payslips.periodYear,
        baseSalary: schema.payslips.baseSalary,
        teachingSessionsCount: schema.payslips.teachingSessionsCount,
        teachingHonorAmount: schema.payslips.teachingHonorAmount,
        allowanceAmount: schema.payslips.allowanceAmount,
        deductionAmount: schema.payslips.deductionAmount,
        netSalary: schema.payslips.netSalary,
        status: schema.payslips.status,
        moveId: schema.payslips.moveId,
        createdAt: schema.payslips.createdAt,
      })
      .from(schema.payslips)
      .leftJoin(schema.employees, eq(schema.payslips.employeeId, schema.employees.id))
      .orderBy(desc(schema.payslips.createdAt));

    if (employeeId && schoolId) {
      return query.where(
        and(eq(schema.payslips.schoolId, schoolId), eq(schema.payslips.employeeId, employeeId))
      );
    }
    if (schoolId) {
      return query.where(eq(schema.payslips.schoolId, schoolId));
    }
    if (employeeId) {
      return query.where(eq(schema.payslips.employeeId, employeeId));
    }
    return query;
  },

  async getBatchRuns(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    if (schoolId) {
      return db
        .select()
        .from(schema.payslipBatchRuns)
        .where(eq(schema.payslipBatchRuns.schoolId, schoolId))
        .orderBy(desc(schema.payslipBatchRuns.createdAt));
    }
    return db
      .select()
      .from(schema.payslipBatchRuns)
      .orderBy(desc(schema.payslipBatchRuns.createdAt));
  },
};
