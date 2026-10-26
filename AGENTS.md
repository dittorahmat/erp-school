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
- Wajib jalankan `npm run typecheck` dan `npm run test` sebelum commit atau merge ke `main`.
- Kolom SQL D1 wajib berformat `snake_case`, cocokkan dengan pemetaan `drizzle-orm` di `src/db/schema.ts`.
- Transaksi akuntansi wajib berimbang Debit = Credit (`/api/finance/trial-balance`).
- Deploy live Cloudflare Workers menggunakan `npm run deploy` via Wrangler.
