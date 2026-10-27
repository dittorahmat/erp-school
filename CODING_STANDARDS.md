# Coding Standards & Quality Guardrails

## 1. Prinsip Utama (YAGNI & One-Liner Solutions)
- **Implement YAGNI, prefer one liner solutions**:
  - Dilarang membuat abstraksi kompleks sebelum diperlukan secara nyata.
  - Prioritaskan fungsi murni sederhana atau one-liner yang mudah dibaca (misal di `src/lib/utils.ts` untuk ID generation atau kalkulasi grade).
  - Hindari boilerplate berulang dan duplikasi inline logic antar router.

## 2. UI Fungsionalitas Nyata (Strict Anti-Mockup Rule)
- **Konektivitas Dinamis Wajib**:
  - Halaman antarmuka pengguna dilarang keras meninggalkan link statis (`<a href="#...">`) atau teks data mati yang tidak terhubung dengan database.
  - Setiap pergantian tab/menu navigasi harus memanggil API backend (`/api/...`) dan merender data riil yang tersimpan di Cloudflare D1.
- **Interaktivitas User & Form Persistence**:
  - Tombol navigasi, tombol "Buat Baru", modal simpan form, filter, dropdown user profil, tombol aksi tabel, dan fungsionalitas **Logout / Switch Account** wajib dapat diklik dan berfungsi nyata.
  - Setiap aksi simpan modal WAJIB mengirim payload via `fetch('/api/...', { method: 'POST' })` langsung ke endpoint database Cloudflare D1.
- **Pemisahan Berkas UI**:
  - Template antarmuka wajib diisolasi di direktori `src/views/` (misal: `src/views/shell.ts`), tidak digabung secara mentah di dalam file server router `src/index.ts` untuk menghindari error parsing nested backticks / template literals.

## 3. Drizzle ORM & Cloudflare D1
- **Schema Mapping**:
  - Di TypeScript: gunakan `camelCase` untuk property name (misal: `avatarUrl`, `academicYearId`).
  - Di SQLite D1: selalu petakan ke `snake_case` secara eksplisit pada definisi kolom (misal: `text('avatar_url')`, `text('academic_year_id')`).
- **SQL Seeder Integrity**:
  - File SQL manual (seperti `src/db/seed.sql`) **wajib menggunakan nama kolom SQL fisik (`snake_case`)**, bukan nama properti TypeScript.
- **Batch Processing Wajib**:
  - Semua operasi penulisan relasional yang melibatkan header + detail/lines (invoice + account moves, attendance sheet + lines, stock picking + stock moves) **WAJIB menggunakan `await db.batch([...])`** agar dieksekusi secara atomik dalam satu roundtrip ke Cloudflare D1.

## 4. Double-Entry Accounting
- Semua transaksi yang memengaruhi neraca (Invoice, Pembayaran, Pembelian Stok) wajib membuat pasangan baris jurnal di `account_move_lines` dengan **Total Debit == Total Credit**.
- Sebelum push atau deploy, pastikan endpoint `/api/finance/trial-balance` mengonfirmasi `isBalanced: true`.

## 5. Double-Entry Inventory
- Setiap pergerakan stok barang (`stock_moves`) harus mencatat `location_id` (lokasi asal) dan `location_dest_id` (lokasi tujuan). Tidak diperbolehkan membuat mutasi tanpa lokasi asal/tujuan yang valid.

## 6. Automated Guardrails
- Jalankan `npm run typecheck` (`tsc --noEmit`) dan `npm run test` (`vitest run`) sebagai langkah verifikasi wajib sebelum setiap commit dan push ke remote repository.

## 7. Client-Side Domain Isolation & View Completeness
- **MANDAT KETAT**: Dilarang keras meng-generate format sekuensial penomoran dokumen akuntansi/inventaris (seperti `INV/YYYY/...`), ID akun general ledger, atau ID jurnal secara acak di sisi frontend client. Biarkan domain backend yang menentukan fallback dan sequence generation secara sentral.
- **Dynamic Tenant Sourcing**: Sourcing tenant ID wajib dinamis dari profil aktif pengguna (`currentUser.schoolId`), dilarang menaruh string hardcoded tenant di payload transaksi client.
- **Relational View Fetching & Options Completeness**: Setiap modal yang membutuhkan relasi ke entitas lain (misal modal Finance butuh daftar Siswa) WAJIB memastikan dataset entitas tersebut di-fetch pada siklus `fetchData()` view tersebut, lengkap dengan placeholder default `<option value="" disabled>-- Pilih Entitas --</option>`.
- **UI State Lookup Standard**: Dilarang keras mengoper entire stale object ke dalam state setter (`handleEdit(item)`). Wajib mengoper ID item saja (`handleEdit(item.id)`) dan mengambil datanya dari state list atau query API berdasarkan ID.
- **HTML Date Inputs**: Seluruh input form tanggal wajib menggunakan native `<input type="date">` untuk menjamin format ISO 8601 YYYY-MM-DD yang valid dan konsisten.
- **Dual-Entity Modules View Completeness**: View yang mengelola master entitas berpasangan atau berkorelasi kuat (seperti Modul Akademik: Tahun Ajaran + Mata Pelajaran / Kurikulum) WAJIB menyediakan antarmuka manajemen UI lengkap untuk kedua entitas tersebut, bukan hanya salah satunya.

## 8. Domain Integration & Service Seams (Odoo / OpenEduCat Model)
- **Canonical D1 Parameter Signature & Types**:
  - Seluruh fungsi di modul domain (`src/domain/*`) WAJIB menerima canonical `db: D1Database | any` (dan optional `rawDb?: D1Database`) serta strongly-typed parameter interface.
  - Dilarang membocorkan loose signature seperti `(db: any, rawDb: D1Database)` yang memaksa adapter route memisahkan atau membungkus D1 context secara redundan.
- **Mandatory Use of Single Seam Index (`../domain`)**:
  - Seluruh route handlers HTTP (`src/routes/*`) WAJIB mengimpor domain symbols secara strictly terpusat dari single seam index `../domain` (bukan `../domain/admission`, `../domain/fees`, atau file modular parsial lainnya). Aturan ini ditegakkan secara mekanis via `tests/architecture-guardrail.test.ts`.
- **Multi-Child Guardian Fallback in Portal Queries**:
  - Jika seorang wali murid (guardian) memiliki beberapa anak terkait dan `targetStudentId` tidak dispesifikasikan dalam query parameter, domain `assertPortalAccess` dan router portal WAJIB secara aman fallback ke anak pertama yang terhubung (`scope.studentIds[0]`) tanpa melempar HTTP 403 Forbidden.
- **Invoicing Preview Requirement Before Batch Postings**:
  - Seluruh alur batch fee invoicing di frontend WAJIB menyajikan tahapan pratinjau (preview modal / confirmation dialog) yang menampilkan jumlah siswa eligible teridentifikasi dan total estimasi nominal rupiah sebelum mengeksekusi operasi posting ke D1 database.
