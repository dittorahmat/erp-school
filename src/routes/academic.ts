import { Hono } from "hono";
import { academicManagement } from "../domain";
import type { Bindings } from "../index";

export const academicRouter = new Hono<{ Bindings: Bindings }>();

// Academic Years
academicRouter.get("/years", async (c) => {
  const years = await academicManagement.getYears(c.env.DB);
  return c.json({ data: years });
});

academicRouter.get("/years/:id", async (c) => {
  const id = c.req.param("id");
  const year = await academicManagement.getYearById(c.env.DB, id);
  if (!year) {
    return c.json({ error: "Academic year not found" }, 404);
  }
  return c.json({ success: true, data: year });
});

academicRouter.post("/years", async (c) => {
  const body = await c.req.json();
  const newYear = await academicManagement.createYear(c.env.DB, body);
  return c.json({ success: true, data: newYear }, 201);
});

academicRouter.put("/years/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updatedYear = await academicManagement.updateYear(c.env.DB, id, body);
  if (!updatedYear) {
    return c.json({ error: "Academic year not found" }, 404);
  }
  return c.json({ success: true, data: updatedYear });
});

academicRouter.delete("/years/:id", async (c) => {
  const id = c.req.param("id");
  const result = await academicManagement.deleteYear(c.env.DB, id);
  return c.json({ success: true, data: result });
});

// Subjects
academicRouter.get("/subjects", async (c) => {
  const items = await academicManagement.getSubjects(c.env.DB);
  return c.json({ data: items });
});

academicRouter.get("/subjects/:id", async (c) => {
  const id = c.req.param("id");
  const subject = await academicManagement.getSubjectById(c.env.DB, id);
  if (!subject) {
    return c.json({ error: "Subject not found" }, 404);
  }
  return c.json({ success: true, data: subject });
});

academicRouter.post("/subjects", async (c) => {
  const body = await c.req.json();
  const newSubject = await academicManagement.createSubject(c.env.DB, body);
  return c.json({ success: true, data: newSubject }, 201);
});

academicRouter.put("/subjects/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updatedSubject = await academicManagement.updateSubject(c.env.DB, id, body);
  if (!updatedSubject) {
    return c.json({ error: "Subject not found" }, 404);
  }
  return c.json({ success: true, data: updatedSubject });
});

academicRouter.delete("/subjects/:id", async (c) => {
  const id = c.req.param("id");
  const result = await academicManagement.deleteSubject(c.env.DB, id);
  return c.json({ success: true, data: result });
});

// Classrooms
academicRouter.get("/classrooms", async (c) => {
  const classrooms = await academicManagement.getClassrooms(c.env.DB);
  return c.json({ data: classrooms });
});
