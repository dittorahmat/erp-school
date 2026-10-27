import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, and, sql, asc, lte } from "drizzle-orm";
import { generateId } from "../lib/utils";

export interface CreateAssetParams {
  id?: string;
  schoolId: string;
  name: string;
  code: string;
  category?: string;
  purchaseDate: string; // YYYY-MM-DD
  purchaseValue: number;
  salvageValue?: number;
  method?: string;
  durationMonths: number;
  assetAccountId?: string;
  depreciationAccountId?: string;
  expenseAccountId?: string;
  journalId?: string;
  notes?: string;
}

export interface PostDepreciationParams {
  schoolId: string;
  assetId?: string;
  cutoffDate?: string; // YYYY-MM-DD
  lineId?: string;
}

/**
 * Resolves default COA accounts for fixed assets if not explicitly provided.
 */
export async function resolveDefaultAssetAccounts(
  db: any,
  schoolId: string,
  preferred?: {
    assetAccountId?: string;
    depreciationAccountId?: string;
    expenseAccountId?: string;
    journalId?: string;
  }
) {
  let assetAccountId = preferred?.assetAccountId;
  let depreciationAccountId = preferred?.depreciationAccountId;
  let expenseAccountId = preferred?.expenseAccountId;
  let journalId = preferred?.journalId;

  if (!assetAccountId || !depreciationAccountId || !expenseAccountId) {
    const allAccounts = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.schoolId, schoolId));

    // Try finding specific accounts or fallbacks
    const assetAccounts = allAccounts.filter((a: any) => a.type === "asset");
    const expenseAccounts = allAccounts.filter((a: any) => a.type === "expense");

    if (!assetAccountId) {
      // Find asset account (e.g. peralatan / inventaris / aset tetap)
      const found =
        assetAccounts.find((a: any) => a.name.toLowerCase().includes("aset") || a.name.toLowerCase().includes("peralatan")) ||
        assetAccounts[0];
      assetAccountId = found?.id || "coa_asset_fixed";
    }

    if (!depreciationAccountId) {
      // Find accumulated depreciation (contra-asset or liability/asset)
      const found =
        allAccounts.find((a: any) => a.name.toLowerCase().includes("akumulasi") || a.code.startsWith("1-18") || a.code.startsWith("18")) ||
        assetAccounts[1] ||
        assetAccounts[0];
      depreciationAccountId = found?.id || "coa_asset_depr_accum";
    }

    if (!expenseAccountId) {
      // Find depreciation expense
      const found =
        expenseAccounts.find((a: any) => a.name.toLowerCase().includes("penyusutan") || a.name.toLowerCase().includes("depresiasi")) ||
        expenseAccounts[0];
      expenseAccountId = found?.id || "coa_exp_depr";
    }
  }

  if (!journalId) {
    const journalsList = await db
      .select()
      .from(schema.journals)
      .where(eq(schema.journals.schoolId, schoolId));
    const miscJournal =
      journalsList.find((j: any) => j.type === "general" || j.type === "misc" || j.code === "MISC" || j.code === "GEN") ||
      journalsList[0];
    journalId = miscJournal?.id || "jrn_misc";
  }

  return { assetAccountId, depreciationAccountId, expenseAccountId, journalId };
}

/**
 * Calculates straight-line depreciation schedule given purchase value, salvage value,
 * duration in months, and start purchase date.
 */
