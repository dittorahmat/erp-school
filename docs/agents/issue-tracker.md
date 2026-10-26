# Issue Tracker: GitHub Issues

Project ini menggunakan **GitHub Issues** sebagai issue tracker kanonik (repo: [dittorahmat/erp-school](https://github.com/dittorahmat/erp-school)).

## Konvensi GitHub Issues

- **Membuat Issue**: Gunakan GitHub CLI `gh issue create --title "<Judul>" --body "<Deskripsi>" --label "<label>"`.
- **Membaca Issue**: Gunakan `gh issue list` atau `gh issue view <nomor>`.
- **Triage Labels**: Menggunakan canonical labels sesuai `triage-labels.md` (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) serta label domain modul (`academic`, `accounting`, `inventory`, `infra`).
- **Diskusi & Komentar**: Gunakan `gh issue comment <nomor> --body "<komentar>"`.
- **Penutupan Issue**: Gunakan `gh issue close <nomor> --comment "<resolusi>"`.
