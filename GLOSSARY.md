# ERP Sekolah (School Management System) — Domain Glossary

Dokumen ini mendefinisikan istilah dan konsep kanonik yang digunakan dalam sistem ERP Sekolah, berbasis model Odoo & OpenEduCat.

---

## 1. Organisasi & Multi-Tenant (Multi-School)
- **Institution / Yayasan**: Entitas payung tertinggi pemegang lisensi atau organisasi induk.
- **School (Sekolah/Cabang)**: Unit institusi pendidikan operasional spesifik (misal: "SD Harapan Bangsa", "SMP Harapan Bangsa"). Setiap data transaksional dan master data terisolasi secara logis oleh `school_id`.
- **Academic Year (Tahun Ajaran)**: Periode kalender operasional akademik (misal: 2025/2026) dengan status `draft`, `active`, atau `closed`.
- **Term / Semester**: Sub-periode dalam Tahun Ajaran (misal: Semester Ganjil, Semester Genap).

---

## 2. Struktur Akademik (Academic Hierarchy)
- **Grade Level (Tingkat/Jenjang)**: Tingkat kelas pendidikan (misal: Kelas 10, Kelas 11, atau Jenjang SD 1-6).
- **Course / Program (Program Studi / Kurikulum)**: Kurikulum pendidikan yang diikuti (misal: IPA, IPS, atau Reguler).
- **Subject (Mata Pelajaran)**: Disiplin ilmu atau pelajaran terdaftar dengan kode unik dan bobot SKS/jam (misal: MAT101 - Matematika Dasar).
- **Classroom / Batch (Rombel / Kelas Belajar)**: Kelompok belajar fisik/logis siswa dalam satu Tahun Ajaran (misal: "X-IPA-1", "7-A"), memiliki Wali Kelas (Homeroom Teacher).

---

## 3. Personil & Identitas (Identity & Stakeholders)
- **User**: Entitas otentikasi (dikelola oleh Better-Auth) yang menyimpan email, password hash, dan session token.
- **Role**: Peran otorisasi sistem (`superadmin`, `school_admin`, `academic_admin`, `accountant`, `teacher`, `student`, `guardian`).
- **Student (Siswa)**: Peserta didik aktif atau alumni, memiliki nomor induk siswa (NIS / NISN), profil kontak, riwayat enrollment, dan wali.
- **Faculty / Teacher (Guru / Staf Pengajar)**: Tenaga pendidik yang dapat ditugaskan mengajar Subject tertentu, menjadi Wali Kelas, dan menginput nilai.
- **Guardian / Parent (Orang Tua / Wali)**: Kontak penanggung jawab siswa, memiliki relasi ke satu atau lebih Siswa, serta akses melihat tagihan dan absensi.
- **Enrollment**: Relasi formal penempatan Siswa ke dalam Classroom/Batch pada Tahun Ajaran dan Term tertentu.

---

## 4. Akademik Harian: Timetable & Attendance
- **Timetable Entry (Jadwal Pelajaran)**: Slot waktu (hari, jam mulai, jam selesai) pengajaran suatu Subject di Classroom oleh Teacher tertentu.
- **Attendance Sheet (Sesi Presensi)**: Lembar presensi yang dibuka per sesi pelajaran atau presensi harian per kelas.
- **Attendance Line (Baris Presensi Siswa)**: Status kehadiran per siswa (`present`, `absent`, `late`, `excused`/izin, `sick`/sakit) disertai catatan.

---

## 5. Penilaian (Examination & Grading)
- **Exam Session (Sesi Ujian/Asesmen)**: Entitas ujian (misal: UTS Matematika Semester Ganjil, Tugas 1 Fisika).
- **Grading Scale (Skala Nilai)**: Skala penilaian (misal: 0-100, atau predikat A, B, C, D) dengan batas KKM/kelulusan.
- **Grade Record (Nilai Siswa)**: Nilai mentah dan terbobot yang dicatat untuk Siswa pada Exam Session tertentu.
- **Report Card (Rapor Akademik)**: Rekapitulasi nilai akhir akumulatif per Subject untuk siswa dalam satu Term.

