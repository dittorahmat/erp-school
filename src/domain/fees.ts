import { eq, and, desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import {
  feeCategories,
  feeStructures,
  students,
  enrollments,
  classrooms,
  accountMoves,
  accountMoveLines,
  journals,
  chartOfAccounts
} from '../db/schema';
import { generateId, compactDefined } from '../lib/utils';

export interface CreateFeeCategoryParams {
  schoolId: string;
  name: string;
  code: string;
  description?: string;
}

export interface CreateFeeStructureParams {
  schoolId: string;
  academicYearId: string;
  categoryId: string;
  name: string;
  code: string;
  amount: number;
  interval?: 'monthly' | 'term' | 'yearly' | 'once';
  gradeLevelId?: string;
  courseId?: string;
  receivableAccountId?: string;
  incomeAccountId?: string;
}

export interface GenerateMonthlyFeesParams {
  schoolId: string;
  academicYearId: string;
  month: string; // e.g. "2026-10" or "Oktober 2026"
  feeStructureId: string;
  classroomId?: string;
}

export const createFeeCategory = async (
  db: any,
  rawDb: D1Database,
  params: CreateFeeCategoryParams
) => {
  const id = generateId('feecat');
  await rawDb.batch([
    db.insert(feeCategories).values({
      id,
      schoolId: params.schoolId,
      name: params.name,
      code: params.code,
      description: params.description ?? null,
      createdAt: new Date()
    })
  ]);
  return { id };
};

export const listFeeCategories = async (db: any, schoolId: string) => {
  return db
    .select()
    .from(feeCategories)
    .where(eq(feeCategories.schoolId, schoolId));
};

export const createFeeStructure = async (
  db: any,
  rawDb: D1Database,
  params: CreateFeeStructureParams
) => {
  const id = generateId('feestr');
  const now = new Date();
  await rawDb.batch([
    db.insert(feeStructures).values({
      id,
      schoolId: params.schoolId,
      academicYearId: params.academicYearId,
      categoryId: params.categoryId,
      name: params.name,
      code: params.code,
      amount: params.amount,
      interval: params.interval ?? 'monthly',
      gradeLevelId: params.gradeLevelId ?? null,
      courseId: params.courseId ?? null,
      receivableAccountId: params.receivableAccountId ?? null,
      incomeAccountId: params.incomeAccountId ?? null,
      createdAt: now,
      updatedAt: now
    })
  ]);
  return { id };
};

export const listFeeStructures = async (db: any, schoolId: string) => {
  return db
    .select()
    .from(feeStructures)
    .where(eq(feeStructures.schoolId, schoolId))
    .orderBy(desc(feeStructures.createdAt));
};

export const generateMonthlyFees = async (
  db: any,
  rawDb: D1Database,
  params: GenerateMonthlyFeesParams
) => {
  // 1. Get Fee Structure
  const [structure] = await db
    .select()
    .from(feeStructures)
    .where(eq(feeStructures.id, params.feeStructureId));
  if (!structure) throw new Error('Fee structure not found');

  // 2. Resolve default journal & accounts
  let recAccountId = structure.receivableAccountId;
  let incAccountId = structure.incomeAccountId;

  const accounts = await db
    .select()
    .from(chartOfAccounts)
    .where(eq(chartOfAccounts.schoolId, params.schoolId));
  recAccountId = recAccountId || accounts.find((a: any) => a.type === 'asset')?.id || accounts[0]?.id;
  incAccountId = incAccountId || accounts.find((a: any) => a.type === 'income')?.id || accounts[1]?.id;

  const [saleJournal] = await db
    .select()
    .from(journals)
    .where(eq(journals.schoolId, params.schoolId));
  const journalId = saleJournal?.id;

  if (!recAccountId || !incAccountId || !journalId) {
    throw new Error('Accounting COA or Journal not properly configured');
  }

  // 3. Find eligible active enrolled students
  let query = db
    .select({
      studentId: students.id,
      studentName: students.name,
      classroomId: classrooms.id
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(classrooms, eq(enrollments.classroomId, classrooms.id))
    .where(
      and(
        eq(enrollments.academicYearId, params.academicYearId),
        eq(enrollments.status, 'active')
      )
    );

  const activeEnrolled = await query;
  const filteredStudents = params.classroomId
    ? activeEnrolled.filter((e: any) => e.classroomId === params.classroomId)
    : activeEnrolled;

  if (filteredStudents.length === 0) {
    return { generatedCount: 0, message: 'No eligible active students found' };
  }

  // 4. Check for duplicates in existing moves for this period & structure
  const existingMoves = await db
    .select()
    .from(accountMoves)
    .where(eq(accountMoves.schoolId, params.schoolId));

  const batchOps: any[] = [];
  let generatedCount = 0;
  const now = new Date();

  for (const item of filteredStudents) {
    const invoiceRef = `INV/${params.month}/${item.studentId.slice(-4)}`;
    
    // Check duplicate
    const isDuplicate = existingMoves.some(
      (m: any) => m.studentId === item.studentId && m.name === invoiceRef
    );
    if (isDuplicate) continue;

    const moveId = generateId('inv');
    const feeAmount = structure.amount;

    // Header: account.move
    batchOps.push(
      db.insert(accountMoves).values({
        id: moveId,
        schoolId: params.schoolId,
        journalId,
        studentId: item.studentId,
        name: invoiceRef,
        date: new Date().toISOString().slice(0, 10),
        moveType: 'out_invoice',
        amountTotal: feeAmount,
        amountResidual: feeAmount,
        state: 'draft',
        paymentState: 'not_paid',
        createdAt: now,
        updatedAt: now
      }),
      // Line Debit: Piutang Siswa
      db.insert(accountMoveLines).values({
        id: generateId('line'),
        moveId,
        accountId: recAccountId,
        studentId: item.studentId,
        name: `${structure.name} - Periode ${params.month}`,
        debit: feeAmount,
        credit: 0,
        createdAt: now
      }),
      // Line Credit: Pendapatan SPP / Biaya Sekolah
      db.insert(accountMoveLines).values({
        id: generateId('line'),
        moveId,
        accountId: incAccountId,
        studentId: item.studentId,
        name: `${structure.name} - Periode ${params.month}`,
        debit: 0,
        credit: feeAmount,
        createdAt: now
      })
    );
    generatedCount++;
  }

  if (batchOps.length > 0) {
    await rawDb.batch(batchOps);
  }

  return {
    generatedCount,
    totalAmount: generatedCount * structure.amount,
    month: params.month
  };
};
