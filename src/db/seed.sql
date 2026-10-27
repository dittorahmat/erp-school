-- ============================================================================
-- ERP Sekolah Demo Data Seeder (SMA Harapan Bangsa) - Academic Year 2026/2027
-- Rich Multi-Persona Demo Dataset (Students, Attendance, Gradebook, Finance, Inventory)
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

-- 3. Academic Structure (Academic Year 2026/2027)
INSERT OR REPLACE INTO academic_years (id, school_id, name, code, start_date, end_date, status, created_at, updated_at)
VALUES 
  ('ay_2026_2027', 'school_sma_hb', '2026/2027', 'AY-2627', '2026-07-15', '2027-06-25', 'active', 1761476400, 1761476400);

INSERT OR REPLACE INTO terms (id, academic_year_id, name, code, start_date, end_date, status, created_at, updated_at)
VALUES 
  ('term_sem1', 'ay_2026_2027', 'Semester Ganjil', 'SEM-1', '2026-07-15', '2026-12-20', 'active', 1761476400, 1761476400),
  ('term_sem2', 'ay_2026_2027', 'Semester Genap', 'SEM-2', '2027-01-06', '2027-06-25', 'draft', 1761476400, 1761476400);

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

-- 4. Faculties (Guru Pendidik)
INSERT OR REPLACE INTO faculties (id, school_id, user_id, nip, name, gender, phone, email, avatar_url, department, created_at, updated_at)
VALUES 
  ('fac_budi', 'school_sma_hb', 'usr_guru_budi', '198205122008011002', 'Budi Santoso, S.Pd', 'male', '081234567890', 'guru.budi@sekolah.demo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'Matematika', 1761476400, 1761476400),
  ('fac_dewi', 'school_sma_hb', NULL, '198709242011012005', 'Dewi Lestari, M.Si', 'female', '081298765432', 'dewi.lestari@sekolah.demo', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 'Fisika', 1761476400, 1761476400),
  ('fac_hendra', 'school_sma_hb', NULL, '197903152005011003', 'Hendra Wijaya, M.Pd', 'male', '081377889900', 'hendra.wijaya@sekolah.demo', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'Biologi & Kimia', 1761476400, 1761476400);

-- 5. Classrooms (Rombel)
INSERT OR REPLACE INTO classrooms (id, school_id, academic_year_id, grade_level_id, homeroom_teacher_id, name, code, capacity, created_at, updated_at)
VALUES 
  ('cls_x_ipa_1', 'school_sma_hb', 'ay_2026_2027', 'grd_10', 'fac_budi', 'X-MIPA-1', '10-MIPA-1', 35, 1761476400, 1761476400),
  ('cls_x_ipa_2', 'school_sma_hb', 'ay_2026_2027', 'grd_10', 'fac_dewi', 'X-MIPA-2', '10-MIPA-2', 35, 1761476400, 1761476400),
  ('cls_xi_ipa_1', 'school_sma_hb', 'ay_2026_2027', 'grd_11', 'fac_hendra', 'XI-MIPA-1', '11-MIPA-1', 35, 1761476400, 1761476400);

-- 6. Guardians & Students (Expanded Population 10 Siswa & Wali Murid)
INSERT OR REPLACE INTO guardians (id, user_id, name, relation, phone, email, occupation, address, created_at, updated_at)
VALUES 
  ('grd_joko', 'usr_ortu_andi', 'Joko Pratama', 'father', '081399887766', 'ortu.andi@sekolah.demo', 'Wiraswasta', 'Jl. Tebet Timur Raya No. 12, Jakarta', 1761476400, 1761476400),
  ('grd_susanto', NULL, 'Susanto Hidayat', 'father', '081233445566', 'susanto.h@mail.demo', 'PNS Kemenkeu', 'Jl. Rasuna Said No. 5, Jakarta', 1761476400, 1761476400),
  ('grd_ratna', NULL, 'Ratna Sari Dewi', 'mother', '081288990011', 'ratna.dewi@mail.demo', 'Dokter Spesialis', 'Jl. Wijaya Kusuma No. 8, Jakarta', 1761476400, 1761476400),
  ('grd_anwar', NULL, 'Anwar Sanusi', 'father', '081344556677', 'anwar.sanusi@mail.demo', 'Direktur Swasta', 'Jl. Panglima Polim No. 20, Jakarta', 1761476400, 1761476400);

INSERT OR REPLACE INTO students (id, school_id, user_id, guardian_id, nis, nisn, name, gender, birth_date, birth_place, address, avatar_url, document_url, status, created_at, updated_at)
VALUES 
  ('std_andi', 'school_sma_hb', 'usr_student_andi', 'grd_joko', '202601001', '0089123456', 'Andi Pratama', 'male', '2010-04-12', 'Jakarta', 'Jl. Tebet Timur Raya No. 12, Jakarta', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_bella', 'school_sma_hb', NULL, 'grd_susanto', '202601002', '0089123457', 'Bella Cantika', 'female', '2010-08-20', 'Bandung', 'Jl. Rasuna Said No. 5, Jakarta', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_citra', 'school_sma_hb', NULL, 'grd_ratna', '202601003', '0089123458', 'Citra Kirana', 'female', '2010-02-14', 'Surabaya', 'Jl. Wijaya Kusuma No. 8, Jakarta', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_dimas', 'school_sma_hb', NULL, 'grd_anwar', '202601004', '0089123459', 'Dimas Anggara', 'male', '2010-11-05', 'Yogyakarta', 'Jl. Panglima Polim No. 20, Jakarta', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_erik', 'school_sma_hb', NULL, 'grd_joko', '202601005', '0089123460', 'Erik Setiawan', 'male', '2010-06-30', 'Jakarta', 'Jl. Tebet Timur No. 14, Jakarta', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_fani', 'school_sma_hb', NULL, 'grd_susanto', '202601006', '0089123461', 'Fani Rahmawati', 'female', '2010-09-18', 'Bogor', 'Jl. Pajajaran No. 40, Bogor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_gilang', 'school_sma_hb', NULL, 'grd_ratna', '202601007', '0089123462', 'Gilang Ramadhan', 'male', '2010-03-25', 'Semarang', 'Jl. Ampera Raya No. 15, Jakarta', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_hana', 'school_sma_hb', NULL, 'grd_anwar', '202601008', '0089123463', 'Hana Syakira', 'female', '2010-12-10', 'Malang', 'Jl. Kemang Selatan No. 9, Jakarta', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_irfan', 'school_sma_hb', NULL, 'grd_joko', '202501009', '0089123464', 'Irfan Hakim', 'male', '2009-05-15', 'Bandung', 'Jl. Cilandak No. 12, Jakarta', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', NULL, 'active', 1761476400, 1761476400),
  ('std_jessica', 'school_sma_hb', NULL, 'grd_susanto', '202501010', '0089123465', 'Jessica Iskandar', 'female', '2009-07-22', 'Jakarta', 'Jl. Senopati No. 88, Jakarta', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', NULL, 'active', 1761476400, 1761476400);

-- 7. Enrollment (Kelas 10 & Kelas 11)
INSERT OR REPLACE INTO enrollments (id, student_id, classroom_id, academic_year_id, roll_number, status, enrolled_at)
VALUES 
  ('enr_andi', 'std_andi', 'cls_x_ipa_1', 'ay_2026_2027', '01', 'active', 1761476400),
  ('enr_bella', 'std_bella', 'cls_x_ipa_1', 'ay_2026_2027', '02', 'active', 1761476400),
  ('enr_citra', 'std_citra', 'cls_x_ipa_1', 'ay_2026_2027', '03', 'active', 1761476400),
  ('enr_dimas', 'std_dimas', 'cls_x_ipa_1', 'ay_2026_2027', '04', 'active', 1761476400),
  ('enr_erik', 'std_erik', 'cls_x_ipa_2', 'ay_2026_2027', '01', 'active', 1761476400),
  ('enr_fani', 'std_fani', 'cls_x_ipa_2', 'ay_2026_2027', '02', 'active', 1761476400),
  ('enr_gilang', 'std_gilang', 'cls_x_ipa_2', 'ay_2026_2027', '03', 'active', 1761476400),
  ('enr_hana', 'std_hana', 'cls_x_ipa_2', 'ay_2026_2027', '04', 'active', 1761476400),
  ('enr_irfan', 'std_irfan', 'cls_xi_ipa_1', 'ay_2026_2027', '01', 'active', 1761476400),
  ('enr_jessica', 'std_jessica', 'cls_xi_ipa_1', 'ay_2026_2027', '02', 'active', 1761476400);

-- 8. Chart of Accounts (COA)
INSERT OR REPLACE INTO chart_of_accounts (id, school_id, code, name, type, reconcile, created_at)
VALUES 
  ('coa_kas', 'school_sma_hb', '1110', 'Kas Operasional Sekolah', 'asset', 1, 1761476400),
  ('coa_bank', 'school_sma_hb', '1120', 'Bank BCA Operasional', 'asset', 1, 1761476400),
  ('coa_ar', 'school_sma_hb', '1210', 'Piutang SPP & Biaya Siswa', 'asset', 1, 1761476400),
  ('coa_rev_spp', 'school_sma_hb', '4110', 'Pendapatan SPP Bulanan', 'income', 0, 1761476400),
  ('coa_rev_gedung', 'school_sma_hb', '4120', 'Pendapatan Uang Gedung/Pangkal', 'income', 0, 1761476400),
  ('coa_rev_seragam', 'school_sma_hb', '4130', 'Pendapatan Seragam & Atribut', 'income', 0, 1761476400);

-- 9. Journals
INSERT OR REPLACE INTO journals (id, school_id, name, code, type, default_account_id, created_at)
VALUES 
  ('jrn_sale', 'school_sma_hb', 'Jurnal Tagihan Sekolah', 'INV', 'sale', 'coa_ar', 1761476400),
  ('jrn_cash', 'school_sma_hb', 'Kasir Sekolah', 'CSH', 'cash', 'coa_kas', 1761476400),
  ('jrn_bank', 'school_sma_hb', 'Rekening Bank BCA', 'BNK', 'bank', 'coa_bank', 1761476400);

-- 10. Invoices & Double-Entry Journal Lines (SPP, Uang Gedung, & Seragam)
-- Invoices
INSERT OR REPLACE INTO account_moves (id, school_id, journal_id, student_id, name, date, move_type, amount_total, amount_residual, state, payment_state, invoice_due_date, created_at, updated_at)
VALUES 
  ('inv_andi_oct', 'school_sma_hb', 'jrn_sale', 'std_andi', 'INV/2026/10/0001', '2026-10-01', 'out_invoice', 500000, 0, 'posted', 'paid', '2026-10-10', 1761476400, 1761476400),
  ('inv_bella_oct', 'school_sma_hb', 'jrn_sale', 'std_bella', 'INV/2026/10/0002', '2026-10-01', 'out_invoice', 500000, 500000, 'posted', 'not_paid', '2026-10-10', 1761476400, 1761476400),
  ('inv_citra_oct', 'school_sma_hb', 'jrn_sale', 'std_citra', 'INV/2026/10/0003', '2026-10-01', 'out_invoice', 500000, 0, 'posted', 'paid', '2026-10-10', 1761476400, 1761476400),
  ('inv_dimas_oct', 'school_sma_hb', 'jrn_sale', 'std_dimas', 'INV/2026/10/0004', '2026-10-01', 'out_invoice', 500000, 500000, 'posted', 'not_paid', '2026-10-10', 1761476400, 1761476400),
  ('inv_erik_gedung', 'school_sma_hb', 'jrn_sale', 'std_erik', 'INV/2026/09/0005', '2026-09-01', 'out_invoice', 3500000, 0, 'posted', 'paid', '2026-09-15', 1761476400, 1761476400),
  ('inv_fani_seragam', 'school_sma_hb', 'jrn_sale', 'std_fani', 'INV/2026/09/0006', '2026-09-05', 'out_invoice', 450000, 0, 'posted', 'paid', '2026-09-20', 1761476400, 1761476400);

-- Journal Lines (Debits = Credits Perfectly Balanced)
INSERT OR REPLACE INTO account_move_lines (id, move_id, account_id, student_id, name, debit, credit, reconciled, created_at)
VALUES 
  -- INV 1: Andi Oct (Lunas)
  ('aml_andi_deb', 'inv_andi_oct', 'coa_ar', 'std_andi', 'SPP Oktober 2026 - Andi Pratama', 500000, 0, 1, 1761476400),
  ('aml_andi_crd', 'inv_andi_oct', 'coa_rev_spp', 'std_andi', 'Pendapatan SPP Oktober 2026', 0, 500000, 0, 1761476400),
  -- INV 2: Bella Oct (Belum Bayar)
  ('aml_bella_deb', 'inv_bella_oct', 'coa_ar', 'std_bella', 'SPP Oktober 2026 - Bella Cantika', 500000, 0, 0, 1761476400),
  ('aml_bella_crd', 'inv_bella_oct', 'coa_rev_spp', 'std_bella', 'Pendapatan SPP Oktober 2026', 0, 500000, 0, 1761476400),
  -- INV 3: Citra Oct (Lunas)
  ('aml_citra_deb', 'inv_citra_oct', 'coa_ar', 'std_citra', 'SPP Oktober 2026 - Citra Kirana', 500000, 0, 1, 1761476400),
  ('aml_citra_crd', 'inv_citra_oct', 'coa_rev_spp', 'std_citra', 'Pendapatan SPP Oktober 2026', 0, 500000, 0, 1761476400),
  -- INV 4: Dimas Oct (Belum Bayar)
  ('aml_dimas_deb', 'inv_dimas_oct', 'coa_ar', 'std_dimas', 'SPP Oktober 2026 - Dimas Anggara', 500000, 0, 0, 1761476400),
  ('aml_dimas_crd', 'inv_dimas_oct', 'coa_rev_spp', 'std_dimas', 'Pendapatan SPP Oktober 2026', 0, 500000, 0, 1761476400),
  -- INV 5: Erik Uang Gedung (Lunas)
  ('aml_erik_deb', 'inv_erik_gedung', 'coa_ar', 'std_erik', 'Uang Pangkal/Gedung - Erik Setiawan', 3500000, 0, 1, 1761476400),
  ('aml_erik_crd', 'inv_erik_gedung', 'coa_rev_gedung', 'std_erik', 'Pendapatan Uang Gedung/Pangkal', 0, 3500000, 0, 1761476400),
  -- INV 6: Fani Paket Seragam (Lunas)
  ('aml_fani_deb', 'inv_fani_seragam', 'coa_ar', 'std_fani', 'Paket Seragam Siswa - Fani Rahmawati', 450000, 0, 1, 1761476400),
  ('aml_fani_crd', 'inv_fani_seragam', 'coa_rev_seragam', 'std_fani', 'Pendapatan Seragam & Atribut', 0, 450000, 0, 1761476400);

-- 11. Payments & Payment Balancing Move Lines
INSERT OR REPLACE INTO account_payments (id, school_id, journal_id, move_id, student_id, name, payment_date, amount, payment_method, reference, state, created_at)
VALUES 
  ('pay_andi_oct', 'school_sma_hb', 'jrn_bank', 'inv_andi_oct', 'std_andi', 'PAY/2026/10/0001', '2026-10-05', 500000, 'bank_transfer', 'TRF-BCA-987123', 'posted', 1761476400),
  ('pay_citra_oct', 'school_sma_hb', 'jrn_cash', 'inv_citra_oct', 'std_citra', 'PAY/2026/10/0002', '2026-10-06', 500000, 'cash', 'CSH-REC-2026-081', 'posted', 1761476400),
  ('pay_erik_gedung', 'school_sma_hb', 'jrn_bank', 'inv_erik_gedung', 'std_erik', 'PAY/2026/09/0003', '2026-09-10', 3500000, 'bank_transfer', 'TRF-BCA-551122', 'posted', 1761476400),
  ('pay_fani_seragam', 'school_sma_hb', 'jrn_cash', 'inv_fani_seragam', 'std_fani', 'PAY/2026/09/0004', '2026-09-12', 450000, 'cash', 'CSH-REC-2026-095', 'posted', 1761476400);

-- 12. Warehouses & Products (Expanded Inventory: Storable, Consumable & Asset)
INSERT OR REPLACE INTO warehouses (id, school_id, name, code, address, created_at)
VALUES 
  ('wh_main', 'school_sma_hb', 'Gudang Utama Sekolah', 'WH-MAIN', 'Gedung C Lantai 1', 1761476400),
  ('wh_lab', 'school_sma_hb', 'Laboratorium Fisika & Komputer', 'WH-LAB', 'Gedung B Lantai 2', 1761476400);

INSERT OR REPLACE INTO stock_locations (id, school_id, warehouse_id, name, usage, created_at)
VALUES 
  ('loc_internal', 'school_sma_hb', 'wh_main', 'WH/Stock', 'internal', 1761476400),
  ('loc_lab', 'school_sma_hb', 'wh_lab', 'WH/Lab/Storage', 'internal', 1761476400),
  ('loc_customer', 'school_sma_hb', NULL, 'Partner Locations/Students', 'customer', 1761476400),
  ('loc_supplier', 'school_sma_hb', NULL, 'Partner Locations/Vendors', 'supplier', 1761476400);

INSERT OR REPLACE INTO products (id, school_id, name, code, type, uom, list_price, standard_price, serial_number, created_at, updated_at)
VALUES 
  ('prd_seragam', 'school_sma_hb', 'Seragam Kemeja Putih Abu-Abu SMA', 'SRG-SMA-01', 'storable', 'set', 180000, 120000, NULL, 1761476400, 1761476400),
  ('prd_buku_mat', 'school_sma_hb', 'Buku Paket Matematika Kelas 10 Kurikulum Merdeka', 'BK-MAT-10', 'storable', 'pcs', 95000, 75000, NULL, 1761476400, 1761476400),
  ('prd_buku_fis', 'school_sma_hb', 'Buku Fisika Eksperimental Kelas 10', 'BK-FIS-10', 'storable', 'pcs', 110000, 85000, NULL, 1761476400, 1761476400),
  ('prd_kertas_a4', 'school_sma_hb', 'Kertas HVS A4 80gr PaperOne (Rim)', 'ATK-HVS-A4', 'consumable', 'rim', 58000, 48000, NULL, 1761476400, 1761476400),
  ('prd_spidol_wb', 'school_sma_hb', 'Spidol Whiteboard Snowman Hitam', 'ATK-SPD-01', 'consumable', 'box', 96000, 80000, NULL, 1761476400, 1761476400),
  ('prd_laptop', 'school_sma_hb', 'Laptop Laboratorium Asus ExpertBook i5', 'AST-LAB-01', 'asset', 'unit', 11500000, 10500000, 'SN-ASUS-2026-8819', 1761476400, 1761476400),
  ('prd_proyektor', 'school_sma_hb', 'Proyektor Epson EB-E500 3300 Lumens', 'AST-LAB-02', 'asset', 'unit', 6500000, 5800000, 'SN-EPS-2026-4402', 1761476400, 1761476400);

-- 13. Stock Operations (Receipts & Internal Transfers)
INSERT OR REPLACE INTO stock_pickings (id, school_id, name, picking_type, origin, state, scheduled_date, created_at, updated_at)
VALUES 
  ('pick_rec_001', 'school_sma_hb', 'WH/IN/0001', 'incoming', 'PO/2026/08/001', 'done', '2026-08-10', 1761476400, 1761476400),
  ('pick_int_002', 'school_sma_hb', 'WH/INT/0001', 'internal', 'REQ/LAB/2026/09', 'done', '2026-09-02', 1761476400, 1761476400);

INSERT OR REPLACE INTO stock_moves (id, picking_id, product_id, location_id, location_dest_id, product_qty, state, created_at)
VALUES 
  -- Incoming from Vendors
  ('sm_001', 'pick_rec_001', 'prd_seragam', 'loc_supplier', 'loc_internal', 150, 'done', 1761476400),
  ('sm_002', 'pick_rec_001', 'prd_buku_mat', 'loc_supplier', 'loc_internal', 120, 'done', 1761476400),
  ('sm_003', 'pick_rec_001', 'prd_buku_fis', 'loc_supplier', 'loc_internal', 100, 'done', 1761476400),
  ('sm_004', 'pick_rec_001', 'prd_kertas_a4', 'loc_supplier', 'loc_internal', 50, 'done', 1761476400),
  ('sm_005', 'pick_rec_001', 'prd_spidol_wb', 'loc_supplier', 'loc_internal', 40, 'done', 1761476400),
  ('sm_006', 'pick_rec_001', 'prd_laptop', 'loc_supplier', 'loc_internal', 25, 'done', 1761476400),
  ('sm_007', 'pick_rec_001', 'prd_proyektor', 'loc_supplier', 'loc_internal', 5, 'done', 1761476400),
  -- Internal Transfer to Lab
  ('sm_008', 'pick_int_002', 'prd_laptop', 'loc_internal', 'loc_lab', 10, 'done', 1761476400);

-- 14. Timetables (Jadwal Pelajaran Multi-Hari)
INSERT OR REPLACE INTO timetables (id, school_id, classroom_id, subject_id, faculty_id, day_of_week, start_time, end_time, created_at, updated_at)
VALUES 
  ('tt_mon_mat', 'school_sma_hb', 'cls_x_ipa_1', 'sbj_mat', 'fac_budi', 'monday', '07:30', '09:00', 1761476400, 1761476400),
  ('tt_mon_fis', 'school_sma_hb', 'cls_x_ipa_1', 'sbj_fis', 'fac_dewi', 'monday', '09:30', '11:00', 1761476400, 1761476400),
  ('tt_tue_eng', 'school_sma_hb', 'cls_x_ipa_1', 'sbj_eng', 'fac_budi', 'tuesday', '08:00', '09:30', 1761476400, 1761476400),
  ('tt_wed_kim', 'school_sma_hb', 'cls_x_ipa_1', 'sbj_kim', 'fac_hendra', 'wednesday', '07:30', '09:00', 1761476400, 1761476400),
  ('tt_thu_bio', 'school_sma_hb', 'cls_x_ipa_1', 'sbj_bio', 'fac_hendra', 'thursday', '09:30', '11:00', 1761476400, 1761476400),
  ('tt_wed_mat', 'school_sma_hb', 'cls_x_ipa_2', 'sbj_mat', 'fac_budi', 'wednesday', '07:30', '09:00', 1761476400, 1761476400);

-- 15. Attendance Sheets & Lines (Riwayat Presensi Multi-Tanggal dengan Variasi Status)
INSERT OR REPLACE INTO attendance_sheets (id, school_id, classroom_id, faculty_id, timetable_id, date, status, total_present, total_absent, total_sick, total_excused, created_at, updated_at)
VALUES 
  ('att_20261026_01', 'school_sma_hb', 'cls_x_ipa_1', 'fac_budi', 'tt_mon_mat', '2026-10-26', 'confirmed', 4, 0, 0, 0, 1761476400, 1761476400),
  ('att_20261020_01', 'school_sma_hb', 'cls_x_ipa_1', 'fac_budi', 'tt_tue_eng', '2026-10-20', 'confirmed', 3, 0, 1, 0, 1761476400, 1761476400),
  ('att_20261019_01', 'school_sma_hb', 'cls_x_ipa_1', 'fac_dewi', 'tt_mon_fis', '2026-10-19', 'confirmed', 3, 0, 0, 1, 1761476400, 1761476400),
  ('att_20261012_01', 'school_sma_hb', 'cls_x_ipa_1', 'fac_budi', 'tt_mon_mat', '2026-10-12', 'confirmed', 3, 1, 0, 0, 1761476400, 1761476400);

INSERT OR REPLACE INTO attendance_lines (id, sheet_id, student_id, status, remark, created_at)
VALUES 
  -- Sesi 26 Okt 2026 (Semua Hadir)
  ('attl_andi_01', 'att_20261026_01', 'std_andi', 'present', 'Hadir tepat waktu', 1761476400),
  ('attl_bella_01', 'att_20261026_01', 'std_bella', 'present', 'Hadir tepat waktu', 1761476400),
  ('attl_citra_01', 'att_20261026_01', 'std_citra', 'present', 'Hadir tepat waktu', 1761476400),
  ('attl_dimas_01', 'att_20261026_01', 'std_dimas', 'present', 'Hadir tepat waktu', 1761476400),
  -- Sesi 20 Okt 2026 (Bella Sakit)
  ('attl_andi_02', 'att_20261020_01', 'std_andi', 'present', 'Hadir', 1761476400),
  ('attl_bella_02', 'att_20261020_01', 'std_bella', 'sick', 'Surat dokter terlampir', 1761476400),
  ('attl_citra_02', 'att_20261020_01', 'std_citra', 'present', 'Hadir', 1761476400),
  ('attl_dimas_02', 'att_20261020_01', 'std_dimas', 'present', 'Hadir', 1761476400),
  -- Sesi 19 Okt 2026 (Dimas Izin)
  ('attl_andi_03', 'att_20261019_01', 'std_andi', 'present', 'Hadir', 1761476400),
  ('attl_bella_03', 'att_20261019_01', 'std_bella', 'present', 'Hadir', 1761476400),
  ('attl_citra_03', 'att_20261019_01', 'std_citra', 'present', 'Hadir', 1761476400),
  ('attl_dimas_03', 'att_20261019_01', 'std_dimas', 'excused', 'Izin acara keluarga', 1761476400),
  -- Sesi 12 Okt 2026 (Dimas Alpa)
  ('attl_andi_04', 'att_20261012_01', 'std_andi', 'present', 'Hadir', 1761476400),
  ('attl_bella_04', 'att_20261012_01', 'std_bella', 'present', 'Hadir', 1761476400),
  ('attl_citra_04', 'att_20261012_01', 'std_citra', 'present', 'Hadir', 1761476400),
  ('attl_dimas_04', 'att_20261012_01', 'std_dimas', 'absent', 'Tanpa keterangan', 1761476400);

-- 16. Exam Sessions & Grade Marks (Multi-Mapel: Matematika, Fisika, Kimia, Biologi)
INSERT OR REPLACE INTO exam_sessions (id, school_id, academic_year_id, term_id, classroom_id, subject_id, name, exam_date, total_marks, passing_marks, weightage, status, created_at, updated_at)
VALUES 
  ('exam_uts_mat', 'school_sma_hb', 'ay_2026_2027', 'term_sem1', 'cls_x_ipa_1', 'sbj_mat', 'UTS Semester Ganjil Matematika Wajib', '2026-10-15', 100, 75, 30, 'published', 1761476400, 1761476400),
  ('exam_uts_fis', 'school_sma_hb', 'ay_2026_2027', 'term_sem1', 'cls_x_ipa_1', 'sbj_fis', 'UTS Semester Ganjil Fisika Dasar', '2026-10-16', 100, 75, 30, 'published', 1761476400, 1761476400),
  ('exam_uts_kim', 'school_sma_hb', 'ay_2026_2027', 'term_sem1', 'cls_x_ipa_1', 'sbj_kim', 'UTS Semester Ganjil Kimia Analitik', '2026-10-17', 100, 75, 30, 'published', 1761476400, 1761476400),
  ('exam_uts_bio', 'school_sma_hb', 'ay_2026_2027', 'term_sem1', 'cls_x_ipa_1', 'sbj_bio', 'UTS Semester Ganjil Biologi Umum', '2026-10-18', 100, 75, 30, 'published', 1761476400, 1761476400),
  ('exam_uts_eng', 'school_sma_hb', 'ay_2026_2027', 'term_sem1', 'cls_x_ipa_1', 'sbj_eng', 'UTS Semester Ganjil Bahasa Inggris', '2026-10-19', 100, 75, 30, 'published', 1761476400, 1761476400);

INSERT OR REPLACE INTO exam_marks (id, session_id, student_id, marks_obtained, grade, remark, created_at, updated_at)
VALUES 
  -- Andi Pratama
  ('mark_andi_mat', 'exam_uts_mat', 'std_andi', 92, 'A', 'Sangat memuaskan dalam aljabar', 1761476400, 1761476400),
  ('mark_andi_fis', 'exam_uts_fis', 'std_andi', 86, 'B', 'Memahami konsep kinematika dengan baik', 1761476400, 1761476400),
  ('mark_andi_kim', 'exam_uts_kim', 'std_andi', 90, 'A', 'Sangat baik dalam stoikiometri', 1761476400, 1761476400),
  ('mark_andi_bio', 'exam_uts_bio', 'std_andi', 88, 'B', 'Memahami struktur sel dan genetika', 1761476400, 1761476400),
  -- Bella Cantika
  ('mark_bella_mat', 'exam_uts_mat', 'std_bella', 88, 'B', 'Pemecahan masalah sistematis', 1761476400, 1761476400),
  ('mark_bella_fis', 'exam_uts_fis', 'std_bella', 94, 'A', 'Sangat teliti dalam praktikum dan teori', 1761476400, 1761476400),
  ('mark_bella_kim', 'exam_uts_kim', 'std_bella', 92, 'A', 'Penguasaan reaksi kimia luar biasa', 1761476400, 1761476400),
  ('mark_bella_bio', 'exam_uts_bio', 'std_bella', 95, 'A', 'Nilai praktikum sempurna', 1761476400, 1761476400),
  -- Citra Kirana
  ('mark_citra_mat', 'exam_uts_mat', 'std_citra', 85, 'B', 'Baik dan konsisten', 1761476400, 1761476400),
  ('mark_citra_fis', 'exam_uts_fis', 'std_citra', 89, 'B', 'Kreatif dalam pembahasan soal', 1761476400, 1761476400),
  -- Dimas Anggara
  ('mark_dimas_mat', 'exam_uts_mat', 'std_dimas', 91, 'A', 'Analitis tinggi', 1761476400, 1761476400),
  ('mark_dimas_fis', 'exam_uts_fis', 'std_dimas', 84, 'B', 'Tuntas memuaskan', 1761476400, 1761476400),
  -- B. Inggris & Seluruh Siswa
  ('mark_andi_eng', 'exam_uts_eng', 'std_andi', 89, 'B', 'Excellent speaking and grammar', 1761476400, 1761476400),
  ('mark_bella_eng', 'exam_uts_eng', 'std_bella', 96, 'A', 'Outstanding vocabulary and essays', 1761476400, 1761476400),
  ('mark_citra_eng', 'exam_uts_eng', 'std_citra', 90, 'A', 'Active participation in discussions', 1761476400, 1761476400),
  ('mark_dimas_eng', 'exam_uts_eng', 'std_dimas', 87, 'B', 'Good comprehension skills', 1761476400, 1761476400),
  ('mark_erik_mat', 'exam_uts_mat', 'std_erik', 82, 'B', 'Kompeten dan tekun', 1761476400, 1761476400),
  ('mark_fani_mat', 'exam_uts_mat', 'std_fani', 88, 'B', 'Kemampuan berhitung sangat baik', 1761476400, 1761476400),
  ('mark_gilang_mat', 'exam_uts_mat', 'std_gilang', 80, 'B', 'Tuntas sesuai KKM', 1761476400, 1761476400),
  ('mark_hana_mat', 'exam_uts_mat', 'std_hana', 93, 'A', 'Logika matematika luar biasa', 1761476400, 1761476400),
  ('mark_irfan_mat', 'exam_uts_mat', 'std_irfan', 86, 'B', 'Penguasaan materi mantap', 1761476400, 1761476400),
  ('mark_jessica_mat', 'exam_uts_mat', 'std_jessica', 91, 'A', 'Kritis dan teliti', 1761476400, 1761476400);