---

## 6. Akuntansi & Keuangan (Double-Entry Bookkeeping ala Odoo & PSAK/ISAK 35)
- **Account (Bagan Akun / Chart of Accounts - COA)**: Akun penampung nilai finansial terstruktur berbasis PSAK/ISAK 35 (`asset`, `liability`, `equity`, `income`, `expense`) dengan kode akun numerik hierarkis yang dapat dikonfigurasi dan disesuaikan oleh bendahara.
- **Journal**: Kelompok pencatatan transaksi spesifik (`Sale / Tagihan Sekolah`, `Purchase / Pembelian`, `Bank`, `Cash`, `General / Miscellaneous`, `Payroll`).
- **Journal Entry (`account.move`)**: Dokumen transaksi akuntansi berimbang (Total Debit = Total Credit) dengan status `draft` atau `posted`.
- **Journal Item (`account.move.line`)**: Baris debit atau credit individual yang terikat pada suatu Account dan Partner.
- **Student Invoice (Tagihan Biaya Siswa)**: Journal Entry bertipe `out_invoice` yang menagihkan biaya sekolah (SPP bulanan, Uang Gedung, Seragam).
- **Payment (`account.payment`)**: Pembayaran kas/bank dari wali murid atau pengeluaran sekolah yang direkonsiliasi dengan Invoice atau Bill.
- **Fee Structure / Rule**: Template biaya standar per Grade Level atau Program (misal: SPP Bulanan Rp 500.000).
- **General Ledger (Buku Besar)**: Rekapitulasi mutasi debit, kredit, dan saldo berjalan per akun COA dalam rentang periode tertentu.

---

## 8. Penerimaan Peserta Didik Baru (Admission / PPDB ala OpenEduCat)
- **Application Register (Gelombang Pendaftaran)**: Periode pendaftaran siswa baru untuk Tahun Ajaran dan Course tertentu (misal: "Gelombang 1 Reguler 2026/2027") dengan kuota dan rentang tanggal.
- **Application / Applicant (Calon Siswa)**: Entitas calon siswa terdaftar dengan status alur (`draft`, `submitted`, `verified`, `approved`, `rejected`, `enrolled`).
- **Admission Fee Rule**: Biaya pendaftaran dan biaya pangkal awal yang otomatis mengompilasi draft `Student Invoice` saat status calon siswa bergeser ke `approved` / `enrolled`.

---

## 9. Struktur Biaya & Otomasi Tagihan (Fee Structure & Batch Invoicing)
- **Fee Category / Type**: Kategori biaya (misal: "SPP Bulanan", "Uang Gedung", "Iuran Praktikum", "Biaya Ujian").
- **Fee Structure**: Paket aturan tarif biaya yang ditautkan ke Grade Level atau Program (misal: Tarif SPP Kelas 10 MIPA Rp 500.000/bulan).
- **Fee Batch Generation Run**: Eksekusi batch terkontrol oleh bendahara sekolah yang mengompilasi `account.move` (`out_invoice`) secara massal untuk seluruh siswa aktif di suatu kelas/jenjang pada bulan tertentu dalam satu transaksi atomik D1.

---

## 10. Perpustakaan (Library Circulation ala OpenEduCat & Odoo)
- **Library Media**: Produk buku/media yang terintegrasi langsung dengan entitas `products` (tipe `storable`) dengan atribut tambahan seperti ISBN, pengarang, penerbit, dan nomor rak.
- **Media Unit / Barcode**: Copy fisik individual dari media dengan kode barcode unik.
- **Library Issue / Return (Sirkulasi Pinjam)**: Transaksi peminjaman unit buku ke Siswa atau Guru dengan batas tanggal kembali, histori pengembalian, status (`issued`, `returned`, `lost`), dan denda keterlambatan (*fine invoice*).

---

## 11. Portal Akses Siswa & Wali Murid (Parent & Student Self-Service)
- **Portal Scope**: Filter otorisasi baris (Row-Level Security) berbasis kepemilikan data (`session.user.id` -> `student.user_id` atau `guardian.user_id`), membatasi akses baca data hanya pada jadwal, kehadiran, rapor, dan tagihan invoice milik siswa/anak yang bersangkutan.

