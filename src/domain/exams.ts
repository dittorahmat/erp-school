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

  async getSessionById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db.select().from(schema.examSessions).where(eq(schema.examSessions.id, id)).limit(1);
    return results[0] || null;
  },

  async createSession(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newSession = {
      id: body.id || generateId("exam"),
      schoolId: body.schoolId || "sch_smp_01",
      academicYearId: body.academicYearId || "ay_2025_ganjil",
      termId: body.termId || "term_01",
      classroomId: body.classroomId || "cls_x_mipa_1",
      subjectId: body.subjectId || "sub_mat_10",
      name: body.name,
      examDate: body.examDate || new Date().toISOString().split("T")[0],
      totalMarks: body.totalMarks !== undefined ? Number(body.totalMarks) : 100,
      passingMarks: body.passingMarks !== undefined ? Number(body.passingMarks) : 75,
      weightage: body.weightage !== undefined ? Number(body.weightage) : 30,
      status: body.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.examSessions).values(newSession);
    return newSession;
  },

  async updateSession(d1: D1Database, id: string, data: any) {
    const db = drizzle(d1, { schema });
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
    if (data.academicYearId !== undefined) updateData.academicYearId = data.academicYearId;
    if (data.termId !== undefined) updateData.termId = data.termId;
    if (data.classroomId !== undefined) updateData.classroomId = data.classroomId;
    if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
    if (data.examDate !== undefined) updateData.examDate = data.examDate;
    if (data.totalMarks !== undefined) updateData.totalMarks = Number(data.totalMarks);
    if (data.passingMarks !== undefined) updateData.passingMarks = Number(data.passingMarks);
    if (data.weightage !== undefined) updateData.weightage = Number(data.weightage);
    if (data.status !== undefined) updateData.status = data.status;

    await db.update(schema.examSessions).set(updateData).where(eq(schema.examSessions.id, id));
    return this.getSessionById(d1, id);
  },

  async deleteSession(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    await db.batch([
      db.delete(schema.examMarks).where(eq(schema.examMarks.sessionId, id)),
      db.delete(schema.examSessions).where(eq(schema.examSessions.id, id)),
    ]);
    return { success: true, id };
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
