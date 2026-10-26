import { describe, it, expect } from "vitest";
import app from "../src/index";
import { examManagement } from "../src/domain/exams";
import { createMockD1Database } from "./helpers/d1-mock";

describe("Examination & Grading API", () => {
  it("should respond with 200 on exam sessions list via GET /api/exams/sessions", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };
    const res = await app.request("/api/exams/sessions", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { data: any[] };
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should respond with 201 on create exam session via POST /api/exams/sessions", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        })
      }
    };

    const sessionPayload = {
      schoolId: "sch_smp_01",
      academicYearId: "ay_2025_ganjil",
      termId: "term_01",
      classroomId: "cls_x_mipa_1",
      subjectId: "MAT-10",
      name: "UTS Matematika Wajib",
      examDate: "2026-10-15",
      totalMarks: 100,
      passingMarks: 75,
      weightage: 30,
      status: "draft"
    };

    const res = await app.request(
      "/api/exams/sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload)
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("UTS Matematika Wajib");
    expect(body.data.subjectId).toBe("MAT-10");
    expect(body.data.passingMarks).toBe(75);
    expect(body.data.weightage).toBe(30);
    expect(body.data.status).toBe("draft");
  });

  it("should return exam session by ID via GET /api/exams/sessions/:id", async () => {
    const mockSession = {
      id: "exam_test_01",
      schoolId: "sch_smp_01",
      academicYearId: "ay_2025_ganjil",
      termId: "term_01",
      classroomId: "cls_x_mipa_1",
      subjectId: "MAT-10",
      name: "UTS Matematika Wajib",
      examDate: "2026-10-15",
      totalMarks: 100,
      passingMarks: 75,
      weightage: 30,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [Object.values(mockSession)]
          })
        })
      }
    };

    const res = await app.request("/api/exams/sessions/exam_test_01", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("UTS Matematika Wajib");
  });

  it("should return 404 when exam session not found via GET /api/exams/sessions/:id", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };

    const res = await app.request("/api/exams/sessions/exam_non_existent", {}, mockEnv as any);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Exam session not found");
  });

  it("should update exam session via PUT /api/exams/sessions/:id", async () => {
    const updatedSession = {
      id: "exam_test_01",
      schoolId: "sch_smp_01",
      academicYearId: "ay_2025_ganjil",
      termId: "term_01",
      classroomId: "cls_x_mipa_1",
      subjectId: "MAT-10",
      name: "UTS Matematika Wajib - Susulan",
      examDate: "2026-10-20",
      totalMarks: 100,
      passingMarks: 80,
      weightage: 35,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true }),
            raw: async () => [Object.values(updatedSession)]
          })
        })
      }
    };

    const res = await app.request(
      "/api/exams/sessions/exam_test_01",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "UTS Matematika Wajib - Susulan",
          passingMarks: 80,
          weightage: 35,
          status: "published"
        })
      },
      mockEnv as any
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("UTS Matematika Wajib - Susulan");
  });

  it("should delete exam session atomically via DELETE /api/exams/sessions/:id", async () => {
    let batchedStatements: any[] = [];
    const mockEnv = {
      DB: {
        ...createMockD1Database([]),
        batch: async (statements: any[]) => {
          batchedStatements = statements;
          return statements.map(() => ({ results: [], success: true }));
        }
      }
    };

    const res = await app.request(
      "/api/exams/sessions/exam_test_01",
      {
        method: "DELETE"
      },
      mockEnv as any
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("exam_test_01");
    expect(batchedStatements.length).toBe(2); // deletes marks and session atomically
  });

  it("should record exam marks via POST /api/exams/marks", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        })
      }
    };

    const markPayload = {
      sessionId: "exam_test_01",
      studentId: "std_01",
      marksObtained: 95,
      remark: "Sangat baik"
    };

    const res = await app.request(
      "/api/exams/marks",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(markPayload)
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.marksObtained).toBe(95);
    expect(body.data.grade).toBe("A");
  });

  it("should return student report card via GET /api/exams/report-card/:studentId", async () => {
    const mockMark = {
      id: "mark_01",
      sessionId: "exam_test_01",
      studentId: "std_01",
      marksObtained: 85,
      grade: "A",
      remark: "Lulus",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [Object.values(mockMark)]
          })
        })
      }
    };

    const res = await app.request("/api/exams/report-card/std_01", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.studentId).toBe("std_01");
    expect(body.status).toBe("published");
    expect(body.summary.totalSubjects).toBe(1);
    expect(body.summary.averageScore).toBe("85.0");
    expect(body.grades.length).toBe(1);
  });
});
