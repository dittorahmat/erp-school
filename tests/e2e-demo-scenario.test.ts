import { describe, it, expect } from "vitest";
import app from "../src/index";
import { createMockD1Database } from "./helpers/d1-mock";

/**
 * End-to-End Automated Test Suite based on docs/demo-scenario.md
 * Persona Journey:
 * ACT 1: Administrator (Master Structure, Students, Inventory & Assets)
 * ACT 2: Guru / Pengajar (Timetables, Daily Attendance Session & Exam Gradebook Entry)
 * ACT 3: Keuangan TU (Audit Invoices, Payment Settlement & Double-Entry Trial Balance Verification)
 * ACT 4: Siswa & Wali Murid (Report Card Generation, Attendance Check & Balance Verification)
 */
describe("E2E Demo Scenario Journey (docs/demo-scenario.md)", () => {
  // ACT 1: Administrator
  describe("ACT 1: Administrator - Master Data & Inventaris", () => {
    it("Step 1 & 2: Verifikasi Tahun Ajaran Aktif dan Kurikulum Akademik", async () => {
      const mockAcademicYears = [
        ["ay_2025_2026", "school_sma_hb", "2025/2026", "AY-2526", "2025-07-15", "2026-06-25", "active", 1761476400, 1761476400]
      ];
      const mockSubjects = [
        ["sbj_mat", "school_sma_hb", "Matematika Wajib", "MAT-10", "compulsory", 100, 1761476400, 1761476400],
        ["sbj_fis", "school_sma_hb", "Fisika Dasar", "FIS-10", "compulsory", 100, 1761476400, 1761476400]
      ];

      const mockDbYears = createMockD1Database(mockAcademicYears);
      const resYears = await app.request("/api/academic/years", {}, { DB: mockDbYears } as any);
      expect(resYears.status).toBe(200);
      const dataYears = (await resYears.json()) as any;
      expect(dataYears.data).toHaveLength(1);
      expect(dataYears.data[0].name).toBe("2025/2026");
      expect(dataYears.data[0].status).toBe("active");

      const mockDbSubjects = createMockD1Database(mockSubjects);
      const resSubjects = await app.request("/api/academic/subjects", {}, { DB: mockDbSubjects } as any);
      expect(resSubjects.status).toBe(200);
      const dataSubjects = (await resSubjects.json()) as any;
      expect(dataSubjects.data).toHaveLength(2);
      expect(dataSubjects.data.map((s: any) => s.name)).toContain("Matematika Wajib");
    });

    it("Step 2: Verifikasi Data Siswa Terdaftar (Andi Pratama & Bella Cantika)", async () => {
      const mockStudents = [
        ["std_andi", "school_sma_hb", "usr_student_andi", "grd_joko", "202501001", "0089123456", "Andi Pratama", "male", "2009-04-12", "Jakarta", "Jl. Tebet Timur Raya No. 12, Jakarta", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100", null, "active", 1761476400, 1761476400],
        ["std_bella", "school_sma_hb", null, "grd_joko", "202501002", "0089123457", "Bella Cantika", "female", "2009-08-20", "Bandung", "Jl. Rasuna Said No. 5, Jakarta", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", null, "active", 1761476400, 1761476400]
      ];

      const mockDb = createMockD1Database(mockStudents);
      const res = await app.request("/api/students", {}, { DB: mockDb } as any);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data).toHaveLength(2);
      expect(body.data[0].name).toBe("Andi Pratama");
      expect(body.data[1].name).toBe("Bella Cantika");
    });

    it("Step 3: Audit Inventaris & Aset Sekolah (Laptop Asus ExpertBook & Stock Picking)", async () => {
      const mockProducts = [
        ["prd_laptop", "school_sma_hb", "Laptop Laboratorium Asus ExpertBook i5", "AST-LAB-01", "asset", "unit", 11500000, 10500000, "SN-ASUS-2026-8819", 1761476400, 1761476400]
      ];
      const mockPickings = [
        ["pick_rec_001", "school_sma_hb", "WH/IN/0001", "incoming", "PO/2026/08/001", "done", "2026-08-10", 1761476400, 1761476400]
      ];

      const mockDbProducts = createMockD1Database(mockProducts);
      const resProducts = await app.request("/api/inventory/products", {}, { DB: mockDbProducts } as any);
      expect(resProducts.status).toBe(200);
      const dataProducts = (await resProducts.json()) as any;
      expect(dataProducts.data[0].serialNumber).toBe("SN-ASUS-2026-8819");
      expect(dataProducts.data[0].type).toBe("asset");

      const mockDbPickings = createMockD1Database(mockPickings);
      const resPickings = await app.request("/api/inventory/pickings", {}, { DB: mockDbPickings } as any);
      expect(resPickings.status).toBe(200);
      const dataPickings = (await resPickings.json()) as any;
      expect(dataPickings.data[0].name).toBe("WH/IN/0001");
      expect(dataPickings.data[0].state).toBe("done");
    });
  });

  // ACT 2: Guru / Pengajar (Budi Santoso, S.Pd)
  describe("ACT 2: Guru / Pengajar - Kegiatan Akademik Harian", () => {
    it("Step 2: Memeriksa Jadwal Pelajaran Mengajar (Senin 07:30 - 09:00)", async () => {
      const mockTimetables = [
        ["tt_mon_mat", "school_sma_hb", "cls_x_ipa_1", "sbj_mat", "fac_budi", "monday", "07:30", "09:00", 1761476400, 1761476400]
      ];
      const mockDb = createMockD1Database(mockTimetables);
      const res = await app.request("/api/attendance/timetables", {}, { DB: mockDb } as any);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.data).toHaveLength(1);
      expect(data.data[0].dayOfWeek).toBe("monday");
      expect(data.data[0].startTime).toBe("07:30");
      expect(data.data[0].endTime).toBe("09:00");
    });

    it("Step 3: Membuat & Menyimpan Sesi Presensi Kelas Baru Secara Atomik", async () => {
      let batchedStatements: any[] = [];
      const mockDb = {
        prepare: () => ({
          bind: () => ({
            run: async () => ({ success: true })
          })
        }),
        batch: async (statements: any[]) => {
          batchedStatements = statements;
          return statements.map(() => ({ results: [], success: true }));
        }
      };

      const payload = {
        schoolId: "school_sma_hb",
        classroomId: "cls_x_ipa_1",
        facultyId: "fac_budi",
        timetableId: "tt_mon_mat",
        date: "2026-10-27",
        lines: [
          { studentId: "std_andi", status: "present", remark: "Hadir tepat waktu" },
          { studentId: "std_bella", status: "present", remark: "Hadir tepat waktu" }
        ]
      };

      const res = await app.request(
        "/api/attendance/sheets",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        },
        { DB: mockDb } as any
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.totalPresent).toBe(2);
      expect(body.data.totalAbsent).toBe(0);
      // Batch harus terdiri dari 1 sheet + 1 multi-values attendance lines statement
      expect(batchedStatements).toHaveLength(2);
    });

    it("Step 4: Input Nilai Ujian (Gradebook Entry) UTS Matematika", async () => {
      const mockDb = createMockD1Database();
      const payloadMark = {
        sessionId: "exam_uts_mat",
        studentId: "std_andi",
        marksObtained: 92,
        grade: "A",
        remark: "Sangat memuaskan dalam aljabar"
      };

      const res = await app.request(
        "/api/exams/marks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadMark)
        },
        { DB: mockDb } as any
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.marksObtained).toBe(92);
      expect(body.data.grade).toBe("A");
    });
  });

  // ACT 3: Keuangan TU (Siti Rahmawati, S.E)
  describe("ACT 3: Keuangan TU - Double-Entry Accounting & Pembayaran", () => {
    it("Step 2: Audit Tagihan Siswa (Invoices) - Andi Paid, Bella Not Paid", async () => {
      const mockInvoices = [
        ["inv_andi_oct", "school_sma_hb", "jrn_sale", "std_andi", "INV/2026/10/0001", "2026-10-01", "out_invoice", 500000, 0, "posted", "paid", "2026-10-10", 1761476400, 1761476400],
        ["inv_bella_oct", "school_sma_hb", "jrn_sale", "std_bella", "INV/2026/10/0002", "2026-10-01", "out_invoice", 500000, 500000, "posted", "not_paid", "2026-10-10", 1761476400, 1761476400]
      ];

      const mockDb = createMockD1Database(mockInvoices);
      const res = await app.request("/api/finance/invoices", {}, { DB: mockDb } as any);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data).toHaveLength(2);
      expect(body.data[0].paymentState).toBe("paid");
      expect(body.data[0].amountResidual).toBe(0);
      expect(body.data[1].paymentState).toBe("not_paid");
      expect(body.data[1].amountResidual).toBe(500000);
    });

    it("Step 3: Catat Pembayaran Pelunasan Tagihan Bella Cantika", async () => {
      let batchedStatements: any[] = [];
      const mockInvoice = [
        "inv_bella_oct", "school_sma_hb", "jrn_sale", "std_bella", "INV/2026/10/0002", "2026-10-01", "out_invoice", 500000, 500000, "posted", "not_paid", "2026-10-10", 1761476400, 1761476400
      ];

      const mockDb = {
        prepare: () => ({
          bind: () => ({
            first: async () => mockInvoice,
            raw: async () => [mockInvoice],
            run: async () => ({ success: true })
          })
        }),
        batch: async (statements: any[]) => {
          batchedStatements = statements;
          return statements.map(() => ({ results: [], success: true }));
        }
      };

      const paymentPayload = {
        schoolId: "school_sma_hb",
        journalId: "jrn_cash",
        moveId: "inv_bella_oct",
        studentId: "std_bella",
        name: "PAY/2026/10/0002",
        paymentDate: "2026-10-27",
        amount: 500000,
        paymentMethod: "cash",
        reference: "KASIR-002"
      };

      const res = await app.request(
        "/api/finance/payments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload)
        },
        { DB: mockDb } as any
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.amount).toBe(500000);
      // Batch includes: payment insert + invoice residual update
      expect(batchedStatements).toHaveLength(2);
    });

    it("Step 4: Verifikasi Trial Balance (Neraca Saldo) Berimbang: Total Debit === Total Credit", async () => {
      const mockMoveLines = [
        ["aml_andi_deb", "inv_andi_oct", "coa_ar", "std_andi", "SPP Oktober 2026 - Andi Pratama", 500000, 0, 1, 1761476400],
        ["aml_andi_crd", "inv_andi_oct", "coa_rev_spp", "std_andi", "Pendapatan SPP Oktober 2026", 0, 500000, 0, 1761476400],
        ["aml_bella_deb", "inv_bella_oct", "coa_ar", "std_bella", "SPP Oktober 2026 - Bella Cantika", 500000, 0, 0, 1761476400],
        ["aml_bella_crd", "inv_bella_oct", "coa_rev_spp", "std_bella", "Pendapatan SPP Oktober 2026", 0, 500000, 0, 1761476400]
      ];

      const mockDb = {
        prepare: () => ({
          bind: () => ({
            raw: async () => mockMoveLines
          })
        })
      };

      const res = await app.request("/api/finance/trial-balance", {}, { DB: mockDb } as any);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.isBalanced).toBe(true);
      expect(data.totalDebit).toBe(1000000);
      expect(data.totalCredit).toBe(1000000);
      expect(data.totalDebit).toEqual(data.totalCredit);
    });
  });

  // ACT 4: Siswa & Wali (Andi Pratama & Joko Pratama)
  describe("ACT 4: Siswa & Wali Murid - Rapor Digital & Status Administrasi", () => {
    it("Step 2: Buka Rapor Digital Otomatis Siswa Andi Pratama (Rata-rata 89.0)", async () => {
      const mockMarksRows = [
        ["mark_andi_mat", "exam_uts_mat", "std_andi", 92, "A", "Sangat memuaskan dalam aljabar", 1761476400, 1761476400],
        ["mark_andi_fis", "exam_uts_fis", "std_andi", 86, "B", "Memahami konsep kinematika dengan baik", 1761476400, 1761476400]
      ];

      const mockDb = {
        prepare: () => ({
          bind: () => ({
            raw: async () => mockMarksRows
          })
        })
      };

      const res = await app.request("/api/exams/report-card/std_andi", {}, { DB: mockDb } as any);
      expect(res.status).toBe(200);
      const report = (await res.json()) as any;
      expect(report.studentId).toBe("std_andi");
      expect(report.grades).toHaveLength(2);
      expect(report.summary.totalSubjects).toBe(2);
      expect(report.summary.averageScore).toBe("89.0");
    });

    it("Step 3: Cek Status Tagihan & Riwayat Pembayaran Andi (Sudah Lunas)", async () => {
      const mockInvoices = [
        ["inv_andi_oct", "school_sma_hb", "jrn_sale", "std_andi", "INV/2026/10/0001", "2026-10-01", "out_invoice", 500000, 0, "posted", "paid", "2026-10-10", 1761476400, 1761476400]
      ];

      const mockDb = createMockD1Database(mockInvoices);
      const res = await app.request("/api/finance/invoices", {}, { DB: mockDb } as any);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      const andiInvoice = body.data.find((inv: any) => inv.studentId === "std_andi");
      expect(andiInvoice).toBeDefined();
      expect(andiInvoice.paymentState).toBe("paid");
      expect(andiInvoice.amountResidual).toBe(0);
    });
  });
});
