import { Hono } from "hono";
import { examManagement } from "../domain/exams";
import type { Bindings } from "../index";

export const examRouter = new Hono<{ Bindings: Bindings }>();

// Exam Sessions
examRouter.get("/sessions", async (c) => {
  const sessions = await examManagement.getSessions(c.env.DB);
  return c.json({ data: sessions });
});

examRouter.post("/sessions", async (c) => {
  const body = await c.req.json();
  const newSession = await examManagement.createSession(c.env.DB, body);
  return c.json({ success: true, data: newSession }, 201);
});

// Grade Marks Entry (Gradebook)
examRouter.post("/marks", async (c) => {
  const body = await c.req.json();
  const newMark = await examManagement.recordMark(c.env.DB, body);
  return c.json({ success: true, data: newMark }, 201);
});

// Student Report Card (Rapor Digital)
examRouter.get("/report-card/:studentId", async (c) => {
  const studentId = c.req.param("studentId");
  const report = await examManagement.getReportCard(c.env.DB, studentId);
  return c.json(report);
});
