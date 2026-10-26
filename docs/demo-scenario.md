# Skenario Demo End-to-End (E2E) — ERP Sekolah

Dokumen ini adalah panduan resmi skenario demo interaktif ERP Sekolah (berbasis Cloudflare Workers D1 + Hono + Odoo-style SPA). Panduan ini dirancang untuk mendemokan kapabilitas sistem dari hulu ke hilir menggunakan pendekatan **Multi-Persona Journey**.

---

## 1. Ringkasan Kredensial Demo Persona

Semua akun demo menggunakan kata sandi default: `DemoPass123!`

| Persona | Nama Karakter | Email Akun | Peran Utama | Fokus Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Kepala Sekolah / Superadmin** | Bambang Sudarmono, M.Pd | `admin@sekolah.demo` | `superadmin` | Struktur Akademik, Kelas, & Fasilitas Gudang/Aset |
| **Guru / Wali Kelas** | Budi Santoso, S.Pd | `guru.budi@sekolah.demo` | `teacher` | Jadwal Pelajaran, Presensi Kelas, & Entry Nilai Ujian |
| **Bendahara TU** | Siti Rahmawati, S.E | `finance@sekolah.demo` | `accountant` | Tagihan SPP, Catat Pembayaran, & Neraca Trial Balance |
| **Siswa** | Andi Pratama | `student.andi@sekolah.demo` | `student` | Rapor Digital Semester Aktif & Status Keuangan |
| **Wali Murid** | Joko Pratama | `ortu.andi@sekolah.demo` | `guardian` | Monitoring Kehadiran Siswa & Pembayaran Sekolah |

> Catatan: Pengguna dapat berpindah akun secara instan melalui dropdown profil di pojok kanan atas aplikasi (**"Switch Account"**).

---

## 2. Peta Perjalanan Demo (End-to-End Journey)

```
┌─────────────────────────┐
│ ACT 1: Administrator    │ ➜ Tinjauan Dashboard, Master Rombel, & Stok Inventaris
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ ACT 2: Guru / Pengajar  │ ➜ Buka Jadwal, Ambil Presensi Kelas, & Input Nilai Ujian
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ ACT 3: Keuangan TU      │ ➜ Verifikasi Invoice SPP, Catat Pembayaran, Audit Balance
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ ACT 4: Siswa & Wali     │ ➜ Cek Rapor Digital Otomatis & Bukti Pelunasan Biaya
└─────────────────────────┘
```

---

## 3. Langkah Detail Skenario Demo

### ACT 1: Eksplorasi Master Data & Inventaris (Admin)
**Tujuan**: Memperlihatkan fondasi operasional sekolah yang terstruktur dan terintegrasi multi-tenant.

1. **Akses Dashboard**:
   - Buka aplikasi ERP Sekolah (`http://localhost:8787` atau domain deployment).
   - Pastikan login sebagai `admin@sekolah.demo` (Bambang Sudarmono, M.Pd).
   - Tunjukkan kartu metrik utama: Siswa Aktif, Tenaga Pendidik, Total Rombel, dan Status Keuangan Berjalan.
2. **Kelola Struktur Akademik & Siswa**:
   - Klik menu **Akademik** ➔ Tunjukkan Tahun Ajaran aktif `2025/2026`, Semester Ganjil, dan Mata Pelajaran Kurikulum Merdeka.
   - Klik menu **Siswa** ➔ Buka daftar siswa kelas `X-MIPA-1`, perlihatkan data lengkap Andi Pratama dan Bella Cantika.
3. **Audit Inventaris & Aset Sekolah**:
   - Klik menu **Inventaris** ➔ Tab **Produk & Aset**.
   - Sorot aset berharga: `Laptop Laboratorium Asus ExpertBook i5` dengan nomor seri `SN-ASUS-2026-8819`.
   - Tunjukkan riwayat pergerakan stok penerimaan awal (*Stock Picking* `WH/IN/0001`).

---

### ACT 2: Kegiatan Akademik Harian (Guru: Pak Budi Santoso)
**Tujuan**: Memperlihatkan alur kerja guru tanpa ribet: dari melihat jadwal, presensi siswa, hingga pengisian buku nilai (Gradebook).

1. **Beralih ke Akun Guru**:
   - Klik avatar profil di kanan atas ➔ Pilih `Budi Santoso, S.Pd (Guru)`.
2. **Periksa Jadwal Pelajaran**:
   - Buka menu **Presensi & Jadwal** ➔ Tab **Jadwal Pelajaran**.
   - Tunjukkan slot mengajar: *Senin, 07:30 - 09:00 (Matematika Wajib di Kelas X-MIPA-1)*.
