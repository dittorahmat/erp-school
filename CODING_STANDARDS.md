# Coding Standards & Quality Guardrails

## 1. UI Fungsionalitas Nyata (Strict Anti-Mockup Rule)
- **Konektivitas Dinamis Wajib**:
  - Halaman antarmuka pengguna dilarang keras meninggalkan link statis (`<a href="#...">`) atau teks data mati yang tidak terhubung dengan database.
  - Setiap pergantian tab/menu navigasi harus memanggil API backend (`/api/...`) dan merender data riil yang tersimpan di Cloudflare D1.
- **Interaktivitas User & Auth**:
  - Tombol navigasi, tombol "Buat Baru", filter, dropdown user profil, tombol aksi tabel, dan fungsionalitas **Logout / Switch Account** wajib dapat diklik dan berfungsi nyata.
- **Pemisahan Berkas UI**:
  - Template antarmuka wajib diisolasi di direktori `src/views/` (misal: `src/views/shell.ts`), tidak digabung secara mentah di dalam file server router `src/index.ts` untuk menghindari error parsing nested backticks / template literals.

## 2. Drizzle ORM & Cloudflare D1
- **Schema Mapping**:
  - Di TypeScript: gunakan `camelCase` untuk property name (misal: `avatarUrl`, `academicYearId`).
  - Di SQLite D1: selalu petakan ke `snake_case` secara eksplisit pada definisi kolom (misal: `text('avatar_url')`, `text('academic_year_id')`).
- **SQL Seeder Integrity**:
  - File SQL manual (seperti `src/db/seed.sql`) **wajib menggunakan nama kolom SQL fisik (`snake_case`)**, bukan nama properti TypeScript.
- **Batch Processing**:
  - Gunakan `db.batch([...])` untuk transaksi multi-baris (seperti pembuatan invoice SPP atau presensi kelas) agar dieksekusi secara atomik dalam 1 roundtrip.

## 3. Double-Entry Accounting
- Semua transaksi yang memengaruhi neraca (Invoice, Pembayaran, Pembelian Stok) wajib membuat pasangan baris jurnal di `account_move_lines` dengan **Total Debit == Total Credit**.
- Sebelum push atau deploy, pastikan endpoint `/api/finance/trial-balance` mengonfirmasi `isBalanced: true`.

## 4. Double-Entry Inventory
- Setiap pergerakan stok barang (`stock_moves`) harus mencatat `location_id` (lokasi asal) dan `location_dest_id` (lokasi tujuan). Tidak diperbolehkan membuat mutasi tanpa lokasi asal/tujuan yang valid.

## 5. Automated Guardrails
- Jalankan `npm run typecheck` (`tsc --noEmit`) dan `npm run test` (`vitest run`) sebagai langkah verifikasi wajib sebelum setiap commit dan push ke remote repository.
