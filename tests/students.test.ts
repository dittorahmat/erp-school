import { describe, it, expect } from "vitest";
import app from "../src/index";
import { studentManagement } from "../src/domain/students";
import { createMockD1Database } from "./helpers/d1-mock";

describe("Student Management & R2 Storage API", () => {
  it("should respond with 200 on student list", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      },
      STORAGE: {
        put: async () => {},
        get: async () => null
      }
    };
    const res = await app.request("/api/students", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { data: any[] };
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should respond with 201 on create student via POST /api/students", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        })
      }
    };

    const studentPayload = {
      schoolId: "sch_01",
      name: "Budi Pratama",
      nis: "2026001",
      nisn: "0012345678",
      gender: "male",
      status: "active",
      birthPlace: "Jakarta",
      birthDate: "2010-05-15",
      address: "Jl. Merdeka No. 10"
    };

    const res = await app.request(
      "/api/students",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload)
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Budi Pratama");
    expect(body.data.nis).toBe("2026001");
    expect(body.data.nisn).toBe("0012345678");
    expect(body.data.birthPlace).toBe("Jakarta");
    expect(body.data.birthDate).toBe("2010-05-15");
    expect(body.data.address).toBe("Jl. Merdeka No. 10");
  });

  it("should return student by ID via GET /api/students/:id", async () => {
    const mockStudent = {
      id: "std_test_01",
      schoolId: "sch_01",
      name: "Siti Aminah",
      nis: "2026002",
      nisn: "0012345679",
      gender: "female",
      status: "active",
      birthPlace: "Bandung",
      birthDate: "2010-08-20",
      address: "Jl. Asia Afrika",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => [Object.values(mockStudent)]
          })
        })
      }
    };

    const res = await app.request("/api/students/std_test_01", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
  });

  it("should return 404 when student not found via GET /api/students/:id", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };

    const res = await app.request("/api/students/std_non_existent", {}, mockEnv as any);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Student not found");
  });

  it("should update student via PUT /api/students/:id", async () => {
    const updatedStudent = {
      id: "std_test_01",
      schoolId: "sch_01",
      name: "Siti Aminah Updated",
      nis: "2026002",
      nisn: "0012345679",
      gender: "female",
      status: "graduated",
      birthPlace: "Bandung",
      birthDate: "2010-08-20",
      address: "Jl. Baru",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true }),
            raw: async () => [Object.values(updatedStudent)]
          })
        })
      }
    };

    const res = await app.request(
      "/api/students/std_test_01",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Siti Aminah Updated",
          status: "graduated",
          address: "Jl. Baru"
        })
      },
      mockEnv as any
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
  });

  it("should delete student via DELETE /api/students/:id", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        })
      }
    };

    const res = await app.request(
      "/api/students/std_test_01",
      {
        method: "DELETE"
      },
      mockEnv as any
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("std_test_01");
  });
});

describe("Student Domain Module Unit Tests", () => {
  it("should support full fields in createStudent", async () => {
    const mockD1 = createMockD1Database([]);
    const student = await studentManagement.createStudent(mockD1, {
      schoolId: "sch_01",
      name: "Ahmad Fauzi",
      nis: "2026005",
      nisn: "0012345690",
      gender: "male",
      status: "active",
      birthPlace: "Surabaya",
      birthDate: "2011-01-10",
      address: "Jl. Pemuda No. 5"
    });

    expect(student.name).toBe("Ahmad Fauzi");
    expect(student.nis).toBe("2026005");
    expect(student.nisn).toBe("0012345690");
    expect(student.gender).toBe("male");
    expect(student.status).toBe("active");
    expect(student.birthPlace).toBe("Surabaya");
    expect(student.birthDate).toBe("2011-01-10");
    expect(student.address).toBe("Jl. Pemuda No. 5");
    expect(student.id).toBeDefined();
  });

  it("should delete student directly in domain", async () => {
    const mockD1 = createMockD1Database([]);
    const result = await studentManagement.deleteStudent(mockD1, "std_del_01");
    expect(result.success).toBe(true);
    expect(result.id).toBe("std_del_01");
  });
});
