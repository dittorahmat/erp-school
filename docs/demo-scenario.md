# Skenario Demo End-to-End (E2E) — ERP Sekolah

Dokumen ini adalah panduan resmi skenario demo interaktif ERP Sekolah (berbasis Cloudflare Workers D1 + Hono + Odoo-style SPA). Panduan ini dirancang untuk mendemokan kapabilitas sistem dari hulu ke hilir menggunakan pendekatan **Multi-Persona Journey** pada Tahun Ajaran Aktif **2026/2027**.

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
**Tujuan**: Memperlihatkan fondasi operasional sekolah yang terstruktur dan terintegrasi multi-tenant dengan populasi siswa dan rombel yang hidup.

1. **Akses Dashboard**:
   - Buka aplikasi ERP Sekolah (`http://localhost:8787` atau domain deployment).
   - Pastikan login sebagai `admin@sekolah.demo` (Bambang Sudarmono, M.Pd).
   - Tunjukkan kartu metrik utama: Siswa Aktif (10 siswa), Total Rombel (3 kelas: `X-MIPA-1`, `X-MIPA-2`, `XI-MIPA-1`), dan Status Keuangan Berjalan.
2. **Kelola Struktur Akademik & Siswa**:
   - Klik menu **Akademik** ➔ Tunjukkan Tahun Ajaran aktif `2026/2027`, Semester Ganjil, dan Mata Pelajaran Kurikulum Merdeka (Matematika, Fisika, Kimia, Biologi, B. Inggris).
   - Klik menu **Siswa** ➔ Buka daftar siswa terdaftar, perlihatkan data lengkap Andi Pratama, Bella Cantika, Citra Kirana, Dimas Anggara, dan siswa lainnya.
3. **Audit Inventaris & Aset Sekolah**:
   - Klik menu **Inventaris** ➔ Tab **Produk & Aset**.
   - Sorot variasi inventaris:
     - *Aset*: `Laptop Laboratorium Asus ExpertBook i5` (`SN-ASUS-2026-8819`) dan `Proyektor Epson EB-E500`.
     - *Barang Habis Pakai (Consumable)*: Kertas HVS A4 80gr dan Spidol Whiteboard Snowman.
     - *Barang Stok (Storable)*: Seragam Kemeja Putih Abu-Abu dan Buku Paket Kurikulum Merdeka.
   - Tunjukkan riwayat pergerakan stok penerimaan awal (*Stock Picking* `WH/IN/0001`) dan transfer internal ke Lab Komputer (`WH/INT/0001`).

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
   - Tunjukkan riwayat presensi yang bervariasi:
     - Sesi `2026-10-26`: 4 Hadir (100% tepat waktu).
     - Sesi `2026-10-20`: 3 Hadir, 1 Sakit (Bella Cantika surat dokter terlampir).
     - Sesi `2026-10-19`: 3 Hadir, 1 Izin (Dimas Anggara izin acara keluarga).
   - Klik tombol **Buat Sesi Presensi Baru** untuk mendemokan form interaktif pencatatan presensi real-time.
4. **Input Nilai Ujian (Gradebook)**:
   - Klik menu **Ujian & Penilaian**.
   - Tunjukkan sesi ujian `UTS Semester Ganjil Matematika Wajib` (KKM 75).
   - Perlihatkan daftar nilai: Andi Pratama (92 / A), Bella Cantika (88 / B), Citra Kirana (85 / B), dan Dimas Anggara (91 / A).

---

### ACT 3: Tata Kelola Keuangan & Double-Entry Accounting (Bendahara: Bu Siti)
**Tujuan**: Memperlihatkan kepatuhan sistem terhadap kaidah akuntansi baku (Debit = Credit), bebas selisih, dan transparan.

1. **Beralih ke Akun Bendahara**:
   - Ganti persona ke `Siti Rahmawati, S.E (Bendahara TU)`.
2. **Audit Piutang & Status Tagihan**:
   - Buka menu **Keuangan** ➔ Tab **Tagihan Siswa (Invoices)**.
   - Tunjukkan variasi tagihan multi-jenis:
     - `INV/2026/10/0001` (Andi Pratama - SPP) ➔ Status: `Paid` (Lunas).
     - `INV/2026/10/0002` (Bella Cantika - SPP) ➔ Status: `Not Paid` (Belum Bayar, Residual: Rp 500.000).
     - `INV/2026/09/0005` (Erik Setiawan - Uang Pangkal/Gedung Rp 3.500.000) ➔ Status: `Paid`.
     - `INV/2026/09/0006` (Fani Rahmawati - Paket Seragam Rp 450.000) ➔ Status: `Paid`.
3. **Catat Pembayaran Baru**:
   - Klik tab **Pembayaran (Payments)** ➔ Klik **Catat Pembayaran**.
   - Masukkan pembayaran pelunasan untuk tagihan Bella Cantika via Kasir/Bank BCA.
   - Simpan, dan tunjukkan residual invoice Bella otomatis berkurang menjadi 0 (Paid).
4. **Verifikasi Trial Balance (Neraca Saldo)**:
   - Klik tab **Laporan Trial Balance**.
   - Buktikan bahwa total Debit = total Credit secara presisi tanpa selisih (Balanced).

---

### ACT 4: Transparansi untuk Siswa & Wali (Andi Pratama & Pak Joko)
**Tujuan**: Menampilkan kepuasan pengalaman murid & wali murid dalam memantau hasil belajar dan administrasi sekolah secara mandiri.

1. **Beralih ke Akun Siswa (Andi Pratama)**:
   - Ganti akun ke `Andi Pratama (Siswa)`.
2. **Buka Rapor Digital**:
   - Akses tab **Rapor Digital**.
   - Tunjukkan kompilasi nilai otomatis UTS Ganjil 2026/2027:
     - Matematika Wajib: 92 (A)
     - Fisika Dasar: 86 (B)
     - Kimia Analitik: 90 (A)
     - Biologi Umum: 88 (B)
     - Rata-rata Nilai: 89.0 (Status: Tuntas)
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
- [x] Jalankan rangkaian unit & E2E integration test otomatis: `npm test` (Seluruh 10 test file / 65 test lolos, termasuk `tests/e2e-demo-scenario.test.ts`).
- [x] Server dev aktif di terminal: `npm run dev` (port default `8787`).
