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

  it("should enforce single seam index: routes must strictly import from '../domain', not individual domain files", () => {
    const violations: string[] = [];

    for (const file of routeFiles) {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Must not import from "../domain/xxx" or '../domain/xxx'
      if (/from\s+['"]\.\.\/domain\/.+['"]/.test(content)) {
        violations.push(`${file} imports from an individual domain submodule. Must strictly import from '../domain'.`);
      }
    }

    expect(
      violations,
      `Found seam leakage violations! Routes must strictly import from '../domain':\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("should verify that domain modules are centralized and exported in src/domain/index.ts", () => {
    const domainIndexPath = path.resolve(__dirname, "../src/domain/index.ts");
    expect(fs.existsSync(domainIndexPath)).toBe(true);

    const content = fs.readFileSync(domainIndexPath, "utf-8");
    expect(content).toContain('from "./accounting"');
    expect(content).toContain('from "./inventory"');
    expect(content).toContain('from "./attendance"');
    expect(content).toContain('from "./admission"');
    expect(content).toContain('from "./fees"');
    expect(content).toContain('from "./library"');
    expect(content).toContain('from "./portal"');
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
      if (/academicYearId:\s*['"]ay_202/i.test(content)) {
        violations.push(`${file} hardcodes academicYearId literal; active academic year must be dynamically resolved from state or API.`);
      }
    }

    expect(
      violations,
      `Found client domain leakage violations! Domain logic must stay in backend:\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("should enforce mathematical consistency in seed attendance records: sheet tallies must match line counts", () => {
    const seedPath = path.resolve(__dirname, "../src/db/seed.sql");
    expect(fs.existsSync(seedPath)).toBe(true);

    const seedContent = fs.readFileSync(seedPath, "utf-8");

    // Extract attendance sheets: ('att_xxx', ..., total_present, total_absent, total_sick, total_excused, ...)
    const sheetRegex = /\('(?<id>att_[^']+)',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*(?<p>\d+),\s*(?<a>\d+),\s*(?<s>\d+),\s*(?<e>\d+)/g;
    const lineRegex = /\('(?<lineId>attl_[^']+)',\s*'(?<sheetId>att_[^']+)',\s*'[^']+',\s*'(?<status>present|absent|sick|excused)'/g;

    const sheets = new Map<string, { present: number; absent: number; sick: number; excused: number }>();
    for (const match of seedContent.matchAll(sheetRegex)) {
      if (match.groups) {
        sheets.set(match.groups.id, {
          present: Number(match.groups.p),
          absent: Number(match.groups.a),
          sick: Number(match.groups.s),
          excused: Number(match.groups.e),
        });
      }
    }

    const lineCounts = new Map<string, { present: number; absent: number; sick: number; excused: number }>();
    for (const match of seedContent.matchAll(lineRegex)) {
      if (match.groups) {
        const { sheetId, status } = match.groups;
        if (!lineCounts.has(sheetId)) {
          lineCounts.set(sheetId, { present: 0, absent: 0, sick: 0, excused: 0 });
        }
        const counts = lineCounts.get(sheetId)!;
        if (status === "present") counts.present++;
        if (status === "absent") counts.absent++;
        if (status === "sick") counts.sick++;
        if (status === "excused") counts.excused++;
      }
    }

    const discrepancies: string[] = [];
    for (const [sheetId, sheetTally] of sheets) {
      const lines = lineCounts.get(sheetId) || { present: 0, absent: 0, sick: 0, excused: 0 };
      if (
        sheetTally.present !== lines.present ||
        sheetTally.absent !== lines.absent ||
        sheetTally.sick !== lines.sick ||
        sheetTally.excused !== lines.excused
      ) {
        discrepancies.push(
          `Sheet ${sheetId} tally mismatch! Header: P=${sheetTally.present}, A=${sheetTally.absent}, S=${sheetTally.sick}, E=${sheetTally.excused}. Actual Lines: P=${lines.present}, A=${lines.absent}, S=${lines.sick}, E=${lines.excused}`
        );
      }
    }

    expect(
      discrepancies,
      `Found attendance sheet vs line tally discrepancies:\n${discrepancies.join("\n")}`
    ).toEqual([]);
  });

  it("should enforce multi-tenancy: route handlers must not hardcode default school tenant IDs", () => {
    const violations: string[] = [];

    for (const file of routeFiles) {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Check for hardcoded school ID fallbacks like || "school_sma_hb" or || 'school_sma_hb'
      if (/\|\|\s*['"]school_[a-zA-Z0-9_]+['"]/.test(content) || /\|\|\s*['"]sch_[a-zA-Z0-9_]+['"]/.test(content)) {
        violations.push(`${file} contains hardcoded school tenant ID fallback. Tenant ID must be dynamically resolved from context.`);
      }
    }

    expect(
      violations,
      `Found hardcoded tenant fallbacks in routes! Tenant ID must be explicit:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});
