## What to build
Menambah variasi katalog inventaris sekolah (ATK consumable seperti Kertas HVS & Spidol, buku paket mapel lain, dan aset lab), disertai dokumen mutasi pergerakan stok penerimaan vendor (`incoming`) dan pengeluaran/penyerahan seragam/ATK (`delivery`/`internal`).

## Acceptance criteria
- [ ] Katalog produk inventaris memiliki variasi tipe `storable`, `consumable`, dan `asset`.
- [ ] Mutasi stok mencakup transaksi `stock_pickings` dan `stock_moves` incoming & internal/delivery.
- [ ] Tab Produk & Stok di frontend menampilkan level stok yang akurat.

## Blocked by
- #1 (Academic Year Dynamic Resolution & Schema Alignment)
