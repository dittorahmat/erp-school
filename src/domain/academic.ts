import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import { generateId } from "../lib/utils";

export const academicManagement = {
  async getYears(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.academicYears).orderBy(desc(schema.academicYears.createdAt));
  },

  async createYear(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newYear = {
      id: body.id || generateId("ay"),
      schoolId: body.schoolId,
      name: body.name,
      code: body.code,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.academicYears).values(newYear);
    return newYear;
  },

  async getSubjects(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.subjects).orderBy(schema.subjects.name);
  },

  async createSubject(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newSubject = {
      id: body.id || generateId("subj"),
      schoolId: body.schoolId,
      name: body.name,
      code: body.code,
      type: body.type || "compulsory",
      weightage: body.weightage || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.subjects).values(newSubject);
    return newSubject;
  },

  async getClassrooms(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.classrooms).orderBy(schema.classrooms.name);
  },
};
