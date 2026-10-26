# ERP Sekolah (School Management System) — Domain Glossary

Dokumen ini mendefinisikan istilah dan konsep kanonik yang digunakan dalam sistem ERP Sekolah, berbasis model Odoo & OpenEduCat.

---

## 1. Organisasi & Multi-Tenant (Multi-School)
- **Institution / Yayasan**: Entitas payung tertinggi pemegang lisensi atau organisasi induk.
- **School (Sekolah/Cabang)**: Unit institusi pendidikan operasional spesifik (misal: "SD Harapan Bangsa", "SMP Harapan Bangsa"). Setiap data transaksional dan master data terisolasi secara logis oleh `school_id`.
- **Academic Year (Tahun Ajaran)**: Periode kalender operasional akademik (misal: 2025/2026) dengan status `draft`, `active`, atau `closed`.
- **Term / Semester**: Sub-periode dalam Tahun Ajaran (misal: Semester Ganjil, Semester Genap).

---

## 2. Struktur Akademik (Academic Hierarchy)
- **Grade Level (Tingkat/Jenjang)**: Tingkat kelas pendidikan (misal: Kelas 10, Kelas 11, atau Jenjang SD 1-6).
- **Course / Program (Program Studi / Kurikulum)**: Kurikulum pendidikan yang diikuti (misal: IPA, IPS, atau Reguler).
- **Subject (Mata Pelajaran)**: Disiplin ilmu atau pelajaran terdaftar dengan kode unik dan bobot SKS/jam (misal: MAT101 - Matematika Dasar).
- **Classroom / Batch (Rombel / Kelas Belajar)**: Kelompok belajar fisik/logis siswa dalam satu Tahun Ajaran (misal: "X-IPA-1", "7-A"), memiliki Wali Kelas (Homeroom Teacher).

---

## 3. Personil & Identitas (Identity & Stakeholders)
- **User**: Entitas otentikasi (dikelola oleh Better-Auth) yang menyimpan email, password hash, dan session token.
- **Role**: Peran otorisasi sistem (`superadmin`, `school_admin`, `academic_admin`, `accountant`, `teacher`, `student`, `guardian`).
- **Student (Siswa)**: Peserta didik aktif atau alumni, memiliki nomor induk siswa (NIS / NISN), profil kontak, riwayat enrollment, dan wali.
- **Faculty / Teacher (Guru / Staf Pengajar)**: Tenaga pendidik yang dapat ditugaskan mengajar Subject tertentu, menjadi Wali Kelas, dan menginput nilai.
- **Guardian / Parent (Orang Tua / Wali)**: Kontak penanggung jawab siswa, memiliki relasi ke satu atau lebih Siswa, serta akses melihat tagihan dan absensi.
- **Enrollment**: Relasi formal penempatan Siswa ke dalam Classroom/Batch pada Tahun Ajaran dan Term tertentu.

---

## 4. Akademik Harian: Timetable & Attendance
- **Timetable Entry (Jadwal Pelajaran)**: Slot waktu (hari, jam mulai, jam selesai) pengajaran suatu Subject di Classroom oleh Teacher tertentu.
- **Attendance Sheet (Sesi Presensi)**: Lembar presensi yang dibuka per sesi pelajaran atau presensi harian per kelas.
- **Attendance Line (Baris Presensi Siswa)**: Status kehadiran per siswa (`present`, `absent`, `late`, `excused`/izin, `sick`/sakit) disertai catatan.

---

## 5. Penilaian (Examination & Grading)
- **Exam Session (Sesi Ujian/Asesmen)**: Entitas ujian (misal: UTS Matematika Semester Ganjil, Tugas 1 Fisika).
- **Grading Scale (Skala Nilai)**: Skala penilaian (misal: 0-100, atau predikat A, B, C, D) dengan batas KKM/kelulusan.
- **Grade Record (Nilai Siswa)**: Nilai mentah dan terbobot yang dicatat untuk Siswa pada Exam Session tertentu.
- **Report Card (Rapor Akademik)**: Rekapitulasi nilai akhir akumulatif per Subject untuk siswa dalam satu Term.

---

## 6. Akuntansi & Keuangan (Double-Entry Bookkeeping ala Odoo)
- **Account (Bagan Akun / Chart of Accounts - COA)**: Akun penampung nilai finansial (`asset`, `liability`, `equity`, `income`, `expense`).
- **Journal**: Kelompok pencatatan transaksi spesifik (`Sale / Tagihan Sekolah`, `Purchase / Pembelian`, `Bank`, `Cash`, `General / Miscellaneous`).
- **Journal Entry (`account.move`)**: Dokumen transaksi akuntansi berimbang (Total Debit = Total Credit) dengan status `draft` atau `posted`.
- **Journal Item (`account.move.line`)**: Baris debit atau credit individual yang terikat pada suatu Account dan Partner.
- **Student Invoice (Tagihan Biaya Siswa)**: Journal Entry bertipe `out_invoice` yang menagihkan biaya sekolah (SPP bulanan, Uang Gedung, Seragam).
- **Payment (`account.payment`)**: Pembayaran kas/bank dari wali murid atau pengeluaran sekolah yang direkonsiliasi dengan Invoice atau Bill.
- **Fee Structure / Rule**: Template biaya standar per Grade Level atau Program (misal: SPP Bulanan Rp 500.000).

---

## 7. Inventaris & Pengelolaan Aset (Inventory ala Odoo)
- **Warehouse (Gudang/Penyimpanan)**: Lokasi fisik utama inventaris sekolah (misal: "Gudang Utama", "Perpustakaan", "Lab IPA").
- **Location**: Sub-lokasi dalam gudang (`internal`, `customer`, `vendor`, `inventory_loss`).
- **Product (Barang/Item)**: Barang inventaris sekolah dengan tipe:
  - *Storable Product*: Buku paket, seragam, modul pelajaran (dihitung stok fisik).
  - *Consumable*: ATK, kertas, spidol, cairan pembersih.
  - *Asset / Equipment*: Proyektor, laptop lab, meja kursi (diberi nomor seri/barcode).
- **Stock Move (`stock.move`)**: Mutasi perpindahan kuantitas Product dari satu Location ke Location lain.
- **Stock Picking / Operation (`stock.picking`)**: Dokumen batch transfer mutasi:
  - *Receipt (Penerimaan Barang dari Vendor)*
  - *Internal Transfer (Perpindahan antar Lab/Ruang)*
  - *Delivery / Issue (Penyerahan seragam/buku ke Siswa atau guru)*
- **Inventory Adjustment (Stock Opname)**: Penyesuaian stok sistem dengan perhitungan fisik riil.
