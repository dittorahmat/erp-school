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

  it("should enforce client-side domain isolation: frontend must not generate document sequence numbers or hardcode COA accounts", () => {
    const frontendDir = path.resolve(__dirname, "../frontend/src");
    if (!fs.existsSync(frontendDir)) return;

    const frontendFiles = fs.readdirSync(frontendDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const violations: string[] = [];

    for (const file of frontendFiles) {
      const filePath = path.join(frontendDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Regex matching random sequence format generator like INV/2026/ or PAY/2026/ with Math.random
      if (/(`|'|")INV\/\$\{.*Math\.random/i.test(content)) {
        violations.push(`${file} generates invoice sequence number with Math.random; sequence generation must be delegated to the backend domain.`);
      }
      if (/receivableAccountId:\s*['"]coa_/i.test(content) || /incomeAccountId:\s*['"]coa_/i.test(content)) {
        violations.push(`${file} hardcodes COA account IDs; general ledger account assignment must be resolved by the backend domain.`);
      }
    }

    expect(
      violations,
      `Found client domain leakage violations! Domain logic must stay in backend:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});
