import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { generateId } from "../lib/utils";

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

  async createStudent(d1: D1Database, body: any) {
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

  async updateStudent(d1: D1Database, id: string, data: any) {
    const db = drizzle(d1, { schema });
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.nis !== undefined) updateData.nis = data.nis;
    if (data.nisn !== undefined) updateData.nisn = data.nisn;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.birthPlace !== undefined) updateData.birthPlace = data.birthPlace;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl;
    if (data.guardianId !== undefined) updateData.guardianId = data.guardianId;

    await db.update(schema.students).set(updateData).where(eq(schema.students.id, id));
    return this.getStudentById(d1, id);
  },

  async deleteStudent(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    await db.delete(schema.students).where(eq(schema.students.id, id));
    return { success: true, id };
  },
};
