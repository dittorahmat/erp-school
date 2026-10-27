import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { calculateGrade, compactDefined, generateId } from "../lib/utils";

export interface ExamSessionInput {
  id?: string;
  schoolId?: string;
  academicYearId?: string;
  termId?: string;
  classroomId?: string;
  subjectId?: string;
  name: string;
  examDate?: string;
  totalMarks?: number;
  passingMarks?: number;
  weightage?: number;
  status?: "draft" | "published" | "closed";
}

export type UpdateExamSessionInput = Partial<Omit<ExamSessionInput, "id">>;

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

  async createSession(d1: D1Database, body: ExamSessionInput) {
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

  async updateSession(d1: D1Database, id: string, data: UpdateExamSessionInput) {
    const db = drizzle(d1, { schema });
    const updateData = {
      ...compactDefined({
        name: data.name,
        schoolId: data.schoolId,
        academicYearId: data.academicYearId,
        termId: data.termId,
        classroomId: data.classroomId,
        subjectId: data.subjectId,
        examDate: data.examDate,
        totalMarks: data.totalMarks !== undefined ? Number(data.totalMarks) : undefined,
        passingMarks: data.passingMarks !== undefined ? Number(data.passingMarks) : undefined,
        weightage: data.weightage !== undefined ? Number(data.weightage) : undefined,
        status: data.status,
      }),
      updatedAt: new Date(),
    };

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
      term: `Semester Ganjil ${(await db.select().from(schema.academicYears).where(eq(schema.academicYears.status, "active")).limit(1))[0]?.name || "2026/2027"}`,
      summary: {
        totalSubjects: marks.length,
        averageScore: marks.length > 0 ? (marks.reduce((a, b) => a + b.marksObtained, 0) / marks.length).toFixed(1) : 0,
      },
      grades: marks,
    };
  },
};
