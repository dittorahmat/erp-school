# Agent Guidelines

## Agent skills

### Issue tracker

Issues and specs live on **GitHub Issues** ([dittorahmat/erp-school](https://github.com/dittorahmat/erp-school)). See `docs/agents/issue-tracker.md`. Use `gh issue` CLI to inspect, create, and manage tickets.

### Triage labels

Canonical roles mapped 1:1 (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.

### Coding standards & Quality Guardrails

- Coding standards: see `CODING_STANDARDS.md`.
- **Wajib Audit Anti-AI-Slop via `design-taste-frontend`**:
  - **MANDAT KETAT**: Setiap penambahan, pembaruan, atau refactoring komponen dan antarmuka frontend (`src/views/`, layout HTML, styling CSS) **WAJIB diaudit menggunakan skill `design-taste-frontend`** (`node <skill>/scripts/inspect.mjs --app <url>`).
  - Dilarang keras membiarkan pola AI-slop template generik:
    - Banned: Ikon di dalam kotak/lingkaran berwarna-warni (*tinted icon chips*).
    - Banned: Gradien neon berlebihan, glow artifisial, dan angka vanity tanpa arti data.
    - Banned: Horizontal scroll/overflow di berbagai ukuran layar (desktop 1440px, tablet 768px, mobile 390px).
    - Banned: Teks kontras rendah (harus memenuhi standar rasio kontras WCAG >= 4.5:1).
  - Setiap perubahan UI harus lulus audit meter dengan status **0 FAIL**.
- **Wajib UI Fungsional Nyata (Anti-Mockup Statis)**:
  - DILARANG menyajikan HTML statis dengan dummy hardcoded data di deployment akhir.
  - Setiap view / tab / menu WAJIB terhubung secara dinamis via API (`fetch('/api/...')`) ke database Cloudflare D1.
  - Setiap menu navigasi, tombol buat baru, filter, aksi baris tabel, dan avatar profil WAJIB memiliki event handler interaktif yang berfungsi (termasuk fitur logout dan switch account).
- **Arsitektur Pemisahan Kode UI**:
  - Dilarang menumpuk ribuan baris HTML/JS interaktif di dalam template literal file server (`src/index.ts`).
  - Selalu pisahkan ke dalam folder view modular (`src/views/`) agar terhindar dari syntax/parsing error template string nested backticks.
- **Pemeriksaan & Build Wajib**:
  - Wajib jalankan `npm run typecheck` dan `npm run test` sebelum commit atau merge ke `main`.
  - Kolom SQL D1 wajib berformat `snake_case`, cocokkan dengan pemetaan `drizzle-orm` di `src/db/schema.ts`.
  - Transaksi akuntansi wajib berimbang Debit = Credit (`/api/finance/trial-balance`).
  - Deploy live Cloudflare Workers menggunakan `npm run deploy` via Wrangler.
