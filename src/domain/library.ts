import { eq, and, desc, sql } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import {
  products,
  libraryMedia,
  libraryIssues,
  students,
  stockPickings,
  stockMoves,
  stockLocations,
  accountMoves,
  accountMoveLines,
  journals,
  chartOfAccounts
} from '../db/schema';
import { generateId, compactDefined } from '../lib/utils';

export interface CreateLibraryMediaParams {
  schoolId: string;
  name: string;
  code: string;
  isbn?: string;
  author: string;
  publisher?: string;
  edition?: string;
  subjectId?: string;
  shelfLocation?: string;
  barcode: string;
  standardPrice?: number;
  listPrice?: number;
}

export interface IssueBookParams {
  schoolId: string;
  mediaId: string;
  studentId: string;
  issueDate?: string;
  dueDays?: number; // default 14 days
  dueDate?: string;
  notes?: string;
  maxActiveLoans?: number; // default 3 books
}

export interface ReturnBookParams {
  schoolId: string;
  issueId: string;
  returnDate?: string;
  condition?: 'good' | 'damaged' | 'lost';
  dailyFineRate?: number; // e.g. 2000 IDR / day
  damageCharge?: number;
  notes?: string;
}

export interface MarkLostBookParams {
  schoolId: string;
  issueId: string;
  replacementCost?: number;
  notes?: string;
}

export const catalogMedia = async (
  db: any,
  rawDb: D1Database,
  params: CreateLibraryMediaParams
) => {
  const productId = generateId('prod');
  const mediaId = generateId('med');
  const now = new Date();

  const productData = {
    id: productId,
    schoolId: params.schoolId,
    name: params.name,
    code: params.code,
    type: 'storable' as const,
    uom: 'unit',
    listPrice: params.listPrice ?? 0,
    standardPrice: params.standardPrice ?? 0,
    serialNumber: params.barcode,
    createdAt: now,
    updatedAt: now
  };

  const mediaData = {
    id: mediaId,
    schoolId: params.schoolId,
    productId: productId,
    isbn: params.isbn || null,
    author: params.author,
    publisher: params.publisher || null,
    edition: params.edition || null,
    subjectId: params.subjectId || null,
    shelfLocation: params.shelfLocation || null,
    barcode: params.barcode,
    status: 'available' as const,
    createdAt: now,
    updatedAt: now
  };

  await rawDb.batch([
    db.insert(products).values(productData),
    db.insert(libraryMedia).values(mediaData)
  ]);

  return { ...mediaData, name: params.name, code: params.code };
};

export const listLibraryMedia = async (db: any, schoolId: string, search?: string) => {
  const query = db
    .select({
      id: libraryMedia.id,
      schoolId: libraryMedia.schoolId,
      productId: libraryMedia.productId,
      name: products.name,
      code: products.code,
      isbn: libraryMedia.isbn,
      author: libraryMedia.author,
      publisher: libraryMedia.publisher,
      edition: libraryMedia.edition,
      subjectId: libraryMedia.subjectId,
      shelfLocation: libraryMedia.shelfLocation,
      barcode: libraryMedia.barcode,
      status: libraryMedia.status,
      standardPrice: products.standardPrice,
      listPrice: products.listPrice,
      createdAt: libraryMedia.createdAt,
      updatedAt: libraryMedia.updatedAt
    })
    .from(libraryMedia)
    .innerJoin(products, eq(libraryMedia.productId, products.id))
    .where(eq(libraryMedia.schoolId, schoolId))
    .orderBy(desc(libraryMedia.createdAt));

  const items = await query;
  if (!search) return items;

  const s = search.toLowerCase();
  return items.filter(
    (item: any) =>
      item.name?.toLowerCase().includes(s) ||
      item.author?.toLowerCase().includes(s) ||
      item.barcode?.toLowerCase().includes(s) ||
      item.isbn?.toLowerCase().includes(s)
  );
};

