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
- **Prinsip Utama Rekayasa Kode (YAGNI & One-Liners)**:
  - **MANDAT KETAT**: Implement YAGNI, prefer one liner solutions. Hindari over-engineering, abstraksi berlebihan yang belum diperlukan, dan duplikasi kode antar modul. Gunakan utilitas satu baris terpusat (seperti di `src/lib/utils.ts`).
- **Cloudflare D1 Multi-Statement Operations (Atomic Batching)**:
  - Setiap operasi penulisan relasional header + items/lines (misalnya invoice header + move lines, presensi sheet + attendance lines, stock picking + stock moves) **WAJIB menggunakan `await db.batch([...])`** dalam satu roundtrip ke D1, dilarang melakukan multiple inserts berurutan secara terpisah.
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
  - Setiap modal atau form create WAJIB melakukan `fetch('/api/...', { method: 'POST' })` nyata untuk persistensi data ke D1.
  - Setiap menu navigasi, tombol buat baru, filter, aksi baris tabel, dan avatar profil WAJIB memiliki event handler interaktif yang berfungsi (termasuk fitur logout dan switch account).
- **Deep Modules & Clean Seams (Anti Shallow Controllers)**:
  - **MANDAT KETAT**: Route handlers HTTP (`src/routes/`) WAJIB berupa adapter tipis (thin HTTP adapters). Seluruh aturan bisnis, invarian balancing (debit = credit), kompilasi batch relasional D1, kalkulasi agregat/tally, dan validasi status WAJIB berada di dalam **Deep Domain Modules** (`src/domain/`).
  - Dilarang keras mengimpor `drizzle-orm/d1` langsung di dalam file `src/routes/*`. Seluruh interaksi database harus didelegasikan ke modul `src/domain/*`. Guardrail ini ditegakkan secara mekanis via `tests/architecture-guardrail.test.ts`.
  - Seluruh modul domain WAJIB diekspor terpusat melalui `src/domain/index.ts` sebagai single seam index.
  - Setiap modul domain harus lolos *deletion test* dan dapat diuji secara langsung (*the interface is the test surface*) tanpa harus membungkus atau menguji via lapisan request HTTP router.
- **Arsitektur Pemisahan Kode UI**:
  - Dilarang menumpuk ribuan baris HTML/JS interaktif di dalam template literal file server (`src/index.ts`).
  - Selalu pisahkan ke dalam folder view modular (`src/views/`) agar terhindar dari syntax/parsing error template string nested backticks.
- **Pemeriksaan & Build Wajib**:
  - Wajib jalankan `npm run typecheck` dan `npm run test` sebelum commit atau merge ke `main`.
  - Kolom SQL D1 wajib berformat `snake_case`, cocokkan dengan pemetaan `drizzle-orm` di `src/db/schema.ts`.
  - Transaksi akuntansi wajib berimbang Debit = Credit (`/api/finance/trial-balance`).
  - Deploy live Cloudflare Workers menggunakan `npm run deploy` via Wrangler.
- **UI State Lookup Standard**:
  - **MANDAT KETAT**: Dilarang keras menserialisasi seluruh objek JSON ke dalam inline onclick handler HTML (`onclick="edit(${JSON.stringify(item)})"`).
  - Wajib mengoper ID item saja (`onclick="edit('${item.id}')"`) dan mengambil datanya dari `state.cache` sisi klien atau query API berdasarkan ID.
- **HTML Date Inputs**:
  - Seluruh input form tanggal wajib menggunakan native `<input type="date">` untuk menjamin format ISO 8601 YYYY-MM-DD yang valid dan konsisten.
- **Domain Type Safety**:
  - Seluruh metode operasi create/update di domain module (`src/domain/*`) WAJIB memiliki parameter interface bertipe kuat (strongly typed), dilarang menggunakan `body: any` atau `data: any`. Gunakan utilitas compacting (`compactDefined`) untuk pembaruan parsial yang bersih tanpa boilerplate `if (x !== undefined)`.
- **Dual-Entity Modules View Completeness**:
  - View yang mengelola master entitas berpasangan atau berkorelasi kuat (seperti Modul Akademik: Tahun Ajaran + Mata Pelajaran / Kurikulum) WAJIB menyediakan antarmuka manajemen UI lengkap untuk kedua entitas tersebut, bukan hanya salah satunya.
