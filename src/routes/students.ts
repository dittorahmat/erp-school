import { Hono } from "hono";
import { studentManagement } from "../domain/students";
import type { Bindings } from "../index";

export const studentRouter = new Hono<{ Bindings: Bindings }>();

// Students List & Create
studentRouter.get("/", async (c) => {
  const studentsList = await studentManagement.getStudents(c.env.DB);
  return c.json({ data: studentsList });
});

studentRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const student = await studentManagement.getStudentById(c.env.DB, id);
  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }
  return c.json({ success: true, data: student });
});

studentRouter.post("/", async (c) => {
  const body = await c.req.json();
  const newStudent = await studentManagement.createStudent(c.env.DB, body);
  return c.json({ success: true, data: newStudent }, 201);
});

studentRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updatedStudent = await studentManagement.updateStudent(c.env.DB, id, body);
  if (!updatedStudent) {
    return c.json({ error: "Student not found" }, 404);
  }
  return c.json({ success: true, data: updatedStudent });
});

studentRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await studentManagement.deleteStudent(c.env.DB, id);
  return c.json({ success: true, data: result });
});

// Cloudflare R2 Direct Upload for Student Avatars & Documents
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
      contentType: file.type,
    },
  });

  return c.json({
    success: true,
    key,
    url: `/api/students/files/${key}`,
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
