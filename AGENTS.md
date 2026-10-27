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
- **Deep Modules & Clean Seams (Anti Shallow Controllers)**:
  - **MANDAT KETAT**: Route handlers HTTP (`src/routes/`) WAJIB berupa adapter tipis (thin HTTP adapters). Seluruh aturan bisnis, invarian balancing (debit = credit), kompilasi batch relasional D1, kalkulasi agregat/tally, dan validasi status WAJIB berada di dalam **Deep Domain Modules** (`src/domain/`).
  - Dilarang keras mengimpor `drizzle-orm/d1` langsung di dalam file `src/routes/*`. Seluruh interaksi database harus didelegasikan ke modul `src/domain/*`.
  - Seluruh route handlers HTTP (`src/routes/*`) WAJIB mengimpor domain symbols secara strictly terpusat dari single seam index `../domain`. Guardrail ini ditegakkan secara mekanis via `tests/architecture-guardrail.test.ts`.
  - Seluruh modul domain WAJIB diekspor terpusat melalui `src/domain/index.ts` sebagai single seam index.
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
- **Arsitektur Pemisahan Kode UI & React Monolith Guardrail**:
  - Dilarang menumpuk ribuan baris HTML/JS interaktif di dalam template literal file server (`src/index.ts`).
  - Frontend SPA berbasis **React + Vite** di folder `frontend/` menyajikan UI type-safe yang terkompilasi ke `dist/client`.
  - Cloudflare Workers Static Assets binding (`assets: { directory: "./dist/client", html_handling: "single-page-application", not_found_handling: "single-page-application" }`) wajib dikonfigurasi di `wrangler.jsonc` untuk menyajikan SPA secara native tanpa CORS.
  - Seluruh tombol create/modal WAJIB merender form fungsional nyata ke API D1; dilarang keras menaruh fallback nama/data hardcoded (e.g. ternary fallback dummy string).
- **Pemeriksaan & Build Wajib**:
  - Wajib jalankan `npm run build`, `npm run typecheck`, dan `npm run test` sebelum commit atau merge ke `main`.
  - Kolom SQL D1 wajib berformat `snake_case`, cocokkan dengan pemetaan `drizzle-orm` di `src/db/schema.ts`.
  - Transaksi akuntansi wajib berimbang Debit = Credit (`/api/finance/trial-balance`).
- **Anti-Regression Guardrails untuk Modul Akuntansi & Payroll**:
  - **MANDAT KETAT**: Dilarang menggunakan ID akun hardcoded sembarangan (seperti `coa_exp_salary`, `coa_cash`) saat posting jurnal otomatis. Wajib menyelesaikan ID akun secara dinamis melalui helper resolver COA sekolah atau memvalidasi keberadaan akun di `chart_of_accounts`.
  - **Jurnal Beban Gaji Wajib Bruto**: Jurnal penggajian wajib membukukan `Debit: Beban Gaji = Total Gross` dan `Credit: Kas/Bank = Total Net`, serta `Credit: Utang Potongan/Pihak Ketiga = Total Deductions` jika terdapat potongan, sehingga selalu berimbang Total Debit == Total Credit.
  - **Validasi Keunikan & Proteksi Akun COA**: Pembuatan akun baru wajib memvalidasi keunikan kode per sekolah (`school_id` + `code`), dan akun yang sudah memiliki mutasi pada `account_move_lines` dilarang dihapus atau diubah kode/klasifikasinya.
  - **Larangan Hardcoded Tenant Fallback di Rute**: Dilarang menyematkan string sekolah hardcoded (seperti `school_sma_hb`) sebagai fallback di dalam file `src/routes/*`. Tenant ID wajib didapatkan secara eksplisit dari header, query, body, atau token session.
- **Domain Integration & Client Rules Pointer**:
  - Untuk aturan lengkap mengenai canonical parameter domain module, multi-child portal fallback, preview batch invoicing, dan isolasi domain frontend: **lihat `CODING_STANDARDS.md` §7 & §8**.
