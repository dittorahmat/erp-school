import { Hono } from "hono";
import { academicManagement } from "../domain/academic";
import type { Bindings } from "../index";

export const academicRouter = new Hono<{ Bindings: Bindings }>();

// Academic Years
academicRouter.get("/years", async (c) => {
  const years = await academicManagement.getYears(c.env.DB);
  return c.json({ data: years });
});

academicRouter.post("/years", async (c) => {
  const body = await c.req.json();
  const newYear = await academicManagement.createYear(c.env.DB, body);
  return c.json({ success: true, data: newYear }, 201);
});

// Subjects
academicRouter.get("/subjects", async (c) => {
  const items = await academicManagement.getSubjects(c.env.DB);
  return c.json({ data: items });
});

academicRouter.post("/subjects", async (c) => {
  const body = await c.req.json();
  const newSubject = await academicManagement.createSubject(c.env.DB, body);
  return c.json({ success: true, data: newSubject }, 201);
});

// Classrooms
academicRouter.get("/classrooms", async (c) => {
  const classrooms = await academicManagement.getClassrooms(c.env.DB);
  return c.json({ data: classrooms });
});
