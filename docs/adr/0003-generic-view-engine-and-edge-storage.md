# ADR 0003: Odoo-Inspired Generic View Engine and Cloudflare Edge Integration

- **Status**: Accepted
- **Date**: 2026-10-26

## Context
UX Odoo didasarkan pada keseragaman tampilan antar modul (List, Kanban, Form) dengan ControlPanel cerdas (Search, Filter, Group By). Implementasi custom per-halaman secara manual akan menyebabkan duplikasi kode yang masif.

## Decision
1. **Generic View Architecture**:
   - Membangun abstraction layer reusable (`DataTableList`, `KanbanBoard`, `FormSheetView`, `ControlPanelFilter`) menggunakan Tailwind CSS dan shadcn/ui.
   - Definisi kolom, filter facet, group-by keys, dan action bar diatur melalui schema definition deklaratif per entitas domain.
2. **Edge Media & Storage via Cloudflare R2**:
   - Upload dokumen rapor, foto profil, dan lampiran bukti pembayaran diproses via streaming worker handler langsung ke Cloudflare R2 bucket.
   - Metadata file dan URL publik/private tersimpan terhubung di D1.
3. **Database Concurrency & Batch Processing**:
   - D1 write transactions menggunakan Drizzle ORM batch statements (`db.batch([...])`) untuk memastikan batch generation (seperti pembuatan ratusan invoice SPP atau presensi siswa sekelas) berjalan dalam 1 roundtrip tanpa thread-lock.

## Consequences
- Kecepatan pengembangan UI meningkat drastis (fitur CRUD baru hanya butuh definisi skema view).
- Performa UI di edge sangat snappy dengan waktu muat sub-100ms.
