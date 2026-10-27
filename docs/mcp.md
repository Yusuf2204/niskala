# MCP (Model Context Protocol): Panduan Integrasi Alat & Server Niskala

**Dokumen Acuan:** `docs/project-plan-undangan-digital.md`  
**Tujuan:** Panduan integrasi server dan tools berbasis Model Context Protocol (MCP) untuk memperluas kapabilitas agen AI dalam pengembangan, pengujian, dan pemeliharaan platform Niskala.

---

## 1. Peran MCP dalam Pengembangan Niskala

Model Context Protocol (MCP) memungkinkan agen AI berinteraksi secara aman dan terstandar dengan ekosistem lokal proyek Niskala:
* Menginspeksi struktur database relasional secara langsung.
* Mengotomatisasi pengujian antarmuka undangan publik di berbagai ukuran layar ponsel menggunakan browser headless.
* Mengelola berkas, aset media, dan alur kerja Git secara presisi tanpa keluar dari konteks percakapan.

---

## 2. Katalog MCP Server yang Direkomendasikan

### 2.1 MySQL Database MCP Server
* **Tujuan:** Memeriksa struktur tabel, foreign keys, indeks, dan isi data seeder secara langsung pada container MySQL (`niskala-db`).
* **Konfigurasi Akses:**
  * Host: `localhost` (atau `127.0.0.1`)
  * Port: `3320` (sesuai `DB_EXTERNAL_PORT` di `.env`)
  * Database: `niskala`
  * User: `niskala`
  * Password: `${DB_PASSWORD}`
* **Penggunaan Utama:**
  * Validasi struktur tabel hasil migrasi (`users`, `invitations`, `guests`, `rsvps`).
  * Pengecekan konsistensi data saat pengujian RSVP dan registrasi komponen JSON.
  * Pengecekan keunikan kolom `slug` pada tabel `invitations`.

### 2.2 Puppeteer / Browser Automation MCP Server
* **Tujuan:** Menguji rendering visual halaman undangan publik secara otomatis pada viewport seluler.
* **Target Viewport Standar Pengujian:**
  * Mobile Standar: `375 x 667` (iPhone SE)
  * Mobile Modern: `390 x 844` (iPhone 13/14/15)
  * Mobile Android: `360 x 800` (Samsung Galaxy Series)
  * Desktop Preview: `1280 x 800`
* **Alur Skenario Uji:**
  1. Membuka `http://localhost:8031/{slug}`.
  2. Memverifikasi teks nama tamu muncul di cover amplop.
  3. Mengklik tombol *"Buka Undangan"* dan memverifikasi transisi animasi berjalan mulus.
  4. Memeriksa pemutar audio aktif tanpa melempar error konsol.
  5. Mengisi formulir RSVP dan memastikan respons berhasil diterima serta ucapan tampil di buku tamu.
  6. Mengambil screenshot tampilan untuk verifikasi kepatuhan palet warna Ivory, Charcoal, dan Muted Gold.

### 2.3 Filesystem MCP Server
* **Tujuan:** Pengelolaan file kode sumber, pembacaan log aplikasi, dan verifikasi struktur storage upload.
* **Root Direktori Kerja:** `/var/www/html/niskala`
* **Batasan Akses:**
  * Dilarang mengakses atau menampilkan isi secret file `.env` ke publik/log.
  * Hanya beroperasi di dalam ruang lingkup direktori kerja proyek.

### 2.4 Git & Version Control MCP Server
* **Tujuan:** Memeriksa status perubahan, commit bertahap (*atomic commits*), dan memastikan branch tetap bersih.
* **Standar Commit:** Mengikuti format Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).

---

## 3. Kebijakan Keamanan & Batasan Operasional MCP

1. **Prinsip Least Privilege:** Seluruh interaksi MCP harus berjalan pada lingkungan lokal development atau staging terisolasi.
2. **Kerahasiaan Data (No Credential Leak):**
   * Password database, APP_KEY, dan token Sanctum tidak boleh dicatat dalam prompt atau ringkasan tugas MCP.
3. **Pemberian Izin Eksplisit:**
   * Operasi yang bersifat destruktif terhadap database (`DROP TABLE`, `TRUNCATE`) dilarang keras dilakukan secara otomatis tanpa persetujuan eksplisit dari pengguna.