export const issueBook = async (
  db: any,
  rawDb: D1Database,
  params: IssueBookParams
) => {
  const maxLoans = params.maxActiveLoans ?? 3;

  // 1. Check active loan limit for student
  const activeLoans = await db
    .select()
    .from(libraryIssues)
    .where(
      and(
        eq(libraryIssues.studentId, params.studentId),
        eq(libraryIssues.status, 'issued')
      )
    );

  if (activeLoans.length >= maxLoans) {
    throw new Error(`Student has reached maximum active loan limit of ${maxLoans} books.`);
  }

  // 2. Check media availability
  const mediaRows = await db
    .select()
    .from(libraryMedia)
    .where(eq(libraryMedia.id, params.mediaId));

  const media = mediaRows[0];
  if (!media) throw new Error('Library media not found');
  if (media.status !== 'available') {
    throw new Error(`Book is currently ${media.status} and not available for checkout.`);
  }

  // Calculate dates
  const issueDateStr = params.issueDate || new Date().toISOString().split('T')[0];
  let dueDateStr = params.dueDate;
  if (!dueDateStr) {
    const days = params.dueDays ?? 14;
    const due = new Date(issueDateStr);
    due.setDate(due.getDate() + days);
    dueDateStr = due.toISOString().split('T')[0];
  }

  const issueId = generateId('iss');
  const now = new Date();

  // Create issue record
  const issueData = {
    id: issueId,
    schoolId: params.schoolId,
    mediaId: params.mediaId,
    studentId: params.studentId,
    issueDate: issueDateStr,
    dueDate: dueDateStr,
    returnDate: null,
    condition: 'good' as const,
    status: 'issued' as const,
    fineAmount: 0,
    fineInvoiceId: null,
    notes: params.notes || null,
    createdAt: now,
    updatedAt: now
  };

  // Resolve stock locations: internal (library) -> customer (student)
  const locs = await db.select().from(stockLocations).where(eq(stockLocations.schoolId, params.schoolId));
  const libraryLoc = locs.find((l: any) => l.usage === 'internal') || locs[0];
  const studentLoc = locs.find((l: any) => l.usage === 'customer') || locs[1] || locs[0];

  const pickingId = generateId('pick');
  const moveId = generateId('sm');

  const statements: any[] = [
    db.insert(libraryIssues).values(issueData),
    db.update(libraryMedia).set({ status: 'issued', updatedAt: now }).where(eq(libraryMedia.id, params.mediaId))
  ];

  if (libraryLoc && studentLoc) {
    statements.push(
      db.insert(stockPickings).values({
        id: pickingId,
        schoolId: params.schoolId,
        name: `LIB/OUT/${Date.now().toString().slice(-4)}`,
        pickingType: 'outgoing',
        origin: `Issue ${issueId}`,
        state: 'done',
        scheduledDate: issueDateStr,
        createdAt: now,
        updatedAt: now
      }),
      db.insert(stockMoves).values({
        id: moveId,
        pickingId: pickingId,
        productId: media.productId,
        locationId: libraryLoc.id,
        locationDestId: studentLoc.id,
        productQty: 1,
        state: 'done',
        createdAt: now
      })
    );
  }

  await rawDb.batch(statements as [any, ...any[]]);
  return issueData;
};

