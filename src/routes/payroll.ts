import { Hono } from "hono";
import { payrollEngine } from "../domain";
import type { Bindings } from "../index";

export const payrollRouter = new Hono<{ Bindings: Bindings }>();

// Employees (Guru & Staf)
payrollRouter.get("/employees", async (c) => {
  const schoolId = c.req.query("schoolId");
  const employees = await payrollEngine.getEmployees(c.env.DB, schoolId);
  return c.json({ data: employees });
});

payrollRouter.post("/employees", async (c) => {
  const body = await c.req.json();
  if (!body.schoolId || !body.name || !body.nip || !body.email || !body.jobTitle) {
    return c.json({ error: "schoolId, name, nip, email, and jobTitle are required" }, 400);
  }
  const employee = await payrollEngine.createEmployee(c.env.DB, body);
  return c.json({ success: true, data: employee }, 201);
});

payrollRouter.put("/employees/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const employee = await payrollEngine.updateEmployee(c.env.DB, id, body);
  if (!employee) return c.json({ error: "Employee not found" }, 404);
  return c.json({ success: true, data: employee });
});

// Salary Structures / Contracts
payrollRouter.get("/structures", async (c) => {
  const schoolId = c.req.query("schoolId");
  const structures = await payrollEngine.getSalaryStructures(c.env.DB, schoolId);
  return c.json({ data: structures });
});

payrollRouter.post("/structures", async (c) => {
  const body = await c.req.json();
  if (!body.schoolId || !body.employeeId) {
    return c.json({ error: "schoolId and employeeId are required" }, 400);
  }
  const structure = await payrollEngine.setSalaryStructure(c.env.DB, body);
  return c.json({ success: true, data: structure }, 201);
});

// Monthly Batch Run & Payslips
payrollRouter.get("/payslips", async (c) => {
  const schoolId = c.req.query("schoolId");
  const employeeId = c.req.query("employeeId");
  const slips = await payrollEngine.getPayslips(c.env.DB, schoolId, employeeId);
  return c.json({ data: slips });
});

payrollRouter.get("/batches", async (c) => {
  const schoolId = c.req.query("schoolId");
  const batches = await payrollEngine.getBatchRuns(c.env.DB, schoolId);
  return c.json({ data: batches });
});

// Batch generation handler supporting both /batches/generate and spec canonical /batch/generate
const handleBatchGenerate = async (c: any) => {
  const body = await c.req.json();
  const schoolId = body.schoolId || c.req.header("x-school-id") || c.req.query("schoolId");
  if (!schoolId) {
    return c.json({ error: "schoolId is required" }, 400);
  }
  const month = Number(body.month || new Date().getMonth() + 1);
  const year = Number(body.year || new Date().getFullYear());
  const result = await payrollEngine.generateMonthlyPayslipBatch(
    c.env.DB,
    schoolId,
    month,
    year,
    body.name
  );
  return c.json({ success: true, data: result }, 201);
};

payrollRouter.post("/batches/generate", handleBatchGenerate);
payrollRouter.post("/batch/generate", handleBatchGenerate);

// Batch confirmation handler supporting both /batches/confirm and spec canonical /batch/confirm
const handleBatchConfirm = async (c: any) => {
  const body = await c.req.json();
  const schoolId = body.schoolId || c.req.header("x-school-id") || c.req.query("schoolId");
  if (!schoolId) {
    return c.json({ error: "schoolId is required" }, 400);
  }
  const batchRunId = body.batchRunId;
  if (!batchRunId) {
    return c.json({ error: "batchRunId is required" }, 400);
  }
  try {
    const result = await payrollEngine.confirmPayslipBatch(
      c.env.DB,
      schoolId,
      batchRunId,
      {
        expenseAccountId: body.expenseAccountId,
        paymentAccountId: body.paymentAccountId,
      }
    );
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to confirm batch" }, 400);
  }
};

payrollRouter.post("/batches/confirm", handleBatchConfirm);
payrollRouter.post("/batch/confirm", handleBatchConfirm);
