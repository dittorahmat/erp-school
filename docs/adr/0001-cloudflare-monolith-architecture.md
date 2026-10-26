# ADR 0001: Monolith Edge Architecture on Cloudflare Stack

- **Status**: Accepted
- **Date**: 2026-10-26

## Context
Aplikasi ERP Sekolah terinspirasi dari Odoo dan OpenEduCat, membutuhkan UX yang sangat responsif, layout interaktif ala Odoo (Views: List, Kanban, Form, ControlPanel filter/groupby), manajemen relasional terstruktur (akademik, akuntansi debit-kredit, inventaris stok), otentikasi komprehensif, dan media storage.
Persyaratan teknis menetapkan arsitektur **full monolith di ekosistem Cloudflare**.

## Decision
1. **Fullstack Framework**: Menggunakan **React Router v7 (atau TanStack Start)** yang berjalan di atas Cloudflare Workers, menyediakan server-side rendering (SSR), API route handlers / RPC dalam satu bundle terpadu.
2. **Database & ORM**: Menggunakan **Cloudflare D1** (SQLite edge distributed) dengan **Drizzle ORM** untuk schema definition yang type-safe, migration tooling, dan performa query latency rendah.
3. **Object Storage**: Menggunakan **Cloudflare R2** via S3-compatible binding untuk penyimpanan dokumen rapor, foto profil siswa/guru, attachment invoice, dan bukti transfer.
4. **Authentication**: Menggunakan **Better-Auth** dengan D1 adapter dan session cookies terenkripsi, mendukung RBAC multi-role (`superadmin`, `school_admin`, `teacher`, `student`, `guardian`, `accountant`).
5. **Accounting Engine**: Mengadopsi prinsip double-entry bookkeeping murni ala Odoo (`account_move` dan `account_move_line`) dengan jurnal terpisah (Sale, Cash, Bank, General) untuk menjamin akurasi audit keuangan sekolah.
6. **Inventory Tracking**: Mengadopsi double-entry inventory ala Odoo (`stock_move` dan `stock_picking`) dengan lokasi sumber dan tujuan untuk tracking seragam, ATK, buku pelajaran, dan aset lab.

## Consequences
- **Positif**:
  - Deploy zero-cold-start di jaringan global Cloudflare.
  - Tidak ada overhead jaringan terpisah antara backend API dan frontend UI (single monolithic edge execution).
  - Skema data type-safe dari database hingga komponen UI.
  - Biaya operasional sangat terjangkau (gratis/sangat murah pada batas free tier Cloudflare Workers, D1, dan R2).
- **Trade-offs / Mitigasi**:
  - Cloudflare D1 berbasis SQLite memiliki batasan transaksi konkurensi write. Mitigasi: Desain batch writes dan atomic transaction ringkas di Drizzle ORM.
  - Ukuran bundle Workers memiliki batas script size (10MB compressed). Monolith harus menjaga modularitas dan tree-shaking dengan baik.
