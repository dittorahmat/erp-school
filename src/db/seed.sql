-- ============================================================================
-- ERP Sekolah Demo Data Seeder (SMA Harapan Bangsa)
-- ============================================================================

-- 1. School Institution
INSERT OR REPLACE INTO schools (id, name, code, address, phone, email, website, created_at, updated_at)
VALUES (
  'school_sma_hb',
  'SMA Harapan Bangsa',
  'SMA-HB',
  'Jl. Pendidikan No. 45, Jakarta Selatan',
  '+62 21 7891234',
  'info@smaharapanbangsa.sch.id',
  'https://smaharapanbangsa.sch.id',
  1761476400,
  1761476400
);

-- 2. Users & Better-Auth Roles
-- Default password for all demo accounts: 'DemoPass123!'
INSERT OR REPLACE INTO user (id, name, email, email_verified, image, role, school_id, created_at, updated_at)
VALUES 
  ('usr_admin', 'Bambang Sudarmono, M.Pd (Kepala Sekolah)', 'admin@sekolah.demo', 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 'superadmin', 'school_sma_hb', 1761476400, 1761476400),
  ('usr_finance', 'Siti Rahmawati, S.E (Bendahara TU)', 'finance@sekolah.demo', 1, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', 'accountant', 'school_sma_hb', 1761476400, 1761476400),
  ('usr_guru_budi', 'Budi Santoso, S.Pd (Guru Matematika)', 'guru.budi@sekolah.demo', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'teacher', 'school_sma_hb', 1761476400, 1761476400),
  ('usr_student_andi', 'Andi Pratama (Siswa X-IPA-1)', 'student.andi@sekolah.demo', 1, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', 'student', 'school_sma_hb', 1761476400, 1761476400),
  ('usr_ortu_andi', 'Joko Pratama (Wali Murid)', 'ortu.andi@sekolah.demo', 1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'guardian', 'school_sma_hb', 1761476400, 1761476400);

-- 3. Academic Structure
INSERT OR REPLACE INTO academic_years (id, school_id, name, code, start_date, end_date, status, created_at, updated_at)
VALUES ('ay_2025_2026', 'school_sma_hb', '2025/2026', 'AY-2526', '2025-07-15', '2026-06-25', 'active', 1761476400, 1761476400);

INSERT OR REPLACE INTO terms (id, academic_year_id, name, code, start_date, end_date, status, created_at, updated_at)
VALUES 
  ('term_sem1', 'ay_2025_2026', 'Semester Ganjil', 'SEM-1', '2025-07-15', '2025-12-20', 'active', 1761476400, 1761476400),
  ('term_sem2', 'ay_2025_2026', 'Semester Genap', 'SEM-2', '2026-01-06', '2026-06-25', 'draft', 1761476400, 1761476400);

INSERT OR REPLACE INTO grade_levels (id, school_id, name, sequence, created_at, updated_at)
VALUES 
  ('grd_10', 'school_sma_hb', 'Kelas 10 SMA', 10, 1761476400, 1761476400),
  ('grd_11', 'school_sma_hb', 'Kelas 11 SMA', 20, 1761476400, 1761476400),
  ('grd_12', 'school_sma_hb', 'Kelas 12 SMA', 30, 1761476400, 1761476400);

INSERT OR REPLACE INTO courses (id, school_id, name, code, evaluation_type, created_at, updated_at)
VALUES 
  ('crs_mipa', 'school_sma_hb', 'Matematika dan Ilmu Pengetahuan Alam', 'MIPA', 'normal', 1761476400, 1761476400),
  ('crs_ips', 'school_sma_hb', 'Ilmu Pengetahuan Sosial', 'IPS', 'normal', 1761476400, 1761476400);

INSERT OR REPLACE INTO subjects (id, school_id, name, code, type, weightage, created_at, updated_at)
VALUES 
  ('sbj_mat', 'school_sma_hb', 'Matematika Wajib', 'MAT-10', 'compulsory', 100, 1761476400, 1761476400),
  ('sbj_fis', 'school_sma_hb', 'Fisika Dasar', 'FIS-10', 'compulsory', 100, 1761476400, 1761476400),
  ('sbj_kim', 'school_sma_hb', 'Kimia Analitik', 'KIM-10', 'compulsory', 100, 1761476400, 1761476400),
  ('sbj_bio', 'school_sma_hb', 'Biologi Umum', 'BIO-10', 'compulsory', 100, 1761476400, 1761476400),
  ('sbj_eng', 'school_sma_hb', 'Bahasa Inggris Lanjutan', 'ENG-10', 'compulsory', 100, 1761476400, 1761476400);

-- 4. Faculties (Guru)
INSERT OR REPLACE INTO faculties (id, school_id, user_id, nip, name, gender, phone, email, avatar_url, department, created_at, updated_at)
VALUES 
  ('fac_budi', 'school_sma_hb', 'usr_guru_budi', '198205122008011002', 'Budi Santoso, S.Pd', 'male', '081234567890', 'guru.budi@sekolah.demo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Matematika', 1761476400, 1761476400),
  ('fac_dewi', 'school_sma_hb', NULL, '198709242011012005', 'Dewi Lestari, M.Si', 'female', '081298765432', 'dewi.lestari@sekolah.demo', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 'Fisika', 1761476400, 1761476400);

-- 5. Classrooms (Rombel)
INSERT OR REPLACE INTO classrooms (id, school_id, academic_year_id, grade_level_id, homeroom_teacher_id, name, code, capacity, created_at, updated_at)
VALUES 
  ('cls_x_ipa_1', 'school_sma_hb', 'ay_2025_2026', 'grd_10', 'fac_budi', 'X-MIPA-1', '10-MIPA-1', 35, 1761476400, 1761476400),
  ('cls_x_ipa_2', 'school_sma_hb', 'ay_2025_2026', 'grd_10', 'fac_dewi', 'X-MIPA-2', '10-MIPA-2', 35, 1761476400, 1761476400);

-- 6. Guardians & Students
INSERT OR REPLACE INTO guardians (id, user_id, name, relation, phone, email, occupation, address, created_at, updated_at)
VALUES ('grd_joko', 'usr_ortu_andi', 'Joko Pratama', 'father', '081399887766', 'ortu.andi@sekolah.demo', 'Wiraswasta', 'Jl. Tebet Timur Raya No. 12, Jakarta', 1761476400, 1761476400);

INSERT OR REPLACE INTO students (id, school_id, user_id, guardian_id, nis, nisn, name, gender, birth_date, birth_place, address, avatar_url, document_url, status, created_at, updated_at)
VALUES 
  ('std_andi', 'school_sma_hb', 'usr_student_andi', 'grd_joko', '202501001', '0089123456', 'Andi Pratama', 'male', '2009-04-12', 'Jakarta', 'Jl. Tebet Timur Raya No. 12, Jakarta', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_bella', 'school_sma_hb', NULL, 'grd_joko', '202501002', '0089123457', 'Bella Cantika', 'female', '2009-08-20', 'Bandung', 'Jl. Rasuna Said No. 5, Jakarta', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', NULL, 'active', 1761476400, 1761476400);

-- 7. Enrollment
INSERT OR REPLACE INTO enrollments (id, student_id, classroom_id, academic_year_id, roll_number, status, enrolled_at)
VALUES 
  ('enr_andi', 'std_andi', 'cls_x_ipa_1', 'ay_2025_2026', '01', 'active', 1761476400),
  ('enr_bella', 'std_bella', 'cls_x_ipa_1', 'ay_2025_2026', '02', 'active', 1761476400);

-- 8. Chart of Accounts (COA)
INSERT OR REPLACE INTO chart_of_accounts (id, school_id, code, name, type, reconcile, created_at)
VALUES 
  ('coa_kas', 'school_sma_hb', '1110', 'Kas Operasional Sekolah', 'asset', 1, 1761476400),
  ('coa_bank', 'school_sma_hb', '1120', 'Bank BCA Operasional', 'asset', 1, 1761476400),
  ('coa_ar', 'school_sma_hb', '1210', 'Piutang SPP & Biaya Siswa', 'asset', 1, 1761476400),
  ('coa_rev_spp', 'school_sma_hb', '4110', 'Pendapatan SPP Bulanan', 'income', 0, 1761476400),
  ('coa_rev_gedung', 'school_sma_hb', '4120', 'Pendapatan Uang Gedung/Pangkal', 'income', 0, 1761476400);

-- 9. Journals
INSERT OR REPLACE INTO journals (id, school_id, name, code, type, default_account_id, created_at)
VALUES 
  ('jrn_sale', 'school_sma_hb', 'Jurnal Tagihan Sekolah', 'INV', 'sale', 'coa_ar', 1761476400),
  ('jrn_cash', 'school_sma_hb', 'Kasir Sekolah', 'CSH', 'cash', 'coa_kas', 1761476400),
  ('jrn_bank', 'school_sma_hb', 'Rekening Bank BCA', 'BNK', 'bank', 'coa_bank', 1761476400);

-- 10. Invoices & Double-Entry Journal Lines
INSERT OR REPLACE INTO account_moves (id, school_id, journal_id, student_id, name, date, move_type, amount_total, amount_residual, state, payment_state, invoice_due_date, created_at, updated_at)
VALUES 
  ('inv_andi_oct', 'school_sma_hb', 'jrn_sale', 'std_andi', 'INV/2026/10/0001', '2026-10-01', 'out_invoice', 500000, 0, 'posted', 'paid', '2026-10-10', 1761476400, 1761476400),
  ('inv_bella_oct', 'school_sma_hb', 'jrn_sale', 'std_bella', 'INV/2026/10/0002', '2026-10-01', 'out_invoice', 500000, 500000, 'posted', 'not_paid', '2026-10-10', 1761476400, 1761476400);

INSERT OR REPLACE INTO account_move_lines (id, move_id, account_id, student_id, name, debit, credit, reconciled, created_at)
VALUES 
  ('aml_andi_deb', 'inv_andi_oct', 'coa_ar', 'std_andi', 'SPP Oktober 2026 - Andi Pratama', 500000, 0, 1, 1761476400),
  ('aml_andi_crd', 'inv_andi_oct', 'coa_rev_spp', 'std_andi', 'Pendapatan SPP Oktober 2026', 0, 500000, 0, 1761476400),
  ('aml_bella_deb', 'inv_bella_oct', 'coa_ar', 'std_bella', 'SPP Oktober 2026 - Bella Cantika', 500000, 0, 0, 1761476400),
  ('aml_bella_crd', 'inv_bella_oct', 'coa_rev_spp', 'std_bella', 'Pendapatan SPP Oktober 2026', 0, 500000, 0, 1761476400);

-- 11. Payments
INSERT OR REPLACE INTO account_payments (id, school_id, journal_id, move_id, student_id, name, payment_date, amount, payment_method, reference, state, created_at)
VALUES ('pay_andi_oct', 'school_sma_hb', 'jrn_bank', 'inv_andi_oct', 'std_andi', 'PAY/2026/10/0001', '2026-10-05', 500000, 'bank_transfer', 'TRF-BCA-987123', 'posted', 1761476400);

-- 12. Warehouses & Products (Inventory)
INSERT OR REPLACE INTO warehouses (id, school_id, name, code, address, created_at)
VALUES 
  ('wh_main', 'school_sma_hb', 'Gudang Utama Sekolah', 'WH-MAIN', 'Gedung C Lantai 1', 1761476400),
  ('wh_lab', 'school_sma_hb', 'Laboratorium Fisika & Komputer', 'WH-LAB', 'Gedung B Lantai 2', 1761476400);

INSERT OR REPLACE INTO stock_locations (id, school_id, warehouse_id, name, usage, created_at)
VALUES 
  ('loc_internal', 'school_sma_hb', 'wh_main', 'WH/Stock', 'internal', 1761476400),
  ('loc_customer', 'school_sma_hb', NULL, 'Partner Locations/Students', 'customer', 1761476400),
  ('loc_supplier', 'school_sma_hb', NULL, 'Partner Locations/Vendors', 'supplier', 1761476400);

INSERT OR REPLACE INTO products (id, school_id, name, code, type, uom, list_price, standard_price, serial_number, created_at, updated_at)
VALUES 
  ('prd_seragam', 'school_sma_hb', 'Seragam Kemeja Putih Abu-Abu SMA', 'SRG-SMA-01', 'storable', 'set', 180000, 120000, NULL, 1761476400, 1761476400),
  ('prd_buku_mat', 'school_sma_hb', 'Buku Paket Matematika Kelas 10 Kurikulum Merdeka', 'BK-MAT-10', 'storable', 'pcs', 95000, 75000, NULL, 1761476400, 1761476400),
  ('prd_laptop', 'school_sma_hb', 'Laptop Laboratorium Asus ExpertBook i5', 'AST-LAB-01', 'asset', 'unit', 11500000, 10500000, 'SN-ASUS-2026-8819', 1761476400, 1761476400);

-- 13. Stock Operations (Stock Moves)
INSERT OR REPLACE INTO stock_pickings (id, school_id, name, picking_type, origin, state, scheduled_date, created_at, updated_at)
VALUES ('pick_rec_001', 'school_sma_hb', 'WH/IN/0001', 'incoming', 'PO/2026/08/001', 'done', '2026-08-10', 1761476400, 1761476400);

INSERT OR REPLACE INTO stock_moves (id, picking_id, product_id, location_id, location_dest_id, product_qty, state, created_at)
VALUES 
  ('sm_001', 'pick_rec_001', 'prd_seragam', 'loc_supplier', 'loc_internal', 100, 'done', 1761476400),
  ('sm_002', 'pick_rec_001', 'prd_buku_mat', 'loc_supplier', 'loc_internal', 80, 'done', 1761476400),
  ('sm_003', 'pick_rec_001', 'prd_laptop', 'loc_supplier', 'loc_internal', 25, 'done', 1761476400);
