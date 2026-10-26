import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, desc } from "drizzle-orm";
import type { Bindings } from "../index";
import { generateId, calculateGrade } from "../lib/utils";

export const examRouter = new Hono<{ Bindings: Bindings }>();

// --------------------------------------------------------------------------
// Exam Sessions
// --------------------------------------------------------------------------
examRouter.get("/sessions", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const sessions = await db.select().from(schema.examSessions).orderBy(desc(schema.examSessions.examDate));
  return c.json({ data: sessions });
});

examRouter.post("/sessions", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
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
    updatedAt: new Date()
  };
  await db.insert(schema.examSessions).values(newSession);
  return c.json({ success: true, data: newSession }, 201);
});

// --------------------------------------------------------------------------
// Grade Marks Entry (Gradebook)
// --------------------------------------------------------------------------
examRouter.post("/marks", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });

  const newMark = {
    id: body.id || generateId("mark"),
    sessionId: body.sessionId,
    studentId: body.studentId,
    marksObtained: body.marksObtained,
    grade: body.grade || calculateGrade(body.marksObtained, 75),
    remark: body.remark || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(schema.examMarks).values(newMark);
  return c.json({ success: true, data: newMark }, 201);
});

// --------------------------------------------------------------------------
// Student Report Card (Rapor Digital)
// --------------------------------------------------------------------------
examRouter.get("/report-card/:studentId", async (c) => {
  const studentId = c.req.param("studentId");
  const db = drizzle(c.env.DB, { schema });

  const marks = await db
    .select()
    .from(schema.examMarks)
    .where(eq(schema.examMarks.studentId, studentId));

  return c.json({
    studentId,
    status: "published",
    term: "Semester Ganjil 2025/2026",
    summary: {
      totalSubjects: marks.length,
      averageScore: marks.length > 0 ? (marks.reduce((a, b) => a + b.marksObtained, 0) / marks.length).toFixed(1) : 0
    },
    grades: marks
  });
});
