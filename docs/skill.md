# Skills: Kapabilitas & Keahlian Pengembangan Niskala

**Dokumen Acuan:** `docs/project-plan-undangan-digital.md`  
**Tujuan:** Panduan keahlian teknis (*competency map*) yang harus dikuasai dan diterapkan oleh developer maupun AI Assistant saat mengerjakan fitur Niskala.

---

## 1. Backend Engineering (PHP 8.3 & Laravel 12)

### 1.1 REST API & Architecture
* **Clean Controller-Service-Policy Pattern:** Memisahkan logika HTTP (Controller), validasi input (Form Request), aturan bisnis/transformasi data (Service/Action), dan hak akses (Policy).
* **Sanctum Authentication:** Pengelolaan token bearer, rotasi sesi, serta integrasi role-based access control (`EnsureAdmin` dan scope kepemilikan user).
* **OpenAPI / Swagger Specialist:** Penguasaan penulisan anotasi OpenAPI 3.0 (anotasi DocBlock `@OA\...`), integrasi dinamis via `SwaggerGeneratorFactory`, serta pemeliharaan dokumentasi interaktif yang selalu mutakhir.

### 1.2 Database & Data Modeling
* **MySQL 8.0 & JSON Columns:** Mahir merancang migrasi dengan foreign key constraints, pengindeksan performa tinggi pada `slug`, `user_id`, dan kolom pencarian, serta pemanfaatan kolom JSON untuk menyimpan konten section terstruktur.
* **Database Seeding & Idempotency:** Menulis seeder yang aman dijalankan berulang kali (`firstOrCreate` / `updateOrCreate`) tanpa menduplikasi data atau merusak referensi yang sudah ada.

---

## 2. Frontend Engineering (React 19 & Vite 7)

### 2.1 Visual Editor & State Machine
* **Drag-and-Drop Implementation:** Merancang antarmuka penyusun section yang intuitif (menggunakan pustaka yang kompatibel dengan React 19 seperti `@dnd-kit` atau implementasi terstruktur) untuk perpindahan dan pengurutan block undangan.
* **Editor State & Local History:** Mengelola state kompleks kanvas undangan dengan reducer terpusat:
  * Riwayat **Undo / Redo** lokal yang hemat memori.
  * **Autosave** dengan mekanisme *debounce* (mencegah banjir request ke API saat pengetikan berlangsung).
  * **Optimistic UI:** Perubahan langsung terlihat di kanvas pratinjau sebelum response server selesai.

### 2.2 Component Registry Pattern
* Kemampuan memetakan skema JSON komponen ke representasi komponen React yang aman:
  * Registry terdaftar: `HeroCover`, `CoupleProfile`, `EventSchedule`, `CountdownTimer`, `GalleryGrid`, `LocationMap`, `RsvpForm`, `GuestBook`, `AudioPlayer`, `FooterSection`.
  * Menolak / mengabaikan secara aman tipe komponen yang tidak dikenal atau properti yang tidak tervalidasi.

### 2.3 Mobile-First UX & Animasi Interaktif
* **Responsif Tingkat Tinggi:** Menguasai styling CSS/SCSS yang presisi untuk layar ponsel (360px – 430px) tanpa layout shift.
* **Audio & Media Handling:** Integrasi pemutar musik latar yang mematuhi kebijakan *autoplay restriction* browser (dipicu melalui interaksi tombol buka undangan).
* **Intersection Observer:** Efek transisi kemunculan elemen (*fade-in*, *slide-up*) saat halaman digulir tanpa membebani performa CPU perangkat seluler.

---

## 3. DevOps, Docker, & Infrastruktur

### 3.1 Nginx Reverse Proxy & Routing
* Menguasai konfigurasi Nginx untuk routing multi-container:
  * SPA Fallback (`try_files $uri $uri/ /index.html`) untuk React.
  * API Passthrough (`/api/`) ke backend PHP-FPM / Nginx.
  * Storage Media Passthrough (`/storage/`) ke folder unggahan publik.
  * Health check routing (`/up`) dan Swagger UI asset routing (`/docs/`).
  * Konfigurasi proxy headers yang tepat (`$http_host`, `X-Forwarded-For`, `X-Forwarded-Port`).

### 3.2 Docker Compose Management
* Menjaga sinkronisasi named volumes (`niskala-storage`, `niskala-db-data`, `niskala-logs`).
* Manajemen hak akses file internal container (`www-data:www-data`, chmod direktori `storage` dan `bootstrap/cache`).

---

## 4. Keamanan Aplikasi & Defense-in-Depth

* **Anti-IDOR Verification:** Selalu memverifikasi kepemilikan resource setiap kali menerima parameter ID dari request URL.
* **XSS Prevention:** Mencegah rendering HTML/JS mentah dari input pengguna; menggunakan sanitasi teks murni pada ucapan dan RSVP.
* **Upload Validation:** Memeriksa MIME asli berkas (bukan hanya ekstensi file), membatasi ukuran maksimal 10MB, dan menyimpan dengan nama terenkripsi unik.
* **Rate Limiting:** Menerapkan pembatasan laju request pada rute sensitif seperti `/api/login` dan submission `/rsvps`.