export const returnBook = async (
  db: any,
  rawDb: D1Database,
  params: ReturnBookParams
) => {
  const issueRows = await db
    .select()
    .from(libraryIssues)
    .where(eq(libraryIssues.id, params.issueId));

  const issue = issueRows[0];
  if (!issue) throw new Error('Library issue record not found');
  if (issue.status !== 'issued') {
    throw new Error(`Book is already ${issue.status}`);
  }

  const mediaRows = await db
    .select()
    .from(libraryMedia)
    .where(eq(libraryMedia.id, issue.mediaId));
  const media = mediaRows[0];

  const returnDateStr = params.returnDate || new Date().toISOString().split('T')[0];
  const condition = params.condition || 'good';
  const now = new Date();

  // Calculate overdue fine if returned after dueDate
  const due = new Date(issue.dueDate);
  const actualReturn = new Date(returnDateStr);
  const diffTime = actualReturn.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dailyRate = params.dailyFineRate ?? 2000;
  let fineAmount = 0;

  if (diffDays > 0) {
    fineAmount += diffDays * dailyRate;
  }
  if (condition === 'damaged' && params.damageCharge) {
    fineAmount += params.damageCharge;
  }

  let fineInvoiceId: string | null = null;
  const statements: any[] = [];

  // Generate fine invoice if fineAmount > 0
  if (fineAmount > 0) {
    fineInvoiceId = generateId('inv');

    // Resolve COA & Journal
    const jrnList = await db.select().from(journals).where(eq(journals.schoolId, params.schoolId));
    const saleJournal = jrnList.find((j: any) => j.type === 'sale') || jrnList[0];
    const journalId = saleJournal ? saleJournal.id : 'jrn_sale';

    const coaList = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.schoolId, params.schoolId));
    const recAcc = coaList.find((a: any) => a.accountType === 'asset' && a.code.startsWith('112')) || coaList[0];
    const incAcc = coaList.find((a: any) => a.accountType === 'income' && a.code.startsWith('41')) || coaList[1] || coaList[0];

    const move = {
      id: fineInvoiceId,
      schoolId: params.schoolId,
      journalId: journalId,
      studentId: issue.studentId,
      name: `FINE/${now.getFullYear()}/${Date.now().toString().slice(-4)}`,
      date: returnDateStr,
      moveType: 'out_invoice' as const,
      amountTotal: fineAmount,
      amountResidual: fineAmount,
      state: 'posted' as const,
      paymentState: 'not_paid' as const,
      invoiceDueDate: returnDateStr,
      createdAt: now,
      updatedAt: now
    };

    const lineDebit = {
      id: generateId('aml_deb'),
      moveId: fineInvoiceId,
      accountId: recAcc?.id || 'coa_ar',
      studentId: issue.studentId,
      name: `Denda Perpustakaan (Sirkulasi #${issue.id})`,
      debit: fineAmount,
      credit: 0,
      reconciled: false,
      createdAt: now
    };

    const lineCredit = {
      id: generateId('aml_crd'),
      moveId: fineInvoiceId,
      accountId: incAcc?.id || 'coa_rev_other',
      studentId: issue.studentId,
      name: `Pendapatan Denda Perpustakaan`,
      debit: 0,
      credit: fineAmount,
      reconciled: false,
      createdAt: now
    };

    statements.push(
      db.insert(accountMoves).values(move),
      db.insert(accountMoveLines).values(lineDebit),
      db.insert(accountMoveLines).values(lineCredit)
    );
  }

  // Stock return move: student -> library (unless lost)
  const locs = await db.select().from(stockLocations).where(eq(stockLocations.schoolId, params.schoolId));
  const libraryLoc = locs.find((l: any) => l.usage === 'internal') || locs[0];
  const studentLoc = locs.find((l: any) => l.usage === 'customer') || locs[1] || locs[0];
  const newMediaStatus = condition === 'lost' ? 'lost' : condition === 'damaged' ? 'maintenance' : 'available';

  if (media && libraryLoc && studentLoc && condition !== 'lost') {
    const pickingId = generateId('pick');
    const moveId = generateId('sm');
    statements.push(
      db.insert(stockPickings).values({
        id: pickingId,
        schoolId: params.schoolId,
        name: `LIB/IN/${Date.now().toString().slice(-4)}`,
        pickingType: 'incoming',
        origin: `Return ${issue.id}`,
        state: 'done',
        scheduledDate: returnDateStr,
        createdAt: now,
        updatedAt: now
      }),
      db.insert(stockMoves).values({
        id: moveId,
        pickingId: pickingId,
        productId: media.productId,
        locationId: studentLoc.id,
        locationDestId: libraryLoc.id,
        productQty: 1,
        state: 'done',
        createdAt: now
      })
    );
  }

  statements.push(
    db.update(libraryIssues).set({
      returnDate: returnDateStr,
      condition: condition,
      status: condition === 'lost' ? 'lost' : 'returned',
      fineAmount: fineAmount,
      fineInvoiceId: fineInvoiceId,
      notes: params.notes ?? issue.notes,
      updatedAt: now
    }).where(eq(libraryIssues.id, params.issueId)),
    db.update(libraryMedia).set({
      status: newMediaStatus,
      updatedAt: now
    }).where(eq(libraryMedia.id, issue.mediaId))
  );

  await rawDb.batch(statements as [any, ...any[]]);

  return {
    issueId: params.issueId,
    status: condition === 'lost' ? 'lost' : 'returned',
    returnDate: returnDateStr,
    fineAmount,
    fineInvoiceId
  };
};

