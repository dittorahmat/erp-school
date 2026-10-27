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

## 8. Penerimaan Peserta Didik Baru (Admission / PPDB ala OpenEduCat)
- **Application Register (Gelombang Pendaftaran)**: Periode pendaftaran siswa baru untuk Tahun Ajaran dan Course tertentu (misal: "Gelombang 1 Reguler 2026/2027") dengan kuota dan rentang tanggal.
- **Application / Applicant (Calon Siswa)**: Entitas calon siswa terdaftar dengan status alur (`draft`, `submitted`, `verified`, `approved`, `rejected`, `enrolled`).
- **Admission Fee Rule**: Biaya pendaftaran dan biaya pangkal awal yang otomatis mengompilasi draft `Student Invoice` saat status calon siswa bergeser ke `approved` / `enrolled`.

---

## 9. Struktur Biaya & Otomasi Tagihan (Fee Structure & Batch Invoicing)
- **Fee Category / Type**: Kategori biaya (misal: "SPP Bulanan", "Uang Gedung", "Iuran Praktikum", "Biaya Ujian").
- **Fee Structure**: Paket aturan tarif biaya yang ditautkan ke Grade Level atau Program (misal: Tarif SPP Kelas 10 MIPA Rp 500.000/bulan).
- **Fee Batch Generation Run**: Eksekusi batch terkontrol oleh bendahara sekolah yang mengompilasi `account.move` (`out_invoice`) secara massal untuk seluruh siswa aktif di suatu kelas/jenjang pada bulan tertentu dalam satu transaksi atomik D1.

---

## 10. Perpustakaan (Library Circulation ala OpenEduCat & Odoo)
- **Library Media**: Produk buku/media yang terintegrasi langsung dengan entitas `products` (tipe `storable`) dengan atribut tambahan seperti ISBN, pengarang, penerbit, dan nomor rak.
- **Media Unit / Barcode**: Copy fisik individual dari media dengan kode barcode unik.
- **Library Issue / Return (Sirkulasi Pinjam)**: Transaksi peminjaman unit buku ke Siswa atau Guru dengan batas tanggal kembali, histori pengembalian, status (`issued`, `returned`, `lost`), dan denda keterlambatan (*fine invoice*).

---

## 11. Portal Akses Siswa & Wali Murid (Parent & Student Self-Service)
- **Portal Scope**: Filter otorisasi baris (Row-Level Security) berbasis kepemilikan data (`session.user.id` -> `student.user_id` atau `guardian.user_id`), membatasi akses baca data hanya pada jadwal, kehadiran, rapor, dan tagihan invoice milik siswa/anak yang bersangkutan.

