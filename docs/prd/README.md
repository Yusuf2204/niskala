# Product Requirement Documents (PRD): Niskala

**Dokumen Induk:** [project-plan-undangan-digital.md](file:///var/www/html/niskala/docs/project-plan-undangan-digital.md)  
**Tujuan Direktori:** Memecah spesifikasi pengembangan platform undangan digital Niskala menjadi modul PRD yang terfokus, terukur, dan siap dieksekusi bertahap. PRD tahap fondasi (01–06) yang telah selesai diimplementasikan diarsipkan ke direktori `archive/`.

---

## 1. PRD Aktif (Tahap Pengerjaan Berikutnya)

| No | Berkas PRD | Fokus Modul | Fase Roadmap | Status |
|---|---|---|---|---|
| **07** | [07-koreografi-animasi-dan-css.md](file:///var/www/html/niskala/docs/prd/07-koreografi-animasi-dan-css.md) | Koreografi pembuka surat 3D (`EnvelopeGate`), variasi transisi antar-slide & stagger section, smooth accordion, top progress bar, dan scroll-spy `FloatingQuickNav` berbasis GPU CSS + `IntersectionObserver`. | **Fase 5 (Polesan Interaktif)** | **Siap Dikerjakan (Planned)** |

---

## 2. Arsip PRD Selesai (01–06)

Seluruh spesifikasi inti PRD 01–06 telah selesai diimplementasikan dan diarsipkan pada [archive/](file:///var/www/html/niskala/docs/prd/archive):

| No | Berkas Arsip | Fokus Modul | Fase Roadmap | Status |
|---|---|---|---|---|
| **01** | [archive/01-fondasi-data-dan-api.md](file:///var/www/html/niskala/docs/prd/archive/01-fondasi-data-dan-api.md) | Skema database, entity model, policy anti-IDOR, lifecycle state, reserved slugs, dan REST API. | **Fase 1** | **Selesai & Diarsipkan** |
| **02** | [archive/02-navigasi-menu-dan-master-data.md](file:///var/www/html/niskala/docs/prd/archive/02-navigasi-menu-dan-master-data.md) | Struktur menu sidebar, master tema, master musik latar (`ms_music`), daftar undangan, dan wizard buat undangan baru. | **Fase 1.5** | **Selesai & Diarsipkan** |
| **03** | [archive/03-visual-editor.md](file:///var/www/html/niskala/docs/prd/archive/03-visual-editor.md) | Editor visual komponen, mobile viewport canvas, property inspector, undo/redo, dan autosave. | **Fase 2** | **Selesai & Diarsipkan** |
| **04** | [archive/04-renderer-publik-dan-tema.md](file:///var/www/html/niskala/docs/prd/archive/04-renderer-publik-dan-tema.md) | Renderer undangan publik, mobile-first responsive, amplop/gate opening, audio player, floating nav, lightbox, serta overhaul ornamen Adat Jawa & token `--inv-*`. | **Fase 3** | **Selesai & Diarsipkan** |
| **05** | [archive/05-manajemen-tamu-dan-rsvp.md](file:///var/www/html/niskala/docs/prd/archive/05-manajemen-tamu-dan-rsvp.md) | Daftar tamu, personalisasi URL (`?to=Nama`), validasi & throttling RSVP, ekspor CSV, dan buku ucapan/doa interaktif. | **Fase 1.5 & 3** | **Selesai & Diarsipkan** |
| **06** | [archive/06-layanan-bantuan-admin.md](file:///var/www/html/niskala/docs/prd/archive/06-layanan-bantuan-admin.md) | Alur permintaan bantuan (service order), peninjauan admin, kolaborasi pengeditan undangan, dan audit logs. | **Fase 4** | **Selesai & Diarsipkan** |

---

## 3. Prinsip Kepatuhan Desain, Performa & Keamanan

Seluruh implementasi fitur pada setiap PRD wajib mematuhi dokumen standar proyek:
1. **Aturan Desain & Palet Warna ([design.md](file:///var/www/html/niskala/docs/design.md)):** Kaidah 60-30-10 dashboard admin dan token tema undangan terisolasi (`--inv-*`).
2. **Aturan Keamanan ([rules.md](file:///var/www/html/niskala/docs/rules.md)):** Larangan IDOR, isolasi status draft, registry komponen tervalidasi (tanpa raw HTML/JS arbitrer), dan sanitasi input.
3. **Standar Arsitektur ([context.md](file:///var/www/html/niskala/docs/context.md)):** Stack multi-container Docker, Laravel Sanctum, React 19, MySQL 8.0 utf8mb4, dan optimasi GPU compositor untuk animasi seluler.
