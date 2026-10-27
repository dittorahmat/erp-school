## What to build
Menghadirkan invoice multi-periode (SPP bulan berjalan & lampau, tagihan Uang Gedung/Pangkal, dan Seragam) dengan variasi status (`paid`, `not_paid`), bukti pembayaran kas/bank, dan jurnal akuntansi `account_move_lines` yang menjamin Total Debit = Total Credit seimbang secara presisi.

## Acceptance criteria
- [ ] Tab Invoices menampilkan transaksi dengan status bervariasi (`paid`, `not_paid`).
- [ ] Tab Payments memuat riwayat pembayaran via Kas dan Bank BCA.
- [ ] Verifikasi `/api/finance/trial-balance` menghasilkan status `isBalanced: true` dengan selisih 0.

## Blocked by
- #2 (Master Academic & Student Population Expansion)
