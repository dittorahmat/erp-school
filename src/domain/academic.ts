import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { generateId } from "../lib/utils";

export const academicManagement = {
  async getYears(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.academicYears).orderBy(desc(schema.academicYears.createdAt));
  },

  async getYearById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db.select().from(schema.academicYears).where(eq(schema.academicYears.id, id)).limit(1);
    return results[0] || null;
  },

  async createYear(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newYear = {
      id: body.id || generateId("ay"),
      schoolId: body.schoolId || "sch_smp_01",
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

  async updateYear(d1: D1Database, id: string, data: any) {
    const db = drizzle(d1, { schema });
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;

    await db.update(schema.academicYears).set(updateData).where(eq(schema.academicYears.id, id));
    return this.getYearById(d1, id);
  },

  async deleteYear(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    await db.delete(schema.academicYears).where(eq(schema.academicYears.id, id));
    return { success: true, id };
  },

  async getSubjects(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.subjects).orderBy(schema.subjects.name);
  },

  async getSubjectById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db.select().from(schema.subjects).where(eq(schema.subjects.id, id)).limit(1);
    return results[0] || null;
  },

  async createSubject(d1: D1Database, body: any) {
    const db = drizzle(d1, { schema });
    const newSubject = {
      id: body.id || generateId("subj"),
      schoolId: body.schoolId || "sch_smp_01",
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

  async updateSubject(d1: D1Database, id: string, data: any) {
    const db = drizzle(d1, { schema });
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.weightage !== undefined) updateData.weightage = data.weightage;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;

    await db.update(schema.subjects).set(updateData).where(eq(schema.subjects.id, id));
    return this.getSubjectById(d1, id);
  },

  async deleteSubject(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    await db.delete(schema.subjects).where(eq(schema.subjects.id, id));
    return { success: true, id };
  },

  async getClassrooms(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.classrooms).orderBy(schema.classrooms.name);
  },
};