export const markLostBook = async (
  db: any,
  rawDb: D1Database,
  params: MarkLostBookParams
) => {
  const issueRows = await db
    .select()
    .from(libraryIssues)
    .where(eq(libraryIssues.id, params.issueId));

  const issue = issueRows[0];
  if (!issue) throw new Error('Library issue record not found');

  const mediaRows = await db
    .select({
      id: libraryMedia.id,
      productId: libraryMedia.productId,
      standardPrice: products.standardPrice,
      listPrice: products.listPrice
    })
    .from(libraryMedia)
    .innerJoin(products, eq(libraryMedia.productId, products.id))
    .where(eq(libraryMedia.id, issue.mediaId));
  const media = mediaRows[0];

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const replacementCost = params.replacementCost ?? (media?.listPrice || media?.standardPrice || 100000);

  const jrnList = await db.select().from(journals).where(eq(journals.schoolId, params.schoolId));
  const saleJournal = jrnList.find((j: any) => j.type === 'sale') || jrnList[0];
  const journalId = saleJournal ? saleJournal.id : 'jrn_sale';

  const coaList = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.schoolId, params.schoolId));
  const recAcc = coaList.find((a: any) => a.accountType === 'asset' && a.code.startsWith('112')) || coaList[0];
  const incAcc = coaList.find((a: any) => a.accountType === 'income' && a.code.startsWith('41')) || coaList[1] || coaList[0];

  const fineInvoiceId = generateId('inv');

  const move = {
    id: fineInvoiceId,
    schoolId: params.schoolId,
    journalId: journalId,
    studentId: issue.studentId,
    name: `LOST/${now.getFullYear()}/${Date.now().toString().slice(-4)}`,
    date: dateStr,
    moveType: 'out_invoice' as const,
    amountTotal: replacementCost,
    amountResidual: replacementCost,
    state: 'posted' as const,
    paymentState: 'not_paid' as const,
    invoiceDueDate: dateStr,
    createdAt: now,
    updatedAt: now
  };

  const lineDebit = {
    id: generateId('aml_deb'),
    moveId: fineInvoiceId,
    accountId: recAcc?.id || 'coa_ar',
    studentId: issue.studentId,
    name: `Ganti Rugi Buku Hilang (Sirkulasi #${issue.id})`,
    debit: replacementCost,
    credit: 0,
    reconciled: false,
    createdAt: now
  };

  const lineCredit = {
    id: generateId('aml_crd'),
    moveId: fineInvoiceId,
    accountId: incAcc?.id || 'coa_rev_other',
    studentId: issue.studentId,
    name: `Pendapatan Ganti Rugi Buku Hilang`,
    debit: 0,
    credit: replacementCost,
    reconciled: false,
    createdAt: now
  };

  // Stock inventory loss move: customer/student -> inventory loss location
  const locs = await db.select().from(stockLocations).where(eq(stockLocations.schoolId, params.schoolId));
  const studentLoc = locs.find((l: any) => l.usage === 'customer') || locs[0];
  const lossLoc = locs.find((l: any) => l.usage === 'inventory') || studentLoc;

  const pickingId = generateId('pick');
  const moveId = generateId('sm');

  const statements: any[] = [
    db.insert(accountMoves).values(move),
    db.insert(accountMoveLines).values(lineDebit),
    db.insert(accountMoveLines).values(lineCredit),
    db.update(libraryIssues).set({
      status: 'lost',
      condition: 'lost',
      returnDate: dateStr,
      fineAmount: replacementCost,
      fineInvoiceId: fineInvoiceId,
      notes: params.notes ?? issue.notes,
      updatedAt: now
    }).where(eq(libraryIssues.id, params.issueId)),
    db.update(libraryMedia).set({
      status: 'lost',
      updatedAt: now
    }).where(eq(libraryMedia.id, issue.mediaId))
  ];

  if (media && studentLoc && lossLoc) {
    statements.push(
      db.insert(stockPickings).values({
        id: pickingId,
        schoolId: params.schoolId,
        name: `LIB/SCRAP/${Date.now().toString().slice(-4)}`,
        pickingType: 'outgoing',
        origin: `Lost Book ${issue.id}`,
        state: 'done',
        scheduledDate: dateStr,
        createdAt: now,
        updatedAt: now
      }),
      db.insert(stockMoves).values({
        id: moveId,
        pickingId: pickingId,
        productId: media.productId,
        locationId: studentLoc.id,
        locationDestId: lossLoc.id,
        productQty: 1,
        state: 'done',
        createdAt: now
      })
    );
  }

  await rawDb.batch(statements as [any, ...any[]]);

  return {
    issueId: params.issueId,
    status: 'lost',
    fineAmount: replacementCost,
    fineInvoiceId
  };
};

export const listLibraryIssues = async (
  db: any,
  schoolId: string,
  filter?: { status?: string; studentId?: string }
) => {
  const query = db
    .select({
      id: libraryIssues.id,
      schoolId: libraryIssues.schoolId,
      mediaId: libraryIssues.mediaId,
      studentId: libraryIssues.studentId,
      studentName: students.name,
      studentNis: students.nis,
      mediaName: products.name,
      mediaBarcode: libraryMedia.barcode,
      mediaAuthor: libraryMedia.author,
      issueDate: libraryIssues.issueDate,
      dueDate: libraryIssues.dueDate,
      returnDate: libraryIssues.returnDate,
      condition: libraryIssues.condition,
      status: libraryIssues.status,
      fineAmount: libraryIssues.fineAmount,
      fineInvoiceId: libraryIssues.fineInvoiceId,
      notes: libraryIssues.notes,
      createdAt: libraryIssues.createdAt
    })
    .from(libraryIssues)
    .innerJoin(libraryMedia, eq(libraryIssues.mediaId, libraryMedia.id))
    .innerJoin(products, eq(libraryMedia.productId, products.id))
    .innerJoin(students, eq(libraryIssues.studentId, students.id))
    .where(eq(libraryIssues.schoolId, schoolId))
    .orderBy(desc(libraryIssues.createdAt));

  const items = await query;
  if (!filter) return items;

  return items.filter((item: any) => {
    if (filter.status && item.status !== filter.status) return false;
    if (filter.studentId && item.studentId !== filter.studentId) return false;
    return true;
  });
};
