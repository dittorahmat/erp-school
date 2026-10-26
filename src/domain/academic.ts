import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { compactDefined, generateId } from "../lib/utils";

export interface AcademicYearInput {
  id?: string;
  schoolId?: string;
  name: string;
  code: string;
  startDate?: string;
  endDate?: string;
  status?: "draft" | "active" | "closed";
}

export type UpdateAcademicYearInput = Partial<Omit<AcademicYearInput, "id">>;

export interface SubjectInput {
  id?: string;
  schoolId?: string;
  name: string;
  code: string;
  type?: "compulsory" | "elective";
  weightage?: number;
}

export type UpdateSubjectInput = Partial<Omit<SubjectInput, "id">>;

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

  async createYear(d1: D1Database, body: AcademicYearInput) {
    const db = drizzle(d1, { schema });
    const newYear = {
      id: body.id || generateId("ay"),
      schoolId: body.schoolId || "sch_smp_01",
      name: body.name,
      code: body.code,
      startDate: body.startDate || "2026-07-01",
      endDate: body.endDate || "2027-06-30",
      status: body.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.academicYears).values(newYear);
    return newYear;
  },

  async updateYear(d1: D1Database, id: string, data: UpdateAcademicYearInput) {
    const db = drizzle(d1, { schema });
    const updateData = {
      ...compactDefined({
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        schoolId: data.schoolId,
      }),
      updatedAt: new Date(),
    };

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

  async createSubject(d1: D1Database, body: SubjectInput) {
    const db = drizzle(d1, { schema });
    const newSubject = {
      id: body.id || generateId("subj"),
      schoolId: body.schoolId || "sch_smp_01",
      name: body.name,
      code: body.code,
      type: body.type || "compulsory",
      weightage: body.weightage !== undefined ? Number(body.weightage) : 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.subjects).values(newSubject);
    return newSubject;
  },

  async updateSubject(d1: D1Database, id: string, data: UpdateSubjectInput) {
    const db = drizzle(d1, { schema });
    const updateData = {
      ...compactDefined({
        name: data.name,
        code: data.code,
        type: data.type,
        weightage: data.weightage !== undefined ? Number(data.weightage) : undefined,
        schoolId: data.schoolId,
      }),
      updatedAt: new Date(),
    };

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
