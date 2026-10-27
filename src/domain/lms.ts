import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { calculateGrade, generateId } from "../lib/utils";

export interface CreateAssignmentInput {
  id?: string;
  schoolId?: string;
  classroomId: string;
  subjectId: string;
  facultyId: string;
  examSessionId?: string | null;
  title: string;
  description: string;
  dueDate: string;
  maxScore?: number;
  weightage?: number;
  status?: "draft" | "published" | "closed";
}

export interface SubmitAssignmentInput {
  id?: string;
  schoolId?: string;
  assignmentId: string;
  studentId: string;
  content: string;
  fileUrl?: string | null;
  submissionDate?: string;
}

export interface GradeSubmissionInput {
  score: number;
  feedback?: string | null;
  syncToExam?: boolean;
}

export const lmsManagement = {
  /**
   * Get assignments list, optionally filtered by classroomId or facultyId
   */
  async getAssignments(d1: D1Database, filter?: { classroomId?: string; facultyId?: string; schoolId?: string }) {
    const db = drizzle(d1, { schema });
    const conditions = [];

    if (filter?.schoolId) conditions.push(eq(schema.assignments.schoolId, filter.schoolId));
    if (filter?.classroomId) conditions.push(eq(schema.assignments.classroomId, filter.classroomId));
    if (filter?.facultyId) conditions.push(eq(schema.assignments.facultyId, filter.facultyId));

    const query = db
      .select({
        id: schema.assignments.id,
        schoolId: schema.assignments.schoolId,
        classroomId: schema.assignments.classroomId,
        classroomName: schema.classrooms.name,
        subjectId: schema.assignments.subjectId,
        subjectName: schema.subjects.name,
        facultyId: schema.assignments.facultyId,
        facultyName: schema.faculties.name,
        examSessionId: schema.assignments.examSessionId,
        title: schema.assignments.title,
        description: schema.assignments.description,
        dueDate: schema.assignments.dueDate,
        maxScore: schema.assignments.maxScore,
        weightage: schema.assignments.weightage,
        status: schema.assignments.status,
        createdAt: schema.assignments.createdAt,
        updatedAt: schema.assignments.updatedAt,
      })
      .from(schema.assignments)
      .leftJoin(schema.classrooms, eq(schema.assignments.classroomId, schema.classrooms.id))
      .leftJoin(schema.subjects, eq(schema.assignments.subjectId, schema.subjects.id))
      .leftJoin(schema.faculties, eq(schema.assignments.facultyId, schema.faculties.id))
      .orderBy(desc(schema.assignments.createdAt));

    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }
    return query;
  },

  /**
   * Get assignment by ID including submission summary
   */
  async getAssignmentById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db
      .select({
        id: schema.assignments.id,
        schoolId: schema.assignments.schoolId,
        classroomId: schema.assignments.classroomId,
        classroomName: schema.classrooms.name,
        subjectId: schema.assignments.subjectId,
        subjectName: schema.subjects.name,
        facultyId: schema.assignments.facultyId,
        facultyName: schema.faculties.name,
        examSessionId: schema.assignments.examSessionId,
        title: schema.assignments.title,
        description: schema.assignments.description,
        dueDate: schema.assignments.dueDate,
        maxScore: schema.assignments.maxScore,
        weightage: schema.assignments.weightage,
        status: schema.assignments.status,
        createdAt: schema.assignments.createdAt,
        updatedAt: schema.assignments.updatedAt,
      })
      .from(schema.assignments)
      .leftJoin(schema.classrooms, eq(schema.assignments.classroomId, schema.classrooms.id))
      .leftJoin(schema.subjects, eq(schema.assignments.subjectId, schema.subjects.id))
      .leftJoin(schema.faculties, eq(schema.assignments.facultyId, schema.faculties.id))
      .where(eq(schema.assignments.id, id))
      .limit(1);

    return results[0] || null;
  },

  /**
   * Create a new assignment
   */
  async createAssignment(d1: D1Database, input: CreateAssignmentInput) {
    if (!input.schoolId) {
      throw new Error("schoolId is required to create an assignment");
    }
    const db = drizzle(d1, { schema });
    const id = input.id || generateId("asgn");
    const now = new Date();

    const record = {
      id,
      schoolId: input.schoolId,
      classroomId: input.classroomId,
      subjectId: input.subjectId,
      facultyId: input.facultyId,
      examSessionId: input.examSessionId || null,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      maxScore: input.maxScore !== undefined ? Number(input.maxScore) : 100,
      weightage: input.weightage !== undefined ? Number(input.weightage) : 10,
      status: input.status || "published",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.assignments).values(record);
    return record;
  },

  /**
   * Update assignment
   */
  async updateAssignment(d1: D1Database, id: string, updates: Partial<CreateAssignmentInput>) {
    const db = drizzle(d1, { schema });
    const existing = await this.getAssignmentById(d1, id);
    if (!existing) return null;

    const data: Record<string, any> = { updatedAt: new Date() };
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.dueDate !== undefined) data.dueDate = updates.dueDate;
    if (updates.maxScore !== undefined) data.maxScore = Number(updates.maxScore);
    if (updates.weightage !== undefined) data.weightage = Number(updates.weightage);
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.examSessionId !== undefined) data.examSessionId = updates.examSessionId;

    await db.update(schema.assignments).set(data).where(eq(schema.assignments.id, id));
    return this.getAssignmentById(d1, id);
  },

  /**
   * Submit student's work for an assignment
   */
  async submitAssignment(d1: D1Database, input: SubmitAssignmentInput) {
    const db = drizzle(d1, { schema });
    const assignment = await this.getAssignmentById(d1, input.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const now = new Date();
    const submissionDate = input.submissionDate || now.toISOString().split("T")[0];
    const isLate = assignment.dueDate ? submissionDate > assignment.dueDate : false;

    // Check if submission already exists for this student + assignment
    const existing = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(
        and(
          eq(schema.assignmentSubmissions.assignmentId, input.assignmentId),
          eq(schema.assignmentSubmissions.studentId, input.studentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing submission
      const subId = existing[0].id;
      const updated = {
        content: input.content,
        fileUrl: input.fileUrl !== undefined ? input.fileUrl : existing[0].fileUrl,
        submissionDate,
        status: isLate ? "late" : "submitted",
        updatedAt: now,
      };
      await db.update(schema.assignmentSubmissions).set(updated).where(eq(schema.assignmentSubmissions.id, subId));
      return { ...existing[0], ...updated };
    }

    const subId = input.id || generateId("sub");
    const record = {
      id: subId,
      schoolId: input.schoolId || assignment.schoolId,
      assignmentId: input.assignmentId,
      studentId: input.studentId,
      submissionDate,
      content: input.content,
      fileUrl: input.fileUrl || null,
      score: null,
      grade: null,
      feedback: null,
      status: isLate ? "late" : "submitted",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.assignmentSubmissions).values(record);
    return record;
  },

  /**
   * Grade a submission and optionally sync mark to exam_marks if examSessionId is linked
   */
  async gradeSubmission(d1: D1Database, submissionId: string, input: GradeSubmissionInput) {
    const db = drizzle(d1, { schema });
    const submissions = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.id, submissionId))
      .limit(1);

    if (submissions.length === 0) {
      throw new Error("Submission not found");
    }

    const sub = submissions[0];
    const assignment = await this.getAssignmentById(d1, sub.assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const maxScore = assignment.maxScore || 100;
    const grade = calculateGrade(input.score, maxScore);
    const now = new Date();

    const updateSubQuery = db
      .update(schema.assignmentSubmissions)
      .set({
        score: input.score,
        grade,
        feedback: input.feedback || null,
        status: "graded",
        updatedAt: now,
      })
      .where(eq(schema.assignmentSubmissions.id, submissionId));

    // Optional sync to exam_marks via db.batch if linked to examSessionId
    if (input.syncToExam && assignment.examSessionId) {
      const existingExamMark = await db
        .select()
        .from(schema.examMarks)
        .where(
          and(
            eq(schema.examMarks.sessionId, assignment.examSessionId),
            eq(schema.examMarks.studentId, sub.studentId)
          )
        )
        .limit(1);

      if (existingExamMark.length > 0) {
        const updateExamQuery = db
          .update(schema.examMarks)
          .set({
            marksObtained: input.score,
            grade,
            remark: `Synced from Assignment: ${assignment.title}`,
            updatedAt: now,
          })
          .where(eq(schema.examMarks.id, existingExamMark[0].id));

        await db.batch([updateSubQuery, updateExamQuery]);
      } else {
        const markId = generateId("mrk");
        const insertExamQuery = db.insert(schema.examMarks).values({
          id: markId,
          sessionId: assignment.examSessionId,
          studentId: sub.studentId,
          marksObtained: input.score,
          grade,
          remark: `Synced from Assignment: ${assignment.title}`,
          createdAt: now,
          updatedAt: now,
        });

        await db.batch([updateSubQuery, insertExamQuery]);
      }
    } else {
      await updateSubQuery;
    }

    return {
      ...sub,
      score: input.score,
      grade,
      feedback: input.feedback || null,
      status: "graded",
      updatedAt: now,
    };
  },

  /**
   * Get submissions for an assignment
   */
  async getSubmissionsByAssignment(d1: D1Database, assignmentId: string) {
    const db = drizzle(d1, { schema });
    return db
      .select({
        id: schema.assignmentSubmissions.id,
        assignmentId: schema.assignmentSubmissions.assignmentId,
        studentId: schema.assignmentSubmissions.studentId,
        studentName: schema.students.name,
        studentNis: schema.students.nis,
        submissionDate: schema.assignmentSubmissions.submissionDate,
        content: schema.assignmentSubmissions.content,
        fileUrl: schema.assignmentSubmissions.fileUrl,
        score: schema.assignmentSubmissions.score,
        grade: schema.assignmentSubmissions.grade,
        feedback: schema.assignmentSubmissions.feedback,
        status: schema.assignmentSubmissions.status,
        createdAt: schema.assignmentSubmissions.createdAt,
        updatedAt: schema.assignmentSubmissions.updatedAt,
      })
      .from(schema.assignmentSubmissions)
      .leftJoin(schema.students, eq(schema.assignmentSubmissions.studentId, schema.students.id))
      .where(eq(schema.assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(schema.assignmentSubmissions.createdAt));
  },

  /**
   * Get student LMS assignments and submissions
   */
  async getStudentAssignments(d1: D1Database, studentId: string) {
    const db = drizzle(d1, { schema });

    // 1. Get student's classroom enrollments
    const enrolledClassrooms = await db
      .select({ classroomId: schema.enrollments.classroomId })
      .from(schema.enrollments)
      .where(and(eq(schema.enrollments.studentId, studentId), eq(schema.enrollments.status, "active")));

    const classroomIds = enrolledClassrooms.map((e) => e.classroomId);
    if (classroomIds.length === 0) {
      return [];
    }

    // 2. Fetch all published assignments for these classrooms
    const assignmentsList = await db
      .select({
        id: schema.assignments.id,
        schoolId: schema.assignments.schoolId,
        classroomId: schema.assignments.classroomId,
        classroomName: schema.classrooms.name,
        subjectId: schema.assignments.subjectId,
        subjectName: schema.subjects.name,
        facultyId: schema.assignments.facultyId,
        facultyName: schema.faculties.name,
        examSessionId: schema.assignments.examSessionId,
        title: schema.assignments.title,
        description: schema.assignments.description,
        dueDate: schema.assignments.dueDate,
        maxScore: schema.assignments.maxScore,
        weightage: schema.assignments.weightage,
        status: schema.assignments.status,
        createdAt: schema.assignments.createdAt,
      })
      .from(schema.assignments)
      .leftJoin(schema.classrooms, eq(schema.assignments.classroomId, schema.classrooms.id))
      .leftJoin(schema.subjects, eq(schema.assignments.subjectId, schema.subjects.id))
      .leftJoin(schema.faculties, eq(schema.assignments.facultyId, schema.faculties.id))
      .where(
        and(
          inArray(schema.assignments.classroomId, classroomIds),
          eq(schema.assignments.status, "published")
        )
      )
      .orderBy(desc(schema.assignments.dueDate));

    // 3. Fetch submissions for this student
    const studentSubmissions = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.studentId, studentId));

    const subMap = new Map(studentSubmissions.map((s) => [s.assignmentId, s]));

    return assignmentsList.map((asgn) => {
      const sub = subMap.get(asgn.id);
      return {
        ...asgn,
        submission: sub || null,
      };
    });
  },
};
