import { Hono } from "hono";
import { portalManagement } from "../domain/portal";
import type { Bindings } from "../index";

export const portalRouter = new Hono<{ Bindings: Bindings }>();

// Helper to resolve session or headers for current user
const getUserFromContext = (c: any) => {
  const userId =
    c.req.header("x-user-id") ||
    c.req.query("userId") ||
    "usr_student_andi";
  const role =
    c.req.header("x-user-role") ||
    c.req.query("role") ||
    "student";
  return { userId, role };
};

// GET /api/portal/overview
portalRouter.get("/overview", async (c) => {
  const { userId, role } = getUserFromContext(c);
  const targetStudentId = c.req.query("studentId") || null;

  try {
    const scope = await portalManagement.resolvePortalScope(c.env.DB, userId, role);
    const overview = await portalManagement.getPortalOverview(c.env.DB, scope, targetStudentId);
    return c.json({ success: true, data: overview });
  } catch (err: any) {
    const status = err.message?.includes("Access Denied") ? 403 : 500;
    return c.json({ success: false, error: err.message }, status);
  }
});

// GET /api/portal/timetable
portalRouter.get("/timetable", async (c) => {
  const { userId, role } = getUserFromContext(c);
  const targetStudentId = c.req.query("studentId") || null;

  try {
    const scope = await portalManagement.resolvePortalScope(c.env.DB, userId, role);
    const timetable = await portalManagement.getStudentTimetable(c.env.DB, scope, targetStudentId);
    return c.json({ success: true, data: timetable });
  } catch (err: any) {
    const status = err.message?.includes("Access Denied") ? 403 : 500;
    return c.json({ success: false, error: err.message }, status);
  }
});

// GET /api/portal/attendance
portalRouter.get("/attendance", async (c) => {
  const { userId, role } = getUserFromContext(c);
  const targetStudentId = c.req.query("studentId") || null;

  try {
    const scope = await portalManagement.resolvePortalScope(c.env.DB, userId, role);
    const attendance = await portalManagement.getStudentAttendance(c.env.DB, scope, targetStudentId);
    return c.json({ success: true, data: attendance });
  } catch (err: any) {
    const status = err.message?.includes("Access Denied") ? 403 : 500;
    return c.json({ success: false, error: err.message }, status);
  }
});

// GET /api/portal/grades
portalRouter.get("/grades", async (c) => {
  const { userId, role } = getUserFromContext(c);
  const targetStudentId = c.req.query("studentId") || null;

  try {
    const scope = await portalManagement.resolvePortalScope(c.env.DB, userId, role);
    const grades = await portalManagement.getStudentGrades(c.env.DB, scope, targetStudentId);
    return c.json({ success: true, data: grades });
  } catch (err: any) {
    const status = err.message?.includes("Access Denied") ? 403 : 500;
    return c.json({ success: false, error: err.message }, status);
  }
});

// GET /api/portal/invoices
portalRouter.get("/invoices", async (c) => {
  const { userId, role } = getUserFromContext(c);
  const targetStudentId = c.req.query("studentId") || null;

  try {
    const scope = await portalManagement.resolvePortalScope(c.env.DB, userId, role);
    const invoices = await portalManagement.getStudentInvoices(c.env.DB, scope, targetStudentId);
    return c.json({ success: true, data: invoices });
  } catch (err: any) {
    const status = err.message?.includes("Access Denied") ? 403 : 500;
    return c.json({ success: false, error: err.message }, status);
  }
});
