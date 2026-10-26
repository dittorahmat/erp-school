import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import type { Bindings } from "../index";
import { generateId } from "../lib/utils";

export const attendanceRouter = new Hono<{ Bindings: Bindings }>();

// --------------------------------------------------------------------------
// Timetables
// --------------------------------------------------------------------------
attendanceRouter.get("/timetables", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const list = await db.select().from(schema.timetables).orderBy(schema.timetables.dayOfWeek);
  return c.json({ data: list });
});

attendanceRouter.post("/timetables", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const newEntry = {
    id: body.id || generateId("tt"),
    schoolId: body.schoolId,
    classroomId: body.classroomId,
    subjectId: body.subjectId,
    facultyId: body.facultyId,
    dayOfWeek: body.dayOfWeek,
    startTime: body.startTime,
    endTime: body.endTime,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.insert(schema.timetables).values(newEntry);
  return c.json({ success: true, data: newEntry }, 201);
});

// --------------------------------------------------------------------------
// Attendance Sheets & Lines
// --------------------------------------------------------------------------
attendanceRouter.get("/sheets", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const sheets = await db.select().from(schema.attendanceSheets).orderBy(desc(schema.attendanceSheets.date));
  return c.json({ data: sheets });
});

attendanceRouter.post("/sheets", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const sheetId = body.id || generateId("att");

  const newSheet = {
    id: sheetId,
    schoolId: body.schoolId,
    classroomId: body.classroomId,
    facultyId: body.facultyId,
    timetableId: body.timetableId || null,
    date: body.date || new Date().toISOString().split("T")[0],
    status: body.status || "confirmed",
    totalPresent: body.totalPresent || 0,
    totalAbsent: body.totalAbsent || 0,
    totalSick: body.totalSick || 0,
    totalExcused: body.totalExcused || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const statements: any[] = [db.insert(schema.attendanceSheets).values(newSheet)];

  if (body.lines && Array.isArray(body.lines) && body.lines.length > 0) {
    const linesToInsert = body.lines.map((l: any) => ({
      id: generateId("line"),
      sheetId: sheetId,
      studentId: l.studentId,
      status: l.status || "present",
      remark: l.remark || null,
      createdAt: new Date()
    }));
    statements.push(db.insert(schema.attendanceLines).values(linesToInsert));
  }

  await db.batch(statements as [any, ...any[]]);

  return c.json({ success: true, data: newSheet }, 201);
});
