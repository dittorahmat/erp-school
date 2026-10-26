import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Academic Core Master Data API", () => {
  describe("Academic Years CRUD", () => {
    it("should respond with 200 on GET /api/academic/years", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => []
            })
          })
        }
      };
      const res = await app.request("/api/academic/years", {}, mockEnv as any);
      expect(res.status).toBe(200);
      const data = (await res.json()) as { data: any[] };
      expect(data).toHaveProperty("data");
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should respond with 201 on POST /api/academic/years", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              run: async () => ({ success: true })
            })
          })
        }
      };
      const payload = {
        schoolId: "sch_smp_01",
        name: "2026/2027",
        code: "AY-2627",
        startDate: "2026-07-15",
        endDate: "2027-06-20",
        status: "active"
      };
      const res = await app.request(
        "/api/academic/years",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        },
        mockEnv as any
      );
      expect(res.status).toBe(201);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("2026/2027");
      expect(body.data.code).toBe("AY-2627");
      expect(body.data.startDate).toBe("2026-07-15");
      expect(body.data.endDate).toBe("2027-06-20");
      expect(body.data.status).toBe("active");
    });

    it("should return academic year by ID via GET /api/academic/years/:id", async () => {
      const mockYear = {
        id: "ay_test_01",
        schoolId: "sch_smp_01",
        name: "2026/2027",
        code: "AY-2627",
        startDate: "2026-07-15",
        endDate: "2027-06-20",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => [Object.values(mockYear)]
            })
          })
        }
      };
      const res = await app.request("/api/academic/years/ay_test_01", {}, mockEnv as any);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it("should return 404 when academic year not found via GET /api/academic/years/:id", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => []
            })
          })
        }
      };
      const res = await app.request("/api/academic/years/ay_unknown", {}, mockEnv as any);
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe("Academic year not found");
    });

    it("should update academic year via PUT /api/academic/years/:id", async () => {
      const updatedYear = {
        id: "ay_test_01",
        schoolId: "sch_smp_01",
        name: "2026/2027 Updated",
        code: "AY-2627-REV",
        startDate: "2026-07-15",
        endDate: "2027-06-20",
        status: "closed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              run: async () => ({ success: true }),
              raw: async () => [Object.values(updatedYear)]
            })
          })
        }
      };
      const res = await app.request(
        "/api/academic/years/ay_test_01",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "2026/2027 Updated",
            status: "closed"
          })
        },
        mockEnv as any
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
    });

    it("should delete academic year via DELETE /api/academic/years/:id", async () => {
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
        "/api/academic/years/ay_test_01",
        { method: "DELETE" },
        mockEnv as any
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe("ay_test_01");
    });
  });

  describe("Subjects CRUD", () => {
    it("should respond with 200 on GET /api/academic/subjects", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => []
            })
          })
        }
      };
      const res = await app.request("/api/academic/subjects", {}, mockEnv as any);
      expect(res.status).toBe(200);
      const data = (await res.json()) as { data: any[] };
      expect(data).toHaveProperty("data");
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should respond with 201 on POST /api/academic/subjects", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              run: async () => ({ success: true })
            })
          })
        }
      };
      const payload = {
        schoolId: "sch_smp_01",
        name: "Matematika",
        code: "MAT-10",
        type: "compulsory",
        weightage: 100
      };
      const res = await app.request(
        "/api/academic/subjects",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        },
        mockEnv as any
      );
      expect(res.status).toBe(201);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("Matematika");
      expect(body.data.code).toBe("MAT-10");
    });

    it("should return subject by ID via GET /api/academic/subjects/:id", async () => {
      const mockSubject = {
        id: "subj_test_01",
        schoolId: "sch_smp_01",
        name: "Matematika",
        code: "MAT-10",
        type: "compulsory",
        weightage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => [Object.values(mockSubject)]
            })
          })
        }
      };
      const res = await app.request("/api/academic/subjects/subj_test_01", {}, mockEnv as any);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it("should return 404 when subject not found via GET /api/academic/subjects/:id", async () => {
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              raw: async () => []
            })
          })
        }
      };
      const res = await app.request("/api/academic/subjects/subj_unknown", {}, mockEnv as any);
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe("Subject not found");
    });

    it("should update subject via PUT /api/academic/subjects/:id", async () => {
      const updatedSubject = {
        id: "subj_test_01",
        schoolId: "sch_smp_01",
        name: "Matematika Peminatan",
        code: "MAT-10-PEM",
        type: "elective",
        weightage: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const mockEnv = {
        DB: {
          prepare: () => ({
            bind: () => ({
              run: async () => ({ success: true }),
              raw: async () => [Object.values(updatedSubject)]
            })
          })
        }
      };
      const res = await app.request(
        "/api/academic/subjects/subj_test_01",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Matematika Peminatan",
            type: "elective"
          })
        },
        mockEnv as any
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
    });

    it("should delete subject via DELETE /api/academic/subjects/:id", async () => {
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
        "/api/academic/subjects/subj_test_01",
        { method: "DELETE" },
        mockEnv as any
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean; data: any };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe("subj_test_01");
    });
  });
});
