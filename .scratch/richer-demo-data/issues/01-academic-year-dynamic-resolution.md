## What to build
Menghilangkan hardcode teks tahun ajaran `2025/2026` di seluruh antarmuka frontend (LoginView, Topbar/Header, Rapor Digital modal) dan domain backend (`examManagement.getReportCard`), menggantikannya dengan pembacaan dinamis dari Academic Year aktif (`2026/2027`) dari D1.

## Acceptance criteria
- [ ] Header login dan modal rapor menampilkan tahun ajaran yang bersumber dari API / data aktif (`2026/2027`).
- [ ] Helper & domain report card meresolusi nama term & tahun ajaran secara dinamis tanpa fallback hardcoded `2025/2026`.
- [ ] Seluruh test suite akademik dan guardrail tetap lulus 100%.

## Blocked by
- None (can start immediately)
