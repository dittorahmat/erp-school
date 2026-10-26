import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Foundation Tracer Bullet - Cloudflare Monolith", () => {
  it("should return healthy status on /api/health", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; service: string };
    expect(data.status).toBe("ok");
    expect(data.service).toBe("erp-school-monolith");
  });

  it("should serve Odoo shell HTML on root", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("ERP Sekolah");
    expect(html).not.toContain("Odoo Edition");
    expect(html).toContain("Odoo Control Panel");
    expect(html).toContain("SMA Harapan Bangsa");
  });
});