---

## 12. Kepegawaian & Penggajian (HR & Payroll ala Odoo)
- **Employee**: Entitas kanonik profil tenaga pendidik (`faculty`) maupun tenaga kependidikan/staf (`staff`), menyimpan NIP, jabatan, relasi ke user otentikasi, dan rincian bank pencairan gaji.
- **Salary Structure / Contract**: Aturan kontrak kerja yang menetapkan tarif komponen gaji bagi pegawai: gaji pokok (*base salary*), honor per sesi mengajar, tunjangan tetap (*allowances*), serta potongan wajib (*deductions* seperti BPJS/kasbon).
- **Payslip (`hr.payslip`)**: Dokumen rincian slip gaji individual seorang pegawai pada periode bulan tertentu, memuat breakdown penghasilan bruto, potongan, dan take-home pay (gaji bersih).
- **Payslip Batch Run (`hr.payslip.run`)**: Proses kalkulasi dan penerbitan slip gaji massal seluruh guru/staf dalam satu unit sekolah, yang setelah divalidasi akan otomatis mengompilasi dan membukukan transaksi pengeluaran beban gaji (`account.move`) secara atomik ke buku besar.

---

## 13. Pembelajaran Digital & Tugas Mandiri (Assignment & LMS ala OpenEduCat)
- **Assignment (Tugas Siswa)**: Tugas akademik terstruktur yang diterbitkan guru untuk Classroom dan Subject tertentu, dilengkapi judul, instruksi, bobot nilai, tenggat waktu penyerahan (*due date*), serta lampiran materi pendukung.
- **Assignment Submission (Pengumpulan Tugas)**: Entitas pengumpulan tugas individual oleh siswa, memuat tanggal serah, tautan/teks submission, status serah (`draft`, `submitted`, `late`, `graded`), catatan feedback guru, serta perolehan skor numerik.

---

## 14. Pengadaan Barang & Tagihan Vendor (Purchase & Vendor Bills ala Odoo `purchase`)
- **Purchase Order (PO / Pesanan Pembelian)**: Dokumen komitmen pengadaan barang/jasa dari sekolah ke pihak rekanan/suplier (*Partner/Vendor*), memuat baris item barang, kuantitas yang dipesan, harga satuan, dan status alur (`draft`, `approved`, `done`, `cancelled`).
- **Vendor Bill (`in_invoice` / Tagihan Pemasok)**: Dokumen penagihan resmi dari vendor rekanan atas pengadaan barang/jasa yang diterima sekolah, dibukukan sebagai Journal Entry bertipe `in_invoice` (Debit Beban / Aset / Persediaan, Credit Utang Usaha / *Accounts Payable*).
- **Vendor Payment (`account.payment`)**: Pembayaran kas/bank dari rekening sekolah kepada suplier yang direkonsiliasi dengan Vendor Bill terbuka.

---

## 15. Manajemen Aset Tetap Sekolah (Asset Management & Depreciation ala Odoo `account.asset`)
- **Asset Category (Kategori Aset Tetap)**: Kelompok klasifikasi aset tetap sekolah (misal: Komputer Lab, Kendaraan Operasional, Gedung, Peralatan Lab) yang mengonfigurasi masa manfaat (tahun/bulan), metode penyusutan (garis lurus / *straight line*), akun aset, akun akumulasi penyusutan, dan akun beban penyusutan.
- **Fixed Asset (Aset Tetap Sekolah)**: Rekaman fisik aset spesifik yang dimiliki sekolah, mencakup kode inventaris unik, tanggal perolehan (*gross value*), nilai residu/sisa (*salvage value*), masa manfaat, dan status kepemilikan (`draft`, `running`, `depreciated`, `disposed`).
- **Depreciation Board / Line (Jadwal Penyusutan)**: Rencana tabel angsuran penyusutan berkala (bulanan/tahunan). Saat diposting, sistem otomatis menerbitkan Journal Entry (`account.move`) Debit Beban Penyusutan dan Credit Akumulasi Penyusutan Aset secara atomik.


