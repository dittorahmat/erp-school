import { Hono } from "hono";
import { attendanceManagement } from "../domain/attendance";
import type { Bindings } from "../index";

export const attendanceRouter = new Hono<{ Bindings: Bindings }>();

// Timetables
attendanceRouter.get("/timetables", async (c) => {
  const list = await attendanceManagement.getTimetables(c.env.DB);
  return c.json({ data: list });
});

attendanceRouter.post("/timetables", async (c) => {
  const body = await c.req.json();
  const entry = await attendanceManagement.createTimetable(c.env.DB, body);
  return c.json({ success: true, data: entry }, 201);
});

// Attendance Sheets & Lines
attendanceRouter.get("/sheets", async (c) => {
  const sheets = await attendanceManagement.getSheets(c.env.DB);
  return c.json({ data: sheets });
});

attendanceRouter.post("/sheets", async (c) => {
  const body = await c.req.json();
  const sheet = await attendanceManagement.recordSheet(c.env.DB, body);
  return c.json({ success: true, data: sheet }, 201);
});
