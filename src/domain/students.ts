import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import { generateId } from "../lib/utils";

export const studentManagement = {
  async getStudents(d1: D1Database) {
    const db = drizzle(d1, { schema });
    return db.select().from(schema.students).orderBy(desc(schema.students.createdAt));
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
};
