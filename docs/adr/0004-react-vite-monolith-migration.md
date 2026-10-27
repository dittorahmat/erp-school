# ADR 0004: Migration from Raw HTML String Template to React Vite Monolith with Cloudflare Static Assets

- **Status**: Accepted
- **Date**: 2026-10-27

## Context
Aplikasi ERP Sekolah sebelumnya menyajikan tampilan Odoo-style Single Page Application (SPA) melalui template literal string mentah di `src/views/shell.ts` yang dikirim langsung oleh router Hono pada root path `/`. 

Pendekatan string template ini menimbulkan masalah kritis:
1. **Tidak Ada Validasi Sintaks pada Markup**: TypeScript hanya memvalidasi template sebagai tipe `string`, sehingga kesalahan sintaksis, penutupan tag yang salah, atau typo atribut lolos tanpa peringatan saat kompilasi (`typecheck`).
2. **Kerapuhan String Escaping (SyntaxError di Klien)**: Injeksi inline onclick handler dan manipulasi string bertingkat (`navigate(\\'view\\')`, newline `\n` dalam string alert) memicu `SyntaxError: Invalid or unexpected token` pada browser klien, menyebabkan seluruh eksekusi JavaScript runtime terhenti dan halaman tampak kosong.
3. **DX & Maintainability Rendah**: Tidak adanya autocomplete JSX, linting komponen, atau proteksi XSS otomatis membuat pengembangan fitur interaktif semakin lambat dan berisiko regresi.

## Decision
1. **Migrasi Frontend ke React + Vite**:
   - Membangun antarmuka frontend berbasis **React + Vite** di folder terisolasi `frontend/`.
   - Menggunakan Tailwind CSS untuk styling yang konsisten dengan estetika tema Odoo (palette `#714B67`, slate border, clear hierarchy).
   - Menghubungkan seluruh interaksi UI ke REST API Hono yang sudah ada (`/api/*`) tanpa mengubah kontrak data atau skema D1.
2. **Arsitektur Monolith Tetap Terjaga (Single Origin / Zero-CORS)**:
   - Output kompilasi Vite diarahkan ke `dist/client`.
   - Konfigurasi `wrangler.jsonc` menambahkan binding Cloudflare Static Assets:
     ```json
     "assets": {
       "directory": "./dist/client",
       "binding": "ASSETS",
       "html_handling": "single-page-application",
       "not_found_handling": "single-page-application"
     }
     ```
   - Cloudflare Worker tetap menjadi single entrypoint: Worker melayani `/api/*` secara dinamis dari D1, dan secara otomatis menyajikan asset frontend SPA untuk seluruh rute browser (`/`, `/students`, `/finance`, dll.).
3. **Pemisahan Perhatian (Separation of Concerns)**:
   - Backend (`src/`): Murni mengurus Deep Domain Modules (Akuntansi double-entry, inventaris, akademik, presensi, Better-Auth, D1 batching).
   - Frontend (`frontend/`): Murni menangani rendering deklaratif komponen React, visual feedback, dan state cache sisi klien.

## Consequences
- **Positif**:
  - Nol kemungkinan `SyntaxError` akibat escaping kutip manual; seluruh komponen tervalidasi pada waktu build (`vite build`).
  - Interaktivitas modular (modal form, filter control panel, data table) lebih mudah dikembangkan dan di-maintain.
  - Tetap berjalan di satu domain Cloudflare Workers monolith tanpa perlunya infrastruktur terpisah atau konfigurasi CORS tambahan.
- **Negatif / Trade-off**:
  - Menambahkan dependensi React, React DOM, dan Vite ke build pipeline.
  - Perlu menjalankan build Vite (`npm run build:client`) sebelum deploy Worker (`wrangler deploy`).