3. **Lakukan Presensi Kelas**:
   - Masuk ke tab **Sesi Presensi**.
   - Tunjukkan sesi tanggal `2026-10-26` dengan status `confirmed` (Hadir: 2, Sakit: 0, Izin: 0, Alpa: 0).
   - Klik tombol **Buat Sesi Presensi Baru** untuk mendemokan form interaktif pencatatan presensi real-time.
4. **Input Nilai Ujian (Gradebook)**:
   - Klik menu **Ujian & Penilaian**.
   - Tunjukkan sesi ujian `UTS Semester Ganjil Matematika Wajib` (KKM 75).
   - Perlihatkan daftar nilai: Andi Pratama (92 / A) dan Bella Cantika (88 / B).

---

### ACT 3: Tata Kelola Keuangan & Double-Entry Accounting (Bendahara: Bu Siti)
**Tujuan**: Memperlihatkan kepatuhan sistem terhadap kaidah akuntansi baku (Debit = Credit), bebas selisih, dan transparan.

1. **Beralih ke Akun Bendahara**:
   - Ganti persona ke `Siti Rahmawati, S.E (Bendahara TU)`.
2. **Audit Piutang & Status Tagihan**:
   - Buka menu **Keuangan** ➔ Tab **Tagihan Siswa (Invoices)**.
   - Tunjukkan dua invoice SPP:
     - `INV/2026/10/0001` (Andi Pratama) ➔ Status: `Paid` (Lunas).
     - `INV/2026/10/0002` (Bella Cantika) ➔ Status: `Not Paid` (Belum Bayar, Residual: Rp 500.000).
3. **Catat Pembayaran Baru**:
   - Klik tab **Pembayaran (Payments)** ➔ Klik **Catat Pembayaran**.
   - Masukkan pembayaran pelunasan untuk tagihan Bella Cantika via Kasir/Bank.
   - Simpan, dan tunjukkan residual invoice Bella otomatis berkurang menjadi 0 (Paid).
4. **Verifikasi Trial Balance (Neraca Saldo)**:
   - Klik tab **Laporan Trial Balance**.
   - Buktikan bahwa total Debit = total Credit secara presisi tanpa selisih.

---

### ACT 4: Transparansi untuk Siswa & Wali (Andi Pratama & Pak Joko)
**Tujuan**: Menampilkan kepuasan pengalaman murid & wali murid dalam memantau hasil belajar dan administrasi sekolah secara mandiri.

1. **Beralih ke Akun Siswa (Andi Pratama)**:
   - Ganti akun ke `Andi Pratama (Siswa)`.
2. **Buka Rapor Digital**:
   - Akses tab **Rapor Digital**.
   - Tunjukkan kompilasi nilai otomatis UTS Ganjil:
     - Matematika Wajib: 92 (A)
     - Fisika Dasar: 86 (B)
     - Rata-rata Nilai: 89.0
3. **Cek Rekap Kehadiran & Status Tagihan**:
   - Konfirmasi kehadiran Andi 100% hadir pada presensi mingguan.
   - Konfirmasi status SPP Oktober sudah berstatus Lunas tanpa tunggakan.

---

## 4. Perintah Seed & Reset Demo

Tersedia skrip otomatis di [`package.json`](file:///D:/development/erp-school/package.json) untuk mengelola data demo kapan saja:

### Lingkungan Lokal (Local D1 SQLite)
- **Reset & Masukkan Ulang Data Demo (Clean Slate + Seed)**:
  ```bash
  npm run db:demo:reset
  ```
- **Hanya Masukkan Data Demo (Seed)**:
  ```bash
  npm run db:seed:local
  ```
- **Hanya Bersihkan Seluruh Data Demo (Reset)**:
  ```bash
  npm run db:reset:local
  ```

### Lingkungan Produksi / Remote Cloudflare D1
- **Reset & Masukkan Ulang Data Demo Remote**:
  ```bash
  npm run db:demo:reset:remote
  ```
- **Hanya Masukkan Data Demo Remote**:
  ```bash
  npm run db:seed:remote
  ```

---

## 5. Checklist Kesiapan Sebelum Demo

- [x] Database lokal/remote Cloudflare D1 telah dieksekusi seeder terbaru (`src/db/seed.sql`).
- [x] Jalankan verifikasi kode: `npm run typecheck` (0 error).
- [x] Jalankan rangkaian unit test otomatis: `npm test` (Seluruh 9 test file / 51 test lolos).
- [x] Server dev aktif di terminal: `npm run dev` (port default `8787`).
