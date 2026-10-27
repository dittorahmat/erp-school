import { describe, it, expect, vi } from 'vitest';
import {
  catalogMedia,
  listLibraryMedia,
  issueBook,
  returnBook,
  markLostBook,
  listLibraryIssues
} from "../src/domain";

describe('Library Catalog & Circulation Domain (OpenEduCat / Odoo model)', () => {
  const schoolId = 'sch_01';
  const studentId = 'std_01';

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
    select: (fields?: any) => ({
      from: (table: any) => ({
        innerJoin: (joinTable: any, condition: any) => ({
          innerJoin: (joinTable2: any, condition2: any) => ({
            where: () => [],
            orderBy: () => []
          }),
          where: () => [
            {
              id: 'med_01',
              schoolId,
              productId: 'prod_01',
              name: 'Laskar Pelangi',
              code: 'BK-LP01',
              isbn: '978-979-3062-79-2',
              author: 'Andrea Hirata',
              barcode: 'LIB-LP-001',
              status: 'available',
              standardPrice: 65000,
              listPrice: 75000
            }
          ],
          orderBy: () => []
        }),
        where: (condition: any) => {
          // If querying libraryMedia by id
          return [
            {
              id: 'med_01',
              schoolId,
              productId: 'prod_01',
              barcode: 'LIB-LP-001',
              status: 'available'
            }
          ];
        },
        orderBy: () => []
      })
    })
  };

  const mockRawDb = {
    batch: vi.fn(async (ops: any[]) => ops.map(() => ({ success: true })))
  } as any;

  it('catalogs new media linking product and library media via batch', async () => {
    const res = await catalogMedia(mockDb as any, mockRawDb, {
      schoolId,
      name: 'Laskar Pelangi',
      code: 'BK-LP01',
      author: 'Andrea Hirata',
      isbn: '978-979-3062-79-2',
      barcode: 'LIB-LP-001',
      shelfLocation: 'Rak Sastra A-01',
      listPrice: 75000
    });

    expect(res.name).toBe('Laskar Pelangi');
    expect(res.barcode).toBe('LIB-LP-001');
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('enforces active loan limit on book checkout', async () => {
    const loanDb = {
      ...mockDb,
      select: () => ({
        from: (table: any) => ({
          where: () => [
            { id: 'iss_1', status: 'issued' },
            { id: 'iss_2', status: 'issued' },
            { id: 'iss_3', status: 'issued' }
          ]
        })
      })
    };

    await expect(
      issueBook(loanDb as any, mockRawDb, {
        schoolId,
        mediaId: 'med_01',
        studentId,
        maxActiveLoans: 3
      })
    ).rejects.toThrow(/maximum active loan limit/i);
  });

  it('issues book with calculated due date and generates stock moves', async () => {
    const issueDb = {
      ...mockDb,
      select: () => ({
        from: (table: any) => ({
          where: (cond: any) => {
            // First call: activeLoans => empty
            // Second call: media => available
            // Third call: locations => internal & customer
            return [
              {
                id: 'med_01',
                productId: 'prod_01',
                status: 'available',
                usage: 'internal'
              },
              {
                id: 'loc_cust',
                usage: 'customer'
              }
            ];
          }
        })
      })
    };

    mockRawDb.batch.mockClear();
    const issue = await issueBook(issueDb as any, mockRawDb, {
      schoolId,
      mediaId: 'med_01',
      studentId,
      issueDate: '2026-10-01',
      dueDays: 14
    });

    expect(issue.status).toBe('issued');
    expect(issue.dueDate).toBe('2026-10-15');
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('calculates overdue fines upon return and batches fine invoice', async () => {
    const returnDb = {
      ...mockDb,
      select: () => ({
        from: (table: any) => ({
          where: () => [
            {
              id: 'iss_01',
              mediaId: 'med_01',
              studentId,
              dueDate: '2026-10-10',
              status: 'issued'
            },
            {
              id: 'med_01',
              productId: 'prod_01',
              status: 'issued'
            },
            { id: 'jrn_sale', type: 'sale' },
            { id: 'coa_ar', accountType: 'asset', code: '11200' },
            { id: 'coa_inc', accountType: 'income', code: '41100' },
            { id: 'loc_lib', usage: 'internal' },
            { id: 'loc_cust', usage: 'customer' }
          ]
        })
      })
    };

    mockRawDb.batch.mockClear();
    const res = await returnBook(returnDb as any, mockRawDb, {
      schoolId,
      issueId: 'iss_01',
      returnDate: '2026-10-15', // 5 days late
      dailyFineRate: 2000
    });

    expect(res.status).toBe('returned');
    expect(res.fineAmount).toBe(10000); // 5 * 2000
    expect(res.fineInvoiceId).toBeTruthy();
    expect(mockRawDb.batch).toHaveBeenCalled();
  });

  it('handles lost book by generating replacement cost invoice and scrap move', async () => {
    const lostDb = {
      ...mockDb,
      select: (fields?: any) => ({
        from: (table: any) => ({
          innerJoin: () => ({
            where: () => [
              {
                id: 'med_01',
                productId: 'prod_01',
                standardPrice: 75000,
                listPrice: 85000
              }
            ]
          }),
          where: () => [
            {
              id: 'iss_01',
              mediaId: 'med_01',
              studentId,
              status: 'issued'
            },
            { id: 'jrn_sale', type: 'sale' },
            { id: 'coa_ar', accountType: 'asset', code: '11200' },
            { id: 'coa_inc', accountType: 'income', code: '41100' },
            { id: 'loc_cust', usage: 'customer' },
            { id: 'loc_inv', usage: 'inventory' }
          ]
        })
      })
    };

    mockRawDb.batch.mockClear();
    const res = await markLostBook(lostDb as any, mockRawDb, {
      schoolId,
      issueId: 'iss_01',
      replacementCost: 85000
    });

    expect(res.status).toBe('lost');
    expect(res.fineAmount).toBe(85000);
    expect(res.fineInvoiceId).toBeTruthy();
    expect(mockRawDb.batch).toHaveBeenCalled();
  });
});
