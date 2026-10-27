import { describe, it, expect, vi } from 'vitest';
import {
  createFeeCategory,
  listFeeCategories,
  createFeeStructure,
  listFeeStructures,
  generateMonthlyFees
} from '../src/domain/fees';

describe('Fee Structure & Batch SPP Invoicing Domain (Odoo link)', () => {
  const schoolId = 'sch_test';
  const academicYearId = 'ay_test';
  const categoryId = 'feecat_test';

  const mockDb = {
    insert: (table: any) => ({
      values: (val: any) => ({
        type: 'insert',
        table,
        val
      })
    }),
    select: (fields?: any) => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            where: () => [
              { studentId: 'std_01', studentName: 'Budi Santoso', classroomId: 'cls_01' },
              { studentId: 'std_02', studentName: 'Siti Aminah', classroomId: 'cls_01' }
            ]
          })
        }),
        where: () => [
          {
            id: 'feestr_01',
            schoolId,
            name: 'SPP Bulanan Kelas 10',
            amount: 500000,
            receivableAccountId: 'acc_rec',
            incomeAccountId: 'acc_inc'
          }
        ],
        orderBy: () => []
      })
    })
  };

  const mockRawDb = {
    batch: vi.fn(async (ops: any[]) => ops.map(() => ({ success: true })))
  } as any;

  it('creates fee category and fee structure via rawDb.batch', async () => {
    const cat = await createFeeCategory(mockDb, mockRawDb, {
      schoolId,
      name: 'SPP Reguler',
      code: 'SPP-REG'
    });
    expect(cat.id).toBeDefined();

    const str = await createFeeStructure(mockDb, mockRawDb, {
      schoolId,
      academicYearId,
      categoryId,
      name: 'SPP Bulanan Kelas 10',
      code: 'SPP-10',
      amount: 500000
    });
    expect(str.id).toBeDefined();
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('generates monthly tuition fees for all active students in batch', async () => {
    const result = await generateMonthlyFees(mockDb, mockRawDb, {
      schoolId,
      academicYearId,
      month: '2026-10',
      feeStructureId: 'feestr_01'
    });

    expect(result.generatedCount).toBe(2);
    expect(result.totalAmount).toBe(1000000);
    expect(mockRawDb.batch).toHaveBeenCalled();

    // 2 students => 2 invoices + (2 * 2 lines) = 6 operations
    const lastBatchCalls = mockRawDb.batch.mock.calls.at(-1)[0];
    expect(lastBatchCalls.length).toBe(6);
  });
});
