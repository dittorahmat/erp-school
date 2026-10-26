# Coding Standards & Guidelines

## 1. Drizzle ORM & Cloudflare D1 Concurrency
- **Schema Mapping**:
  - Di TypeScript: gunakan `camelCase` untuk property name (misal: `avatarUrl`, `academicYearId`).
  - Di SQLite D1: selalu petakan ke `snake_case` secara eksplisit pada definisi kolom (misal: `text('avatar_url')`, `text('academic_year_id')`).
- **SQL Seeder Integrity**:
  - File SQL manual (seperti `src/db/seed.sql`) **harus menggunakan nama kolom SQL fisik (`snake_case`)**, bukan nama properti TypeScript.
- **Batch Processing**:
  - Gunakan `db.batch([...])` untuk transaksi multi-baris (seperti pembuatan invoice SPP atau presensi kelas) agar dieksekusi secara atomik dalam 1 roundtrip.

## 2. Double-Entry Accounting
- Semua transaksi yang memengaruhi neraca (Invoice, Pembayaran, Pembelian Stok) wajib membuat pasangan baris jurnal di `account_move_lines` dengan **Total Debit == Total Credit**.
- Sebelum push atau deploy, pastikan endpoint `/api/finance/trial-balance` mengonfirmasi `isBalanced: true`.

## 3. Double-Entry Inventory
- Setiap pergerakan stok barang (`stock_moves`) harus mencatat `location_id` (lokasi asal) dan `location_dest_id` (lokasi tujuan). Tidak diperbolehkan membuat mutasi tanpa lokasi asal/tujuan yang valid.

## 4. Testing
- Gunakan `npm run test` (`vitest run`) dan `npm run typecheck` (`tsc --noEmit`) sebagai guardrail wajib sebelum commit.
