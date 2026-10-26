import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Timetable & Daily Attendance API", () => {
  it("should respond with 200 on timetable list", async () => {
    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            raw: async () => []
          })
        })
      }
    };
    const res = await app.request("/api/attendance/timetables", {}, mockEnv as any);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { data: any[] };
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });
});
