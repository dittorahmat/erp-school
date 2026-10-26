# Arsitektur & Spesifikasi ERP Sekolah (Cloudflare Full Monolith)

Dokumen ini merangkum hasil interview & validasi arsitektur sistem ERP Sekolah berbasis **Odoo & OpenEduCat**.

---

## 1. Stack Teknologi & Deployment
- **Frontend & Backend**: Full Monolith di **Cloudflare Workers** menggunakan **React Router v7 / TanStack Start + Hono**.
- **Database & Query Layer**: **Cloudflare D1** (SQLite Edge Distributed) + **Drizzle ORM** (Type-safe & batch queries).
- **Blob & Object Storage**: **Cloudflare R2** (Dokumen Rapor, Foto Profil Siswa/Guru, Bukti Bayar, Lampiran Tugas).
- **Authentication & RBAC**: **Better-Auth** dengan D1 session storage, cookie terenkripsi, dan integrasi relasi profil domain.
- **Design System & UI**: **Tailwind CSS + shadcn/ui**, menerapkan Odoo ControlPanel (Search, Filter, Group By), List View, Kanban View, dan Form View (Status pipeline + action bar + chatter).

---

## 2. Peta Modul Domain
| Modul | Lingkup Fungsional |
|---|---|
| **Core & Academic Structure** | Multi-School (Yayasan & Cabang), Tahun Ajaran, Semester/Term, Jenjang/Tingkat, Program Studi, Rombel/Classroom, Mata Pelajaran. |
| **Student & Faculty** | Profil Siswa (NIS/NISN, data wali, dokumen NISN di R2), Profil Guru, Enrollment Siswa ke Rombel. |
| **Timetable & Presensi** | Jadwal Pelajaran (Roster mingguan), Lembar Presensi per jam/hari, Status kehadiran (Hadir, Sakit, Izin, Alpa). |
| **Grading & Examination** | Sesi Ujian/Asesmen, Pembobotan Nilai, Input Nilai Guru, Rapor Digital Siswa (PDF/Report card). |
| **Double-Entry Accounting** | Bagan Akun (COA), Jurnal (Penjualan/SPP, Pembelian, Kas, Bank), Invoice Siswa (`account.move`), Pembayaran (`account.payment`), Batch Invoicing SPP bulanan. |
| **Double-Entry Inventory** | Gudang & Lokasi internal/eksternal, Produk (Buku, Seragam, ATK, Aset), Mutasi Stok (`stock.move`), Transfer Penerimaan & Penyerahan (`stock.picking`), Stok Opname. |

---

## 3. Akun Demo & Skenario Data Seeder
Seeder akan menghasilkan data realistis:
- **Sekolah Model**: *"SMA Harapan Bangsa"* & *"SMP Harapan Bangsa"*
- **Tahun Ajaran**: 2025/2026 (Semester Ganjil & Genap)
- **Akun Login Bawaan**:
  - `admin@sekolah.demo` (Superadmin / Kepala Sekolah) — Akses penuh semua modul
  - `finance@sekolah.demo` (Bendahara / Staf Keuangan) — Akses Kas/Bank, Invoice SPP, Laporan Keuangan
  - `guru.budi@sekolah.demo` (Guru Matematika & Wali Kelas X-IPA-1) — Akses Jadwal, Presensi, Input Nilai
  - `student.andi@sekolah.demo` (Siswa Kelas X-IPA-1) — Akses Jadwal, Nilai Rapor, Status Kehadiran
  - `ortu.andi@sekolah.demo` (Wali Murid) — Akses Tagihan SPP, Riwayat Pembayaran, Presensi Anak
- **Data Transaksi**: 50 siswa terdaftar, presensi aktif 1 bulan, tagihan SPP lunas & sebagian menunggak, stok buku paket dan seragam di gudang.
