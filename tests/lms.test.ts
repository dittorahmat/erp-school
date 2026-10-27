import { describe, it, expect, vi } from "vitest";
import app from "../src/index";
import { lmsManagement } from "../src/domain";

describe("Assignment & LMS Domain and API (#45)", () => {
  const schoolId = "sch_smp_01";
  const classroomId = "cls_x_mipa_1";
  const subjectId = "sub_mat_10";
  const facultyId = "fac_budi";
  const studentId = "std_andi";

  it("should create an assignment via domain module and API", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true, meta: { changes: 1 } }),
            raw: async () => [],
            all: async () => ({ results: [], success: true }),
            first: async () => null,
          }),
        }),
      },
    };

    const payload = {
      schoolId,
      classroomId,
      subjectId,
      facultyId,
      title: "Tugas Aljabar Linear Bab 3",
      description: "Kerjakan latihan soal no 1-10 di buku cetak halaman 45.",
      dueDate: "2026-11-05",
      maxScore: 100,
      weightage: 10,
    };

    const res = await app.request(
      "/api/lms/assignments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.title).toBe(payload.title);
    expect(json.data.classroomId).toBe(payload.classroomId);
    expect(json.data.maxScore).toBe(100);
  });

  it("should validate required fields when creating an assignment", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true }),
            raw: async () => [],
          }),
        }),
      },
    };

    const res = await app.request(
      "/api/lms/assignments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Incomplete Assignment" }),
      },
      mockEnv as any
    );

    expect(res.status).toBe(400);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
  });

  it("should submit student assignment work via domain method", async () => {
    const mockAssignment = {
      id: "asgn_01",
      schoolId,
      classroomId,
      subjectId,
      facultyId,
      title: "Tugas Aljabar Linear Bab 3",
      dueDate: "2026-11-05",
      maxScore: 100,
      status: "published",
    };

    // Spy on getAssignmentById
    const getSpy = vi.spyOn(lmsManagement, "getAssignmentById").mockResolvedValue(mockAssignment as any);

    const mockDb = {
      prepare: (query: string) => ({
        bind: (...params: any[]) => ({
          run: async () => ({ success: true }),
          raw: async () => [], // returns empty for existing submission check
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (statements: any[]) => statements.map(() => ({ results: [], success: true })),
    } as any;

    const sub = await lmsManagement.submitAssignment(mockDb, {
      assignmentId: "asgn_01",
      studentId,
      content: "Berikut link tugas saya",
      fileUrl: "https://r2.test/tugas1.pdf",
    });

    expect(sub).toBeDefined();
    expect(sub.assignmentId).toBe("asgn_01");
    expect(sub.studentId).toBe(studentId);
    expect(sub.status).toBe("submitted");
    expect(sub.fileUrl).toBe("https://r2.test/tugas1.pdf");

    getSpy.mockRestore();
  });

  it("should grade submission and batch sync to exam session when syncToExam is true", async () => {
    let batchCalled = false;
    let statementsExecuted: any[] = [];

    const mockSubmission = {
      id: "sub_01",
      schoolId,
      assignmentId: "asgn_01",
      studentId: "std_andi",
      submissionDate: "2026-10-27",
      content: "Jawaban no 1-10",
      fileUrl: null,
      score: null,
      grade: null,
      feedback: null,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAssignment = {
      id: "asgn_01",
      schoolId,
      classroomId,
      subjectId,
      facultyId,
      examSessionId: "exam_sess_01",
      title: "Tugas Bab 3",
      dueDate: "2026-11-05",
      maxScore: 100,
      weightage: 10,
      status: "published",
    };

    const getSpy = vi.spyOn(lmsManagement, "getAssignmentById").mockResolvedValue(mockAssignment as any);

    const mockDb = {
      prepare: (query: string) => ({
        bind: (...params: any[]) => ({
          run: async () => ({ success: true }),
          raw: async () => {
            if (query.includes("assignment_submissions")) {
              return [[
                mockSubmission.id,
                mockSubmission.schoolId,
                mockSubmission.assignmentId,
                mockSubmission.studentId,
                mockSubmission.submissionDate,
                mockSubmission.content,
                mockSubmission.fileUrl,
                mockSubmission.score,
                mockSubmission.grade,
                mockSubmission.feedback,
                mockSubmission.status,
                mockSubmission.createdAt,
                mockSubmission.updatedAt,
              ]];
            }
            // exam_marks check
            return [];
          },
          all: async () => ({ results: [], success: true }),
          first: async () => null,
        }),
      }),
      batch: async (statements: any[]) => {
        batchCalled = true;
        statementsExecuted = statements;
        return statements.map(() => ({ results: [], success: true }));
      },
    } as any;

    const result = await lmsManagement.gradeSubmission(mockDb, "sub_01", {
      score: 92,
      feedback: "Penyelesaian aljabar sangat rapi dan tepat.",
      syncToExam: true,
    });

    expect(result.score).toBe(92);
    expect(result.grade).toBe("A");
    expect(result.feedback).toBe("Penyelesaian aljabar sangat rapi dan tepat.");
    expect(result.status).toBe("graded");
    // Verify db.batch was called for atomic update of submission + insert exam mark
    expect(batchCalled).toBe(true);
    expect(statementsExecuted.length).toBe(2);

    getSpy.mockRestore();
  });
});
