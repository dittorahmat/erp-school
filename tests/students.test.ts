import { describe, it, expect } from "vitest";
import app from "../src/index";

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
});
