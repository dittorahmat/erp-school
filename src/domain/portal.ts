import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export interface PortalScope {
  role: string;
  userId: string;
  studentIds: string[];
  students: Array<{
    id: string;
    nis: string;
    nisn: string;
    name: string;
    gender: string;
    classroomName?: string;
  }>;
}

export interface PortalOverviewData {
  students: Array<{
    id: string;
    nis: string;
    nisn: string;
    name: string;
    gender: string;
    classroomName?: string;
  }>;
  selectedStudentId: string | null;
  timetables: any[];
  attendance: any[];
  grades: any[];
  invoices: any[];
}

/**
 * Deep Portal Domain Module.
 * Implements Row-Level Security (RLS) scoping based on session.user.id.
 * Students and guardians can only query and view records linked to their own identity.
 */
export const portalManagement = {
  /**
   * Resolves the allowed student IDs for the current user session.
   * If role is 'student', resolves student linked via students.user_id = userId.
   * If role is 'guardian', resolves students linked via guardians.user_id = userId and students.guardian_id.
   * Superadmin / admin can access all students if needed or target student.
   */
  async resolvePortalScope(d1: D1Database, userId: string, role?: string): Promise<PortalScope> {
    const db = drizzle(d1, { schema });

    // 1. Direct student lookup by user_id
    let studentRows = await db
      .select({
        id: schema.students.id,
        nis: schema.students.nis,
        nisn: schema.students.nisn,
        name: schema.students.name,
        gender: schema.students.gender,
      })
      .from(schema.students)
      .where(eq(schema.students.userId, userId));

    // 2. If no student found or role is guardian, check guardian mapping
    if (studentRows.length === 0 || role === "guardian") {
      const guardianRows = await db
        .select()
        .from(schema.guardians)
        .where(eq(schema.guardians.userId, userId));

      if (guardianRows.length > 0) {
        const guardianIds = guardianRows.map((g) => g.id);
        const children = await db
          .select({
            id: schema.students.id,
            nis: schema.students.nis,
            nisn: schema.students.nisn,
            name: schema.students.name,
            gender: schema.students.gender,
          })
          .from(schema.students)
          .where(inArray(schema.students.guardianId, guardianIds));

        if (children.length > 0) {
          studentRows = children;
        }
      }
    }

    // Fallback: If demo user or admin, allow if student or guardian exists with matching ID
    if (studentRows.length === 0 && (role === "admin" || role === "superadmin")) {
      const allStudents = await db
        .select({
          id: schema.students.id,
          nis: schema.students.nis,
          nisn: schema.students.nisn,
          name: schema.students.name,
          gender: schema.students.gender,
        })
        .from(schema.students)
        .limit(10);
      studentRows = allStudents;
    }

    const studentIds = studentRows.map((s) => s.id);

    return {
      role: role || (studentRows.length > 0 ? "student" : "unknown"),
      userId,
      studentIds,
      students: studentRows,
    };
  },

  /**
   * Enforces RLS verification for a specific student ID query.
   * Throws 403 Forbidden error if studentId is not in the user's permitted scope.
   */
  assertPortalAccess(scope: PortalScope, targetStudentId?: string | null): string {
    if (!targetStudentId) {
      if (scope.studentIds.length === 0) {
        throw new Error("Access Denied: No student records linked to your account");
      }
      return scope.studentIds[0];
    }

    if (!scope.studentIds.includes(targetStudentId)) {
      throw new Error(`Access Denied: You do not have permission to access student ${targetStudentId}`);
    }

    return targetStudentId;
  },

  /**
   * Retrieves timetable schedules for the authorized student's classroom.
   */
  async getStudentTimetable(d1: D1Database, scope: PortalScope, targetStudentId?: string | null) {
    const studentId = this.assertPortalAccess(scope, targetStudentId);
    const db = drizzle(d1, { schema });

    // Look up active enrollment to get classroom_id
    const enrollments = await db
      .select({
        classroomId: schema.enrollments.classroomId,
      })
      .from(schema.enrollments)
      .where(eq(schema.enrollments.studentId, studentId))
      .limit(1);

    if (enrollments.length === 0) {
      return [];
    }

    const classroomId = enrollments[0].classroomId;

    return db
      .select({
        id: schema.timetables.id,
        dayOfWeek: schema.timetables.dayOfWeek,
        startTime: schema.timetables.startTime,
        endTime: schema.timetables.endTime,
        subjectName: schema.subjects.name,
        subjectCode: schema.subjects.code,
        facultyName: schema.faculties.name,
      })
      .from(schema.timetables)
      .innerJoin(schema.subjects, eq(schema.timetables.subjectId, schema.subjects.id))
      .innerJoin(schema.faculties, eq(schema.timetables.facultyId, schema.faculties.id))
      .where(eq(schema.timetables.classroomId, classroomId));
  },

  /**
   * Retrieves attendance records strictly for the authorized student.
   */
  async getStudentAttendance(d1: D1Database, scope: PortalScope, targetStudentId?: string | null) {
    const studentId = this.assertPortalAccess(scope, targetStudentId);
    const db = drizzle(d1, { schema });

    return db
      .select({
        id: schema.attendanceLines.id,
        date: schema.attendanceSheets.date,
        status: schema.attendanceLines.status,
        remark: schema.attendanceLines.remark,
        classroomId: schema.attendanceSheets.classroomId,
      })
      .from(schema.attendanceLines)
      .innerJoin(schema.attendanceSheets, eq(schema.attendanceLines.sheetId, schema.attendanceSheets.id))
      .where(eq(schema.attendanceLines.studentId, studentId))
      .orderBy(desc(schema.attendanceSheets.date));
  },

  /**
   * Retrieves examination report card / grade marks strictly for the authorized student.
   */
  async getStudentGrades(d1: D1Database, scope: PortalScope, targetStudentId?: string | null) {
    const studentId = this.assertPortalAccess(scope, targetStudentId);
    const db = drizzle(d1, { schema });

    const marks = await db
      .select({
        id: schema.examMarks.id,
        marksObtained: schema.examMarks.marksObtained,
        grade: schema.examMarks.grade,
        remark: schema.examMarks.remark,
        examName: schema.examSessions.name,
        examDate: schema.examSessions.examDate,
        totalMarks: schema.examSessions.totalMarks,
        passingMarks: schema.examSessions.passingMarks,
        weightage: schema.examSessions.weightage,
        subjectName: schema.subjects.name,
      })
      .from(schema.examMarks)
      .innerJoin(schema.examSessions, eq(schema.examMarks.sessionId, schema.examSessions.id))
      .innerJoin(schema.subjects, eq(schema.examSessions.subjectId, schema.subjects.id))
      .where(eq(schema.examMarks.studentId, studentId))
      .orderBy(desc(schema.examSessions.examDate));

    const totalSubjects = marks.length;
    const averageScore = totalSubjects > 0
      ? (marks.reduce((acc, m) => acc + (m.marksObtained || 0), 0) / totalSubjects).toFixed(1)
      : "0";

    return {
      studentId,
      totalSubjects,
      averageScore,
      marks,
    };
  },

  /**
   * Retrieves outstanding and settled tuition invoices strictly for the authorized student.
   */
  async getStudentInvoices(d1: D1Database, scope: PortalScope, targetStudentId?: string | null) {
    const studentId = this.assertPortalAccess(scope, targetStudentId);
    const db = drizzle(d1, { schema });

    return db
      .select({
        id: schema.accountMoves.id,
        name: schema.accountMoves.name,
        date: schema.accountMoves.date,
        amountTotal: schema.accountMoves.amountTotal,
        amountResidual: schema.accountMoves.amountResidual,
        state: schema.accountMoves.state,
        paymentState: schema.accountMoves.paymentState,
        invoiceDueDate: schema.accountMoves.invoiceDueDate,
      })
      .from(schema.accountMoves)
      .where(
        eq(schema.accountMoves.studentId, studentId)
      )
      .orderBy(desc(schema.accountMoves.date));
  },

  /**
   * Consolidated Portal Overview endpoint: Returns profile, schedule, attendance, grades, and invoices in one query bundle.
   */
  async getPortalOverview(d1: D1Database, scope: PortalScope, targetStudentId?: string | null): Promise<PortalOverviewData> {
    const studentId = this.assertPortalAccess(scope, targetStudentId);

    const [timetables, attendance, gradesReport, invoices] = await Promise.all([
      this.getStudentTimetable(d1, scope, studentId),
      this.getStudentAttendance(d1, scope, studentId),
      this.getStudentGrades(d1, scope, studentId),
      this.getStudentInvoices(d1, scope, studentId),
    ]);

    return {
      students: scope.students,
      selectedStudentId: studentId,
      timetables,
      attendance,
      grades: gradesReport.marks,
      invoices,
    };
  },
};
