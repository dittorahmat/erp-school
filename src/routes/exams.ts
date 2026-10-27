import { Hono } from "hono";
import { examManagement } from "../domain";
import type { Bindings } from "../index";

export const examRouter = new Hono<{ Bindings: Bindings }>();

// Exam Sessions
examRouter.get("/sessions", async (c) => {
  const sessions = await examManagement.getSessions(c.env.DB);
  return c.json({ data: sessions });
});

examRouter.get("/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const session = await examManagement.getSessionById(c.env.DB, id);
  if (!session) {
    return c.json({ error: "Exam session not found" }, 404);
  }
  return c.json({ success: true, data: session });
});

examRouter.post("/sessions", async (c) => {
  const body = await c.req.json();
  const newSession = await examManagement.createSession(c.env.DB, body);
  return c.json({ success: true, data: newSession }, 201);
});

examRouter.put("/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updatedSession = await examManagement.updateSession(c.env.DB, id, body);
  if (!updatedSession) {
    return c.json({ error: "Exam session not found" }, 404);
  }
  return c.json({ success: true, data: updatedSession });
});

examRouter.delete("/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const result = await examManagement.deleteSession(c.env.DB, id);
  return c.json({ success: true, data: result });
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
