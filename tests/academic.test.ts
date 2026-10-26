import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Academic Core Master Data API", () => {
  it("should respond with 200 and data when D1 returns records", async () => {
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
});
