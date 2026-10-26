import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import { generateId } from "../lib/utils";

export interface AttendanceLineInput {
  studentId: string;
  status?: "present" | "absent" | "late" | "excused" | "sick";
  remark?: string | null;
}

export interface RecordAttendanceParams {
  id?: string;
  schoolId: string;
  classroomId: string;
  facultyId: string;
  timetableId?: string | null;
  date?: string;
  status?: string;
  lines?: AttendanceLineInput[];
}

/**
 * Deep Attendance Management Module.
 * Encapsulates attendance sheet persistence, line items, and server-side headcount tallying.
 */
export const attendanceManagement = {
  async getTimetables(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.timetables).orderBy(schema.timetables.dayOfWeek);
  },

  async createTimetable(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
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
      updatedAt: new Date(),
    };
    await db.insert(schema.timetables).values(newEntry);
    return newEntry;
  },

  async getSheets(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.attendanceSheets).orderBy(desc(schema.attendanceSheets.date));
  },

  async recordSheet(d1: D1Database, params: RecordAttendanceParams) {
    const db = drizzle(d1, { schema });
    const sheetId = params.id || generateId("att");
    const lines = params.lines || [];

    // Derive headcounts internally to protect integrity
    const totalPresent = lines.filter((l) => !l.status || l.status === "present").length;
    const totalAbsent = lines.filter((l) => l.status === "absent").length;
    const totalSick = lines.filter((l) => l.status === "sick").length;
    const totalExcused = lines.filter((l) => l.status === "excused" || l.status === "late").length;

    const newSheet = {
      id: sheetId,
      schoolId: params.schoolId,
      classroomId: params.classroomId,
      facultyId: params.facultyId,
      timetableId: params.timetableId || null,
      date: params.date || new Date().toISOString().split("T")[0],
      status: params.status || "confirmed",
      totalPresent,
      totalAbsent,
      totalSick,
      totalExcused,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const statements: any[] = [db.insert(schema.attendanceSheets).values(newSheet)];

    if (lines.length > 0) {
      const linesToInsert = lines.map((l) => ({
        id: generateId("line"),
        sheetId,
        studentId: l.studentId,
        status: l.status || "present",
        remark: l.remark || null,
        createdAt: new Date(),
      }));
      statements.push(db.insert(schema.attendanceLines).values(linesToInsert));
    }

    await db.batch(statements as [any, ...any[]]);
    return newSheet;
  },
};
