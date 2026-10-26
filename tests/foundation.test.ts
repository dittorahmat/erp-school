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

  it("should ensure client-side embedded JavaScript in shell HTML has zero syntax errors", async () => {
    const res = await app.request("/");
    const html = await res.text();
    const s = html.indexOf("<script", 1000);
    expect(s).toBeGreaterThan(-1);
    const start = html.indexOf(">", s) + 1;
    const end = html.indexOf("</script>", start);
    expect(end).toBeGreaterThan(start);
    const clientJs = html.slice(start, end);

    // Validate that browser JavaScript engine can parse clientJs without any SyntaxError
    expect(() => new Function(clientJs)).not.toThrow();
  });
});
