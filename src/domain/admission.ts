import { eq, desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import {
  admissionRegisters,
  admissionApplications,
  students,
  guardians,
  enrollments,
  accountMoves,
  accountMoveLines,
  journals,
  chartOfAccounts,
  classrooms
} from '../db/schema';
import { generateId, compactDefined } from '../lib/utils';
import { resolveDefaultAccountsAndJournal } from './accounting';

export interface CreateAdmissionRegisterParams {
  schoolId: string;
  academicYearId: string;
  courseId?: string;
  name: string;
  startDate: string;
  endDate: string;
  maxApplications?: number;
  applicationFee?: number;
  admissionFee?: number;
}

export interface CreateAdmissionApplicationParams {
  registerId: string;
  schoolId: string;
  name: string;
  gender: string;
  birthDate?: string;
  birthPlace?: string;
  email: string;
  phone: string;
  address?: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation?: string;
  prevSchool?: string;
}

export interface AdmitApplicantParams {
  applicationId: string;
  schoolId: string;
  classroomId: string;
  academicYearId: string;
  nis: string;
  nisn: string;
  receivableAccountId?: string;
  incomeAccountId?: string;
  journalId?: string;
}

export const createAdmissionRegister = async (
  db: any,
  rawDb: D1Database | undefined,
  params: CreateAdmissionRegisterParams
) => {
  const registerId = generateId('reg');
  const now = new Date();
  const d1 = (rawDb || db) as D1Database;
  await d1.batch([
    db.insert(admissionRegisters).values({
      id: registerId,
      schoolId: params.schoolId,
      academicYearId: params.academicYearId,
      courseId: params.courseId ?? null,
      name: params.name,
      startDate: params.startDate,
      endDate: params.endDate,
      maxApplications: params.maxApplications ?? 100,
      applicationFee: params.applicationFee ?? 0,
      admissionFee: params.admissionFee ?? 0,
      status: 'open',
      createdAt: now,
      updatedAt: now
    })
  ]);
  return { id: registerId };
};

export const listAdmissionRegisters = async (db: any, schoolId: string) => {
  return db
    .select()
    .from(admissionRegisters)
    .where(eq(admissionRegisters.schoolId, schoolId))
    .orderBy(desc(admissionRegisters.createdAt));
};

export const submitAdmissionApplication = async (
  db: any,
  rawDb: D1Database | undefined,
  params: CreateAdmissionApplicationParams
) => {
  const appId = generateId('app');
  const appNumber = `PPDB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date();
  const d1 = (rawDb || db) as D1Database;

  await d1.batch([
    db.insert(admissionApplications).values({
      id: appId,
      registerId: params.registerId,
      schoolId: params.schoolId,
      applicationNumber: appNumber,
      name: params.name,
      gender: params.gender,
      birthDate: params.birthDate ?? null,
      birthPlace: params.birthPlace ?? null,
      email: params.email,
      phone: params.phone,
      address: params.address ?? null,
      guardianName: params.guardianName,
      guardianPhone: params.guardianPhone,
      guardianRelation: params.guardianRelation ?? 'parent',
      prevSchool: params.prevSchool ?? null,
      status: 'submitted',
      createdAt: now,
      updatedAt: now
    })
  ]);
  return { id: appId, applicationNumber: appNumber };
};

export const listAdmissionApplications = async (db: any, registerId: string) => {
  return db
    .select()
    .from(admissionApplications)
    .where(eq(admissionApplications.registerId, registerId))
    .orderBy(desc(admissionApplications.createdAt));
};

export const updateApplicationStatus = async (
  db: any,
  rawDb: D1Database | undefined,
  applicationId: string,
  status: 'verified' | 'approved' | 'rejected'
) => {
  const now = new Date();
  const d1 = (rawDb || db) as D1Database;
  await d1.batch([
    db.update(admissionApplications)
      .set({ status, updatedAt: now })
      .where(eq(admissionApplications.id, applicationId))
  ]);
  return { success: true, status };
};

export const admitApplicant = async (
  db: any,
  rawDb: D1Database | undefined,
  params: AdmitApplicantParams
) => {
  const d1 = (rawDb || db) as D1Database;
  // 1. Fetch application & register
  const [app] = await db
    .select()
    .from(admissionApplications)
    .where(eq(admissionApplications.id, params.applicationId));
  if (!app) throw new Error('Applicant not found');

  const [register] = await db
    .select()
    .from(admissionRegisters)
    .where(eq(admissionRegisters.id, app.registerId));
  if (!register) throw new Error('Admission register not found');

  const studentId = generateId('std');
  const guardianId = generateId('grd');
  const enrollmentId = generateId('enr');
  const now = new Date();

  const batchOperations: any[] = [
    // Create Guardian
    db.insert(guardians).values({
      id: guardianId,
      name: app.guardianName,
      phone: app.guardianPhone,
      relation: app.guardianRelation ?? 'parent',
      address: app.address ?? null,
      createdAt: now,
      updatedAt: now
    }),
    // Create Student
    db.insert(students).values({
      id: studentId,
      schoolId: params.schoolId,
      guardianId,
      nis: params.nis,
      nisn: params.nisn,
      name: app.name,
      gender: app.gender,
      birthDate: app.birthDate,
      birthPlace: app.birthPlace,
      address: app.address,
      status: 'active',
      createdAt: now,
      updatedAt: now
    }),
    // Create Enrollment
    db.insert(enrollments).values({
      id: enrollmentId,
      studentId,
      classroomId: params.classroomId,
      academicYearId: params.academicYearId,
      status: 'active',
      enrolledAt: now
    }),
    // Update Application to enrolled
    db.update(admissionApplications)
      .set({
        status: 'enrolled',
        enrolledStudentId: studentId,
        updatedAt: now
      })
      .where(eq(admissionApplications.id, params.applicationId))
  ];

  // If admission fee > 0, generate draft Student Invoice with balanced debit/credit
  if (register.admissionFee && register.admissionFee > 0) {
    const moveId = generateId('inv');
    const invoiceNumber = `INV/PPDB/${Date.now().toString().slice(-6)}`;
    const feeAmount = register.admissionFee;

    const { recAccountId: recAccId, incAccountId: incAccId, journalId: jrnId } =
      await resolveDefaultAccountsAndJournal(db, params.schoolId, {
        receivableAccountId: params.receivableAccountId,
        incomeAccountId: params.incomeAccountId,
        journalId: params.journalId
      });

    if (recAccId && incAccId && jrnId) {
      batchOperations.push(
        db.insert(accountMoves).values({
          id: moveId,
          schoolId: params.schoolId,
          journalId: jrnId,
          studentId,
          name: invoiceNumber,
          date: new Date().toISOString().slice(0, 10),
          moveType: 'out_invoice',
          amountTotal: feeAmount,
          amountResidual: feeAmount,
          state: 'draft',
          paymentState: 'not_paid',
          createdAt: now,
          updatedAt: now
        }),
        // Debit: Piutang Siswa
        db.insert(accountMoveLines).values({
          id: generateId('line'),
          moveId,
          accountId: recAccId,
          studentId,
          name: `Biaya Masuk PPDB - ${app.name}`,
          debit: feeAmount,
          credit: 0,
          createdAt: now
        }),
        // Credit: Pendapatan Uang Pangkal
        db.insert(accountMoveLines).values({
          id: generateId('line'),
          moveId,
          accountId: incAccId,
          studentId,
          name: `Pendapatan PPDB - ${register.name}`,
          debit: 0,
          credit: feeAmount,
          createdAt: now
        })
      );
    }
  }

  // Atomically commit in single D1 batch
  await d1.batch(batchOperations);

  return {
    success: true,
    studentId,
    guardianId,
    enrollmentId
  };
};