export function calculateStraightLineSchedule(
  purchaseValue: number,
  salvageValue: number,
  durationMonths: number,
  startDateStr: string
) {
  if (durationMonths <= 0) {
    throw new Error("Masa manfaat (durationMonths) harus lebih besar dari 0");
  }
  const depreciableValue = Math.max(0, purchaseValue - salvageValue);
  const monthlyAmount = Number((depreciableValue / durationMonths).toFixed(2));
  const schedule: Array<{
    sequence: number;
    depreciationDate: string;
    amount: number;
    accumulatedAmount: number;
    remainingValue: number;
  }> = [];

  let accumulated = 0;
  let remaining = purchaseValue;

  // Parse start date
  const [startYear, startMonth, startDay] = startDateStr.split("-").map(Number);
  let curYear = startYear;
  let curMonth = startMonth;

  for (let i = 1; i <= durationMonths; i++) {
    // Determine end of month or target day
    const day = Math.min(startDay || 1, 28);
    const dateFormatted = `${curYear}-${curMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    let amountForPeriod = monthlyAmount;
    // On the final period, adjust for any rounding remainder so accumulated matches depreciableValue exactly
    if (i === durationMonths) {
      amountForPeriod = Number((depreciableValue - accumulated).toFixed(2));
    }

    accumulated = Number((accumulated + amountForPeriod).toFixed(2));
    remaining = Number((purchaseValue - accumulated).toFixed(2));

    schedule.push({
      sequence: i,
      depreciationDate: dateFormatted,
      amount: amountForPeriod,
      accumulatedAmount: accumulated,
      remainingValue: remaining,
    });

    // Advance 1 month for subsequent period
    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }
  }

  return schedule;
}

/**
 * Deep Asset Management Domain Engine.
 * Encapsulates fixed assets master data, straight-line calculation schedule generation,
 * and Cloudflare D1 multi-statement atomic batch posting to double-entry general ledger.
 */
export const assetEngine = {
  /**
   * Retrieves all fixed assets for a school.
   */
  async getAssets(d1: D1Database, schoolId?: string) {
    const db = drizzle(d1, { schema });
    const query = db
      .select({
        id: schema.fixedAssets.id,
        schoolId: schema.fixedAssets.schoolId,
        name: schema.fixedAssets.name,
        code: schema.fixedAssets.code,
        category: schema.fixedAssets.category,
        purchaseDate: schema.fixedAssets.purchaseDate,
        purchaseValue: schema.fixedAssets.purchaseValue,
        salvageValue: schema.fixedAssets.salvageValue,
        depreciableValue: schema.fixedAssets.depreciableValue,
        method: schema.fixedAssets.method,
        durationMonths: schema.fixedAssets.durationMonths,
        assetAccountId: schema.fixedAssets.assetAccountId,
        depreciationAccountId: schema.fixedAssets.depreciationAccountId,
        expenseAccountId: schema.fixedAssets.expenseAccountId,
        journalId: schema.fixedAssets.journalId,
        status: schema.fixedAssets.status,
        notes: schema.fixedAssets.notes,
        createdAt: schema.fixedAssets.createdAt,
        updatedAt: schema.fixedAssets.updatedAt,
      })
      .from(schema.fixedAssets);

    if (schoolId) {
      return query.where(eq(schema.fixedAssets.schoolId, schoolId)).orderBy(schema.fixedAssets.code);
    }
    return query.orderBy(schema.fixedAssets.code);
  },

  /**
   * Retrieves an asset with its depreciation lines schedule.
   */
  async getAssetById(d1: D1Database, id: string) {
    const db = drizzle(d1, { schema });
    const assets = await db
      .select()
      .from(schema.fixedAssets)
      .where(eq(schema.fixedAssets.id, id))
      .limit(1);

    if (assets.length === 0) return null;
    const asset = assets[0];

    const lines = await db
      .select()
      .from(schema.assetDepreciationLines)
      .where(eq(schema.assetDepreciationLines.assetId, id))
      .orderBy(asc(schema.assetDepreciationLines.sequence));

    return { ...asset, lines };
  },

  /**
   * Registers a new fixed asset and atomically generates its depreciation schedule lines.
   */
  async registerAsset(d1: D1Database, params: CreateAssetParams) {
    const db = drizzle(d1, { schema });

    if (!params.schoolId) throw new Error("schoolId is required");
    if (!params.name || !params.code) throw new Error("name and code are required");
    if (!params.purchaseDate) throw new Error("purchaseDate is required");
    if (params.purchaseValue <= 0) throw new Error("purchaseValue must be greater than 0");
    if (!params.durationMonths || params.durationMonths <= 0) {
      throw new Error("durationMonths must be greater than 0");
    }

    // Guardrail: check code uniqueness
    const existing = await db
      .select()
      .from(schema.fixedAssets)
      .where(
        and(
          eq(schema.fixedAssets.schoolId, params.schoolId),
          eq(schema.fixedAssets.code, params.code)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Asset with code ${params.code} already exists in this school`);
    }

    const { assetAccountId, depreciationAccountId, expenseAccountId, journalId } =
      await resolveDefaultAssetAccounts(db, params.schoolId, {
        assetAccountId: params.assetAccountId,
        depreciationAccountId: params.depreciationAccountId,
        expenseAccountId: params.expenseAccountId,
        journalId: params.journalId,
      });

    const assetId = params.id || generateId("ast");
    const salvageValue = Number(params.salvageValue || 0);
    const depreciableValue = Math.max(0, params.purchaseValue - salvageValue);

    const assetRecord = {
      id: assetId,
      schoolId: params.schoolId,
      name: params.name,
      code: params.code,
      category: params.category || "equipment",
      purchaseDate: params.purchaseDate,
      purchaseValue: params.purchaseValue,
      salvageValue,
      depreciableValue,
      method: params.method || "straight_line",
      durationMonths: params.durationMonths,
      assetAccountId,
      depreciationAccountId,
      expenseAccountId,
      journalId,
      status: "running" as const,
      notes: params.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Pre-calculate depreciation schedule
    const schedule = calculateStraightLineSchedule(
      params.purchaseValue,
      salvageValue,
      params.durationMonths,
      params.purchaseDate
    );

    const lineRecords = schedule.map((s) => ({
      id: generateId("astl"),
      assetId,
      schoolId: params.schoolId,
      sequence: s.sequence,
      depreciationDate: s.depreciationDate,
      amount: s.amount,
      accumulatedAmount: s.accumulatedAmount,
      remainingValue: s.remainingValue,
      status: "draft" as const,
      moveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Atomically batch insert fixed asset and all schedule lines into D1
    const statements: any[] = [
      db.insert(schema.fixedAssets).values(assetRecord as any),
      ...lineRecords.map((line) => db.insert(schema.assetDepreciationLines).values(line as any)),
    ];

    await db.batch(statements as [any, ...any[]]);

    return { ...assetRecord, lines: lineRecords };
  },

  /**
   * Retrieves pending / draft depreciation lines that can be posted.
   */
  async getDepreciationLines(
    d1: D1Database,
    schoolId: string,
    filters?: { assetId?: string; status?: "draft" | "posted"; cutoffDate?: string }
  ) {
    const db = drizzle(d1, { schema });
    let query = db
      .select({
        line: schema.assetDepreciationLines,
        assetName: schema.fixedAssets.name,
        assetCode: schema.fixedAssets.code,
        expenseAccountId: schema.fixedAssets.expenseAccountId,
        depreciationAccountId: schema.fixedAssets.depreciationAccountId,
        journalId: schema.fixedAssets.journalId,
      })
      .from(schema.assetDepreciationLines)
      .innerJoin(
        schema.fixedAssets,
        eq(schema.assetDepreciationLines.assetId, schema.fixedAssets.id)
      )
      .where(eq(schema.assetDepreciationLines.schoolId, schoolId));

    const conditions: any[] = [eq(schema.assetDepreciationLines.schoolId, schoolId)];
    if (filters?.assetId) {
      conditions.push(eq(schema.assetDepreciationLines.assetId, filters.assetId));
    }
    if (filters?.status) {
      conditions.push(eq(schema.assetDepreciationLines.status, filters.status));
    }
    if (filters?.cutoffDate) {
      conditions.push(lte(schema.assetDepreciationLines.depreciationDate, filters.cutoffDate));
    }

    return db
      .select({
        line: schema.assetDepreciationLines,
        assetName: schema.fixedAssets.name,
        assetCode: schema.fixedAssets.code,
        expenseAccountId: schema.fixedAssets.expenseAccountId,
        depreciationAccountId: schema.fixedAssets.depreciationAccountId,
        journalId: schema.fixedAssets.journalId,
      })
      .from(schema.assetDepreciationLines)
      .innerJoin(
        schema.fixedAssets,
        eq(schema.assetDepreciationLines.assetId, schema.fixedAssets.id)
      )
      .where(and(...conditions))
      .orderBy(asc(schema.assetDepreciationLines.depreciationDate));
  },

  /**
   * Posts depreciation lines into balanced double-entry Journal Entries (account.move)
   * Debit: Beban Penyusutan (Expense)
   * Credit: Akumulasi Penyusutan (Contra-Asset)
   * Executed atomically via Cloudflare D1 db.batch([...]).
   */
  async postDepreciation(d1: D1Database, params: PostDepreciationParams) {
    const db = drizzle(d1, { schema });
    const { schoolId, assetId, cutoffDate, lineId } = params;

    if (!schoolId) throw new Error("schoolId is required");

    // Query eligible draft depreciation lines
    const conditions: any[] = [
      eq(schema.assetDepreciationLines.schoolId, schoolId),
      eq(schema.assetDepreciationLines.status, "draft"),
    ];
    if (assetId) conditions.push(eq(schema.assetDepreciationLines.assetId, assetId));
    if (lineId) conditions.push(eq(schema.assetDepreciationLines.id, lineId));
    if (cutoffDate) conditions.push(lte(schema.assetDepreciationLines.depreciationDate, cutoffDate));

    const eligibleLines = await db
      .select({
        line: schema.assetDepreciationLines,
        asset: schema.fixedAssets,
      })
      .from(schema.assetDepreciationLines)
      .innerJoin(
        schema.fixedAssets,
        eq(schema.assetDepreciationLines.assetId, schema.fixedAssets.id)
      )
      .where(and(...conditions))
      .orderBy(asc(schema.assetDepreciationLines.sequence));

    if (eligibleLines.length === 0) {
      return { postedCount: 0, totalAmount: 0, moves: [] };
    }

    const batchStatements: any[] = [];
    const createdMoves: any[] = [];
    let totalAmount = 0;

    for (const item of eligibleLines) {
      const { line, asset } = item;
      const moveId = generateId("mov_depr");
      const moveName = `DEPR/${line.depreciationDate.substring(0, 7).replace("-", "/")}/${asset.code}/${line.sequence.toString().padStart(3, "0")}`;

      // 1. Header account.move
      const moveRecord = {
        id: moveId,
        schoolId,
        journalId: asset.journalId,
        studentId: null,
        name: moveName,
        date: line.depreciationDate,
        moveType: "entry" as const, // Miscellaneous / General Journal Entry
        amountTotal: line.amount,
        amountResidual: 0,
        state: "posted" as const,
        paymentState: "paid" as const,
        invoiceDueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      batchStatements.push(db.insert(schema.accountMoves).values(moveRecord));

      // 2. Balanced Debit Line (Beban Penyusutan)
      const debitLine = {
        id: generateId("aml"),
        moveId,
        accountId: asset.expenseAccountId,
        studentId: null,
        name: `Beban Penyusutan - ${asset.name} (Bulan #${line.sequence})`,
        debit: line.amount,
        credit: 0,
        reconciled: false,
        createdAt: new Date(),
      };
      batchStatements.push(db.insert(schema.accountMoveLines).values(debitLine));

      // 3. Balanced Credit Line (Akumulasi Penyusutan)
      const creditLine = {
        id: generateId("aml"),
        moveId,
        accountId: asset.depreciationAccountId,
        studentId: null,
        name: `Akumulasi Penyusutan - ${asset.name} (Bulan #${line.sequence})`,
        debit: 0,
        credit: line.amount,
        reconciled: false,
        createdAt: new Date(),
      };
      batchStatements.push(db.insert(schema.accountMoveLines).values(creditLine));

      // 4. Update status line depresiasi menjadi 'posted'
      batchStatements.push(
        db
          .update(schema.assetDepreciationLines)
          .set({
            status: "posted",
            moveId,
            updatedAt: new Date(),
          })
          .where(eq(schema.assetDepreciationLines.id, line.id))
      );

      totalAmount = Number((totalAmount + line.amount).toFixed(2));
      createdMoves.push({ moveId, moveName, amount: line.amount, assetCode: asset.code });
    }

    // Execute atomic batch
    await db.batch(batchStatements as [any, ...any[]]);

    // Check if asset is now fully depreciated
    if (assetId) {
      const remainingDrafts = await db
        .select()
        .from(schema.assetDepreciationLines)
        .where(
          and(
            eq(schema.assetDepreciationLines.assetId, assetId),
            eq(schema.assetDepreciationLines.status, "draft")
          )
        );

      if (remainingDrafts.length === 0) {
        await db
          .update(schema.fixedAssets)
          .set({ status: "depreciated", updatedAt: new Date() })
          .where(eq(schema.fixedAssets.id, assetId));
      }
    }

    return {
      postedCount: eligibleLines.length,
      totalAmount,
      moves: createdMoves,
    };
  },
};
