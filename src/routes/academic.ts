import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import type { Bindings } from "../index";
import { generateId } from "../lib/utils";

export const academicRouter = new Hono<{ Bindings: Bindings }>();

// --------------------------------------------------------------------------
// Academic Years
// --------------------------------------------------------------------------
academicRouter.get("/years", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const years = await db.select().from(schema.academicYears).orderBy(desc(schema.academicYears.createdAt));
  return c.json({ data: years });
});

academicRouter.post("/years", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const newYear = {
    id: body.id || generateId("ay"),
    schoolId: body.schoolId,
    name: body.name,
    code: body.code,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status || "active",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.insert(schema.academicYears).values(newYear);
  return c.json({ success: true, data: newYear }, 201);
});

// --------------------------------------------------------------------------
// Subjects
// --------------------------------------------------------------------------
academicRouter.get("/subjects", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const items = await db.select().from(schema.subjects).orderBy(schema.subjects.name);
  return c.json({ data: items });
});

academicRouter.post("/subjects", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  const newSubject = {
    id: body.id || generateId("subj"),
    schoolId: body.schoolId,
    name: body.name,
    code: body.code,
    type: body.type || "compulsory",
    weightage: body.weightage || 100,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.insert(schema.subjects).values(newSubject);
  return c.json({ success: true, data: newSubject }, 201);
});

// --------------------------------------------------------------------------
// Grade Levels & Courses
// --------------------------------------------------------------------------
academicRouter.get("/grades", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const grades = await db.select().from(schema.gradeLevels).orderBy(schema.gradeLevels.sequence);
  return c.json({ data: grades });
});
