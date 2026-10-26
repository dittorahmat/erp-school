# ADR 0002: Double-Entry Accounting and Inventory Subsystems

- **Status**: Accepted
- **Date**: 2026-10-26

## Context
Sistem ERP Sekolah membutuhkan akurasi tinggi dalam pencatatan keuangan (SPP, uang masuk, kas/bank) dan inventaris fisik (buku pelajaran, seragam, ATK, aset laboratorium). Pendekatan Odoo terbukti menjadi standar industri terbaik melalui double-entry bookkeeping untuk keuangan dan double-entry movement untuk inventaris.

## Decision
1. **Double-Entry Financial Accounting**:
   - Struktur entitas mengadopsi tabel `account_move` (Journal Entry) dan `account_move_line` (Journal Items).
   - Setiap invoice siswa (`out_invoice`) dan pembayaran (`account_payment`) wajib menghasilkan baris berimbang (Total Debit = Total Credit).
   - Siklus hidup dokumen mengikuti state: `draft` -> `posted` -> `reconciled` / `cancelled`.
   - Batch invoice bulanan dijalankan secara atomik melalui `db.batch()` di Cloudflare D1.

2. **Double-Entry Stock/Inventory Management**:
   - Struktur entitas mengadopsi `stock_location`, `stock_picking`, dan `stock_move`.
   - Perpindahan barang selalu memindahkan kuantitas dari lokasi sumber ke lokasi tujuan (misal: Vendor -> Gudang, atau Gudang -> Siswa/Kelas).
   - Mendukung pelacakan nomor seri (serial number) untuk aset bernilai tinggi (laptop/proyektor) dan penyesuaian stok opname (*inventory adjustment*).

## Consequences
- **Positif**:
  - Audit trail yang tidak terbantahkan untuk auditor yayasan dan dinas pendidikan.
  - Nilai buku kas, piutang siswa, dan kuantitas stok barang selalu mencerminkan data riil tanpa anomali desinkronisasi.
  - Arsitektur siap diskalakan ke modul kompleks lainnya (Procurement, Point of Sale Kantin).
- **Trade-offs / Mitigasi**:
  - Sedikit overhead pada jumlah baris database yang disimpan di D1. Mitigasi: indeks relasional yang tepat pada `account_id`, `move_id`, `product_id`, dan `location_id`.
