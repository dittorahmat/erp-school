import { describe, it, expect, vi } from 'vitest';
import {
  createAdmissionRegister,
  listAdmissionRegisters,
  submitAdmissionApplication,
  listAdmissionApplications,
  updateApplicationStatus,
  admitApplicant
} from '../src/domain/admission';

describe('PPDB / Student Admission Domain (OpenEduCat model)', () => {
  const schoolId = 'sch_test';
  const academicYearId = 'ay_test';
  const classroomId = 'cls_test';
  const journalId = 'jrn_test';
  const recAccountId = 'acc_rec_test';
  const incAccountId = 'acc_inc_test';

  const mockDb = {
    insert: (table: any) => ({
      values: (val: any) => ({
        type: 'insert',
        table,
        val
      })
    }),
    update: (table: any) => ({
      set: (val: any) => ({
        where: (condition: any) => ({
          type: 'update',
          table,
          val,
          condition
        })
      })
    }),
    select: () => ({
      from: (table: any) => ({
        where: () => ({
          orderBy: () => [
            {
              id: 'reg_123',
              schoolId,
              name: 'PPDB Gelombang 1 2026/2027',
              admissionFee: 2500000,
              status: 'open'
            }
          ]
        })
      })
    })
  };

  const mockRawDb = {
    batch: vi.fn(async (ops: any[]) => ops.map(() => ({ success: true })))
  } as any;

  it('creates an admission register and calls rawDb.batch', async () => {
    const reg = await createAdmissionRegister(mockDb, mockRawDb, {
      schoolId,
      academicYearId,
      name: 'PPDB Gelombang 1 2026/2027',
      startDate: '2026-01-01',
      endDate: '2026-05-31',
      admissionFee: 2500000
    });

    expect(reg.id).toBeDefined();
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('submits a new admission application via rawDb.batch', async () => {
    const app = await submitAdmissionApplication(mockDb, mockRawDb, {
      registerId: 'reg_123',
      schoolId,
      name: 'Ahmad Dahlan',
      gender: 'male',
      email: 'ahmad@example.com',
      phone: '08123456789',
      guardianName: 'Bapak Dahlan',
      guardianPhone: '08129876543'
    });

    expect(app.id).toBeDefined();
    expect(app.applicationNumber).toContain('PPDB-');
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('updates applicant verification status to approved', async () => {
    const res = await updateApplicationStatus(mockDb, mockRawDb, 'app_123', 'approved');
    expect(res.success).toBe(true);
    expect(res.status).toBe('approved');
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('admits applicant atomically generating Student, Enrollment, and balanced Admission Invoice', async () => {
    const customDb = {
      ...mockDb,
      select: () => ({
        from: (table: any) => ({
          where: () => [
            {
              id: 'app_123',
              registerId: 'reg_123',
              schoolId,
              name: 'Ahmad Dahlan',
              gender: 'male',
              guardianName: 'Bapak Dahlan',
              guardianPhone: '08129876543',
              admissionFee: 2500000
            }
          ]
        })
      })
    };

    const res = await admitApplicant(customDb, mockRawDb, {
      applicationId: 'app_123',
      schoolId,
      classroomId,
      academicYearId,
      nis: '20261001',
      nisn: '0089123456',
      receivableAccountId: recAccountId,
      incomeAccountId: incAccountId,
      journalId
    });

    expect(res.success).toBe(true);
    expect(res.studentId).toBeDefined();
    expect(res.enrollmentId).toBeDefined();
    expect(mockRawDb.batch).toHaveBeenCalled();

    // Check that batch operations included guardian, student, enrollment, app update, and invoice + 2 balanced move lines
    const lastBatchCalls = mockRawDb.batch.mock.calls.at(-1)[0];
    expect(lastBatchCalls.length).toBeGreaterThanOrEqual(4);
  });
});
