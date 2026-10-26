import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { compactDefined, generateId } from "../lib/utils";

export interface StudentInput {
  id?: string;
  schoolId: string;
  guardianId?: string | null;
  nis: string;
  nisn: string;
  name: string;
  gender?: "male" | "female";
  birthDate?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  documentUrl?: string | null;
  status?: "active" | "graduated" | "transferred" | "inactive";
}

export type UpdateStudentInput = Partial<Omit<StudentInput, "id">>;

export const studentManagement = {
  async getStudents(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.students).orderBy(desc(schema.students.createdAt));
  },

  async getStudentById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const results = await db.select().from(schema.students).where(eq(schema.students.id, id)).limit(1);
    return results[0] || null;
  },

  async createStudent(d1: D1Database, body: StudentInput) {
    const db = drizzle(d1, { schema });
    const newStudent = {
      id: body.id || generateId("std"),
      schoolId: body.schoolId,
      guardianId: body.guardianId || null,
      nis: body.nis,
      nisn: body.nisn,
      name: body.name,
      gender: body.gender || "male",
      birthDate: body.birthDate || null,
      birthPlace: body.birthPlace || null,
      address: body.address || null,
      avatarUrl: body.avatarUrl || null,
      documentUrl: body.documentUrl || null,
      status: body.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(schema.students).values(newStudent);
    return newStudent;
  },

  async updateStudent(d1: D1Database, id: string, data: UpdateStudentInput) {
    const db = drizzle(d1, { schema });
    const updateData = {
      ...compactDefined({
        name: data.name,
        nis: data.nis,
        nisn: data.nisn,
        gender: data.gender,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        address: data.address,
        status: data.status,
        avatarUrl: data.avatarUrl,
        documentUrl: data.documentUrl,
        guardianId: data.guardianId,
        schoolId: data.schoolId,
      }),
      updatedAt: new Date(),
    };

    await db.update(schema.students).set(updateData).where(eq(schema.students.id, id));
    return this.getStudentById(d1, id);
  },

  async deleteStudent(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    await db.delete(schema.students).where(eq(schema.students.id, id));
    return { success: true, id };
  },
};
