import { Hono } from "hono";
import { lmsManagement } from "../domain";
import type { Bindings } from "../index";

export const lmsRouter = new Hono<{ Bindings: Bindings }>();

// GET /api/lms/assignments - List assignments
lmsRouter.get("/assignments", async (c) => {
  const classroomId = c.req.query("classroomId");
  const facultyId = c.req.query("facultyId");
  const schoolId = c.req.query("schoolId");

  const assignments = await lmsManagement.getAssignments(c.env.DB, {
    classroomId,
    facultyId,
    schoolId,
  });
  return c.json({ success: true, data: assignments });
});

// GET /api/lms/assignments/:id - Assignment detail
lmsRouter.get("/assignments/:id", async (c) => {
  const id = c.req.param("id");
  const assignment = await lmsManagement.getAssignmentById(c.env.DB, id);
  if (!assignment) {
    return c.json({ success: false, error: "Assignment not found" }, 404);
  }
  return c.json({ success: true, data: assignment });
});

// POST /api/lms/assignments - Create assignment
lmsRouter.post("/assignments", async (c) => {
  const body = await c.req.json();
  if (!body.title || !body.classroomId || !body.subjectId || !body.facultyId || !body.dueDate) {
    return c.json(
      { success: false, error: "Missing required fields: title, classroomId, subjectId, facultyId, dueDate" },
      400
    );
  }

  const created = await lmsManagement.createAssignment(c.env.DB, body);
  return c.json({ success: true, data: created }, 201);
});

// PUT /api/lms/assignments/:id - Update assignment
lmsRouter.put("/assignments/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await lmsManagement.updateAssignment(c.env.DB, id, body);
  if (!updated) {
    return c.json({ success: false, error: "Assignment not found" }, 404);
  }
  return c.json({ success: true, data: updated });
});

// GET /api/lms/assignments/:id/submissions - List submissions for assignment
lmsRouter.get("/assignments/:id/submissions", async (c) => {
  const id = c.req.param("id");
  const submissions = await lmsManagement.getSubmissionsByAssignment(c.env.DB, id);
  return c.json({ success: true, data: submissions });
});

// POST /api/lms/submissions - Submit assignment work
lmsRouter.post("/submissions", async (c) => {
  const body = await c.req.json();
  if (!body.assignmentId || !body.studentId || !body.content) {
    return c.json({ success: false, error: "Missing required fields: assignmentId, studentId, content" }, 400);
  }

  try {
    const submission = await lmsManagement.submitAssignment(c.env.DB, body);
    return c.json({ success: true, data: submission }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// POST /api/lms/submissions/:id/grade - Grade submission
lmsRouter.post("/submissions/:id/grade", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  if (body.score === undefined) {
    return c.json({ success: false, error: "Score is required" }, 400);
  }

  try {
    const graded = await lmsManagement.gradeSubmission(c.env.DB, id, {
      score: Number(body.score),
      feedback: body.feedback,
      syncToExam: Boolean(body.syncToExam),
    });
    return c.json({ success: true, data: graded });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/lms/students/:id/assignments - Get assignments for student (Portal LMS view)
lmsRouter.get("/students/:id/assignments", async (c) => {
  const studentId = c.req.param("id");
  const list = await lmsManagement.getStudentAssignments(c.env.DB, studentId);
  return c.json({ success: true, data: list });
});
