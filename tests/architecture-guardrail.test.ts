import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Architecture Boundary Guardrail", () => {
  const routesDir = path.resolve(__dirname, "../src/routes");
  const routeFiles = fs.readdirSync(routesDir).filter((f) => f.endsWith(".ts"));

  it("should enforce thin HTTP adapters: routes must not directly import drizzle-orm/d1", () => {
    const violations: string[] = [];

    for (const file of routeFiles) {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Routes must delegate database queries and atomic batching to src/domain/ modules
      if (content.includes('from "drizzle-orm/d1"') || content.includes("from 'drizzle-orm/d1'")) {
        violations.push(`${file} imports drizzle-orm/d1 directly instead of using src/domain/`);
      }
    }

    expect(
      violations,
      `Found shallow controller violations! Routes must delegate to src/domain/:\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("should verify that domain modules are centralized and exported in src/domain/index.ts", () => {
    const domainIndexPath = path.resolve(__dirname, "../src/domain/index.ts");
    expect(fs.existsSync(domainIndexPath)).toBe(true);

    const content = fs.readFileSync(domainIndexPath, "utf-8");
    expect(content).toContain('from "./accounting"');
    expect(content).toContain('from "./inventory"');
    expect(content).toContain('from "./attendance"');
  });
});
