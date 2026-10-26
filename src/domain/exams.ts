import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { generateId, calculateGrade } from "../lib/utils";

export const examManagement = {
  async getSessions(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.examSessions).orderBy(desc(schema.examSessions.examDate));
  },

  async createSession(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newSession = {
      id: body.id || generateId("exam"),
      schoolId: body.schoolId,
      academicYearId: body.academicYearId,
      termId: body.termId,
      classroomId: body.classroomId,
      subjectId: body.subjectId,
      name: body.name,
      examDate: body.examDate,
      totalMarks: body.totalMarks || 100,
      passingMarks: body.passingMarks || 75,
      weightage: body.weightage || 30,
      status: body.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.examSessions).values(newSession);
    return newSession;
  },

  async recordMark(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newMark = {
      id: body.id || generateId("mark"),
      sessionId: body.sessionId,
      studentId: body.studentId,
      marksObtained: body.marksObtained,
      grade: body.grade || calculateGrade(body.marksObtained, 75),
      remark: body.remark || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.examMarks).values(newMark);
    return newMark;
  },

  async getReportCard(d1: D1Database, studentId: string) {
    const db = drizzle(d1, { schema });
    const marks = await db
      .select()
      .from(schema.examMarks)
      .where(eq(schema.examMarks.studentId, studentId));

    return {
      studentId,
      status: "published",
      term: "Semester Ganjil 2025/2026",
      summary: {
        totalSubjects: marks.length,
        averageScore: marks.length > 0 ? (marks.reduce((a, b) => a + b.marksObtained, 0) / marks.length).toFixed(1) : 0,
      },
      grades: marks,
    };
  },
};
