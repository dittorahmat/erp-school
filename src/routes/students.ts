import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { desc } from "drizzle-orm";
import type { Bindings } from "../index";
import { generateId } from "../lib/utils";

export const studentRouter = new Hono<{ Bindings: Bindings }>();

// --------------------------------------------------------------------------
// Students List & Create
// --------------------------------------------------------------------------
studentRouter.get("/", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const studentsList = await db.select().from(schema.students).orderBy(desc(schema.students.createdAt));
  return c.json({ data: studentsList });
});

studentRouter.post("/", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
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
    updatedAt: new Date()
  };
  await db.insert(schema.students).values(newStudent);
  return c.json({ success: true, data: newStudent }, 201);
});

// --------------------------------------------------------------------------
// Cloudflare R2 Direct Upload for Student Avatars & Documents
// --------------------------------------------------------------------------
studentRouter.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  if (!file || typeof file === "string") {
    return c.json({ error: "No file provided" }, 400);
  }

  const key = `students/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await c.env.STORAGE.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type
    }
  });

  return c.json({
    success: true,
    key,
    url: `/api/students/files/${key}`
  });
});

// Fetch stored file from R2
studentRouter.get("/files/*", async (c) => {
  const key = c.req.path.replace("/api/students/files/", "");
  const object = await c.env.STORAGE.get(key);
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
});
