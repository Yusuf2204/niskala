# Rencana Pengembangan Platform Undangan Digital

**Status:** Dokumen perencanaan awal\
**Repository:** https://github.com/Yusuf2204/react-cms-template\
**Direktori kerja:** `/var/www/html/react-cms-template`

## 1. Ringkasan Proyek

Mengembangkan platform layanan undangan digital yang memungkinkan
pelanggan membuat dan mengelola undangan sendiri melalui editor visual
drag-and-drop. Pelanggan juga dapat meminta bantuan admin untuk membuat
atau mengatur undangan.

Produk dimulai sebagai **layanan undangan digital**, bukan SaaS
berlangganan yang mewajibkan pembayaran otomatis sejak awal. Fitur
pembayaran dapat dipertimbangkan setelah kebutuhan bisnis dan alur
layanan tervalidasi.

Jenis acara awal mencakup: - Pernikahan - Ulang tahun - Acara umum
lainnya

Setiap undangan yang dipublikasikan dapat diakses melalui URL berbentuk
`domain.com/slug`.

## 2. Tujuan Produk

1.  Memungkinkan pelanggan membuat undangan tanpa harus menulis kode.
2.  Menyediakan editor visual yang cukup fleksibel tetapi mudah
    dipahami.
3.  Memungkinkan admin mengelola pelanggan, tema, undangan, dan
    permintaan bantuan.
4.  Menghasilkan halaman undangan publik yang responsif di perangkat
    seluler dan desktop.
5.  Menyediakan RSVP dan pengelolaan tamu dengan validasi serta kontrol
    akses yang baik.
6.  Menjaga agar perubahan platform tidak merusak undangan lama yang
    sudah dibuat atau dipublikasikan.

## 3. Keputusan Produk yang Sudah Disepakati

  -----------------------------------------------------------------------
  Area                                Keputusan
  ----------------------------------- -----------------------------------
  Model layanan                       Hybrid: pelanggan membuat sendiri
                                      atau meminta bantuan admin

  Model bisnis awal                   Layanan undangan digital;
                                      pembayaran otomatis belum menjadi
                                      prasyarat

  URL undangan                        `domain.com/slug`

  Editor                              Editor visual berbasis
                                      drag-and-drop

  Peran admin                         Mengelola pelanggan, tema,
                                      undangan, dan permintaan layanan

  Peran pelanggan                     Mengelola undangannya sendiri dan
                                      data terkait

  Konten undangan                     Data terstruktur dan tervalidasi,
                                      bukan HTML/JavaScript bebas dari
                                      pengguna
  -----------------------------------------------------------------------

Keputusan teknis yang belum dikonfirmasi harus ditentukan setelah
memeriksa isi repository, dependensi, konfigurasi, dan hasil instalasi.
Jangan menganggap rancangan teknis di dokumen ini sebagai implementasi
yang sudah ada.

## 4. Kondisi Repository Saat Ini

Repository baru di-clone dan diperbarui dengan perbaikan template.
Dependency aplikasi belum diinstal dan aplikasi belum dianggap siap
dijalankan.

Struktur yang sudah terlihat:

``` text
react-cms-template/
├── backend/
├── frontend/
├── nginx/
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── README.md
```

Pemeriksaan awal: - Branch lokal: `master`, bersih dan sejajar dengan
`origin/master` saat diperiksa. - PHP CLI: `8.3.6`. - Composer:
`2.7.1`. - Node.js: `24.21.0`. - npm: `11.19.0`. -
`backend/composer.json` mensyaratkan PHP `^8.2` dan Laravel `^12.0`. -
`docker compose config --services` menampilkan `backend`, `frontend`,
dan `nginx`.

Belum dilakukan: - Instalasi dependency Composer dan npm. - Validasi
konfigurasi aplikasi secara menyeluruh. - Build dan pengujian
frontend/backend. - Pengujian layanan database dan koneksi aplikasi. -
Verifikasi konfigurasi Nginx dan kesiapan deployment.

**Catatan keamanan:** file `.env` sudah ada. Jangan menampilkan atau
membagikan secret, password, token, maupun kredensialnya dalam log atau
dokumentasi. Periksa konfigurasi secara selektif dan jangan menimpa
`.env` sebelum memahami isinya.

## 5. Arsitektur Awal yang Diusulkan

Rancangan ini merupakan arah awal, bukan keputusan final sebelum audit
repository selesai.

### 5.1 Dashboard dan API

-   Pertahankan `frontend/` sebagai dashboard/CMS jika struktur yang ada
    memang mendukungnya.
-   Pertahankan `backend/` sebagai API Laravel.
-   Gunakan autentikasi dan otorisasi server-side.
-   Terapkan policy agar pelanggan hanya dapat mengakses undangan dan
    data miliknya.
-   Admin memiliki hak akses terpisah untuk pengelolaan operasional.

### 5.2 Halaman Undangan Publik

Evaluasi apakah halaman publik dapat dibangun di frontend yang ada atau
membutuhkan aplikasi terpisah, misalnya `public-web/`. Jangan membuat
aplikasi, container, atau runtime tambahan sebelum ada alasan teknis
yang jelas.

Halaman publik perlu mempertimbangkan: - Responsif dan mobile-first. -
Metadata untuk berbagi tautan di media sosial. - SEO dan kebutuhan
rendering/prerendering. - Pemisahan data draft dari undangan yang telah
dipublikasikan. - Pengelolaan media dan performa halaman.

### 5.3 Routing Domain

Target URL undangan adalah `domain.com/slug`. Aturan routing Nginx harus
memisahkan halaman utama, dashboard, API, aset, dan slug undangan dengan
jelas.

Slug perlu unik dan slug sistem seperti `api`, `admin`, `login`, dan
`dashboard` harus dicadangkan. Keunikan harus ditegakkan juga pada
database, bukan hanya pemeriksaan frontend.

### 5.4 Penyimpanan Konten

Simpan isi undangan sebagai data terstruktur yang tervalidasi, misalnya
JSON dengan: - `schema_version` - Jenis acara - Identitas tema dan versi
tema - Pengaturan tampilan - Daftar section/block dengan ID stabil, tipe
komponen yang diizinkan, dan props yang tervalidasi

Renderer publik hanya boleh merender komponen yang terdaftar dan
diizinkan. Jangan menerima atau mengeksekusi JavaScript, komponen React,
atau HTML arbitrer yang dikirim pengguna.

Versi skema dan tema perlu dikelola agar perubahan aplikasi tidak
otomatis merusak undangan lama.

## 6. Editor Visual

Editor direncanakan sebagai editor berbasis section/block, bukan kanvas
desain bebas seperti Figma.

### Layout editor yang diusulkan

1.  **Panel komponen:** daftar section yang dapat ditambahkan.
2.  **Canvas/preview:** susunan undangan yang dapat dipilih dan
    diurutkan.
3.  **Panel properti:** mengubah teks, gambar, warna, tata letak, dan
    opsi komponen.
4.  **Kontrol dokumen:** simpan draft, preview, dan publikasikan.
5.  **Riwayat lokal:** undo/redo untuk perubahan selama sesi editing.

### Komponen MVP

-   Hero/cover
-   Nama pasangan atau nama penyelenggara
-   Informasi acara
-   Countdown
-   Sesi/jadwal acara
-   Galeri foto
-   Lokasi dan peta
-   RSVP
-   Buku tamu, bila disepakati untuk MVP
-   Musik latar, opsional
-   Footer

Komponen akhir perlu ditentukan berdasarkan tema awal dan kebutuhan
pengguna. Gunakan registry komponen yang eksplisit, bukan kode bebas.

### Perilaku penyimpanan

-   Perubahan editor langsung tercermin pada preview lokal.
-   Autosave ke server dilakukan dengan debounce.
-   Draft tidak terlihat pada URL publik.
-   Tombol publish adalah tindakan terpisah dan eksplisit.
-   Gunakan versi dokumen atau optimistic locking untuk mencegah
    perubahan saling menimpa.
-   Konflik penyimpanan harus ditangani secara jelas.
-   Undo/redo mengelola state editor lokal; tidak perlu membuat request
    backend untuk setiap langkah.

Pustaka drag-and-drop seperti `dnd-kit` dapat dievaluasi setelah
kompatibilitas dengan versi React dan struktur frontend dikonfirmasi.

## 7. Domain Data Awal

Entitas konseptual yang mungkin dibutuhkan:

-   **Users:** akun pelanggan dan admin.
-   **Invitations:** pemilik, judul, jenis acara, slug, status, tema,
    dan waktu publikasi.
-   **Invitation content:** data terstruktur dan versi skema.
-   **Themes:** identitas tema, konfigurasi, versi, dan komponen yang
    didukung.
-   **Invitation events:** tanggal, waktu, lokasi, dan sesi acara.
-   **Guests:** data tamu yang dikelola untuk undangan.
-   **RSVPs:** jawaban kehadiran dan data terkait.
-   **Media:** metadata file yang diunggah.
-   **Service orders:** permintaan bantuan pembuatan/pengelolaan
    undangan.
-   **Audit logs:** pencatatan tindakan penting.

Struktur tabel final ditentukan saat perancangan migration. Konten
section dapat tetap disimpan sebagai JSON pada tahap MVP selama
validasi, ukuran, dan kebutuhan query mendukungnya. Data tamu dan RSVP
sebaiknya dipisahkan bila perlu dikelola dan dicari secara independen.

## 8. Rancangan API Awal

Nama endpoint berikut adalah contoh rancangan, bukan endpoint yang sudah
tersedia.

  -------------------------------------------------------------------------------------------
  Method                  Endpoint                                    Tujuan
  ----------------------- ------------------------------------------- -----------------------
  `GET`                   `/api/v1/themes`                            Daftar tema yang
                                                                      tersedia

  `POST`                  `/api/v1/invitations`                       Membuat undangan

  `GET`                   `/api/v1/invitations`                       Daftar undangan milik
                                                                      pengguna

  `GET`                   `/api/v1/invitations/{id}`                  Detail undangan yang
                                                                      berhak diakses

  `PUT`                   `/api/v1/invitations/{id}`                  Menyimpan perubahan
                                                                      draft

  `POST`                  `/api/v1/invitations/{id}/publish`          Mempublikasikan
                                                                      undangan

  `POST`                  `/api/v1/invitations/{id}/archive`          Mengarsipkan undangan

  `GET`                   `/api/v1/public/invitations/{slug}`         Data publik undangan
                                                                      terpublikasi

  `POST`                  `/api/v1/public/invitations/{slug}/rsvps`   Mengirim RSVP

  `GET`                   `/api/v1/invitations/{id}/rsvps`            Melihat RSVP sesuai hak
                                                                      akses

  `POST`                  `/api/v1/service-orders`                    Mengajukan bantuan
                                                                      admin
  -------------------------------------------------------------------------------------------

Endpoint final harus mengikuti konvensi yang sudah dipakai template jika
konvensi tersebut layak dipertahankan.

## 9. Alur Layanan Admin

Alur awal permintaan bantuan:

1.  Pelanggan mengirim permintaan beserta informasi acara.
2.  Admin meninjau kebutuhan dan informasi yang diberikan.
3.  Admin membuat atau membantu mengedit undangan menggunakan engine
    yang sama.
4.  Pelanggan meninjau hasil dan memberikan persetujuan.
5.  Undangan dipublikasikan setelah informasi dan izin yang diperlukan
    dikonfirmasi.
6.  Status permintaan layanan diperbarui hingga selesai.

Alur status final, notifikasi, revisi, harga, dan pembayaran ditentukan
berdasarkan kebutuhan operasional. Jangan membangun sistem pembayaran
sebelum alur layanan inti berjalan dan kebutuhan bisnisnya jelas.

## 10. Keamanan dan Privasi

-   Terapkan authorization server-side pada setiap operasi yang
    mengakses undangan.
-   Cegah IDOR: mengganti ID tidak boleh membuka atau mengubah data
    milik pelanggan lain.
-   Undangan draft tidak boleh diakses melalui endpoint publik.
-   Validasi seluruh input dan batasi ukuran serta frekuensi request
    RSVP.
-   Validasi jenis, ukuran, dan konten file upload; jangan percaya nama
    file dari pengguna.
-   Jangan menjalankan HTML atau JavaScript arbitrer dari konten
    undangan.
-   Batasi endpoint admin berdasarkan role/permission di backend.
-   Simpan secret di environment dan jangan commit secret ke Git.
-   Catat tindakan penting tanpa memasukkan token, password, atau data
    sensitif ke log.
-   Tentukan kebijakan retensi dan penghapusan data RSVP, tamu, dan
    foto.
-   Tambahkan pengujian otorisasi lintas pengguna, validasi konten,
    publikasi, dan upload.
-   Siapkan backup database serta prosedur pemulihan sebelum production.

## 11. Roadmap Implementasi

### Fase 0 --- Audit dan persiapan fondasi

-   Audit README, manifest dependency, lockfile, Docker Compose, Nginx,
    dan `.env.example`.
-   Pastikan `.env` lokal tidak berisi konfigurasi berbahaya atau secret
    yang ter-commit.
-   Catat baseline versi runtime dan layanan.
-   Instal dependency sesuai lockfile; hindari upgrade massal.
-   Jalankan build, test, dan health check yang tersedia.
-   Pastikan cara kerja database dan migrasi.
-   Dokumentasikan masalah yang ditemukan sebelum mengubah arsitektur.

**Kriteria selesai:** aplikasi dapat disiapkan dan diuji dengan langkah
yang terdokumentasi; konfigurasi dan baseline awal diketahui.

### Fase 1 --- Fondasi backend undangan

-   Rancang migration dan relasi.
-   Tambahkan model, validasi, policy, dan endpoint inti.
-   Terapkan status draft/published/archived.
-   Implementasikan slug unik dan slug yang dicadangkan.
-   Buat pengujian API, otorisasi, dan validasi.
-   Pastikan pengguna tidak dapat mengakses data pengguna lain.

**Kriteria selesai:** CRUD undangan dasar, validasi, dan otorisasi lulus
pengujian.

### Fase 2 --- Editor visual

-   Bangun registry komponen.
-   Buat panel komponen, canvas, dan panel properti.
-   Tambahkan pengurutan drag-and-drop.
-   Implementasikan preview, undo/redo, autosave, dan penanganan
    konflik.
-   Terapkan validasi skema dan versi dokumen.
-   Pisahkan penyimpanan draft dari publikasi.

**Kriteria selesai:** pelanggan dapat menyusun undangan dengan komponen
yang diizinkan, menyimpan draft, memuat ulang, dan melanjutkan editing.

### Fase 3 --- Renderer publik dan tema MVP

-   Implementasikan routing `/{slug}`.
-   Bangun renderer yang hanya menerima konten tervalidasi.
-   Siapkan minimal satu tema pernikahan dan satu tema umum jika cakupan
    MVP memungkinkan.
-   Tambahkan informasi acara, galeri, lokasi, dan RSVP.
-   Pastikan tampilan mobile, metadata berbagi, dan status publikasi.
-   Uji kompatibilitas konten lama terhadap versi renderer baru.

**Kriteria selesai:** undangan terpublikasi dapat dibuka dengan stabil
dari perangkat mobile dan desktop.

### Fase 4 --- Admin dan operasional layanan

-   Kelola pelanggan, undangan, tema, dan permintaan layanan.
-   Implementasikan alur permintaan bantuan serta statusnya.
-   Tambahkan pencatatan tindakan admin yang penting.
-   Siapkan monitoring, backup, dan prosedur restore.
-   Lakukan pengujian keamanan dan alur operasional end-to-end.

**Kriteria selesai:** admin dapat menjalankan layanan dari permintaan
pelanggan sampai undangan dipublikasikan.

### Fase 5 --- Pengembangan lanjutan

Prioritaskan berdasarkan penggunaan nyata: - Variasi tema dan
komponen. - Personalisasi URL atau tautan tamu bila dibutuhkan. -
Notifikasi dan ekspor data. - Paket layanan, invoice, dan pembayaran. -
Analitik dan optimasi performa.

Fase ini bukan prasyarat untuk membangun MVP.

## 12. Strategi Pengujian

Minimal mencakup:

-   **Backend:** unit test, feature/API test, validasi request, policy,
    dan migrasi.
-   **Editor:** tambah/hapus/urutkan komponen, edit properti, undo/redo,
    autosave, konflik, dan reload.
-   **Publikasi:** draft tidak publik, publish berhasil, perubahan draft
    tidak otomatis mengubah versi publik sebelum dipublikasikan.
-   **RSVP:** validasi data, rate limiting, duplikasi sesuai aturan
    produk, dan pembatasan data pribadi.
-   **Keamanan:** akses lintas pengguna, role admin, upload, input
    berbahaya, slug, dan endpoint publik.
-   **Frontend:** build production, navigasi, tampilan responsif, serta
    kondisi loading/error.
-   **Operasional:** konfigurasi bersih, log, backup, dan pemulihan
    database.

## 13. Prinsip Implementasi

1.  Satu langkah pemeriksaan atau perubahan pada satu waktu ketika
    troubleshooting.
2.  Pertahankan struktur dan konvensi template yang sudah baik.
3.  Periksa file aktual sebelum menyimpulkan bagaimana sistem bekerja.
4.  Jangan upgrade semua dependency hanya demi menggunakan versi
    terbaru.
5.  Jangan menambahkan container atau aplikasi baru tanpa kebutuhan yang
    terverifikasi.
6.  Jangan mengubah `.env` atau konfigurasi sistem secara destruktif
    tanpa memahami dampaknya.
7.  Setiap fase harus punya kriteria selesai dan pengujian.
8.  Pisahkan draft, publikasi, dan konten publik dengan jelas.
9.  Prioritaskan keamanan, kemudahan pemeliharaan, dan pengalaman
    mobile.
10. Tunda pembayaran dan fitur tambahan sampai alur undangan inti
    terbukti berjalan.

## 14. Langkah Berikutnya

Mulai dari **Fase 0** dengan mengaudit file konfigurasi yang sudah ada,
bukan langsung menulis fitur:

1.  Periksa `README.md` untuk instruksi instalasi resmi.
2.  Periksa manifest dan lockfile di `backend/` serta `frontend/`.
3.  Audit `docker-compose.yml` dan konfigurasi Nginx.
4.  Periksa nama variabel yang diperlukan di `.env.example` tanpa
    menampilkan nilai rahasia dari `.env`.
5.  Tentukan urutan instalasi dan cara menjalankan stack lokal.
6.  Jalankan aplikasi dan catat baseline sebelum perubahan fitur.

Dokumen ini menjadi konteks awal proyek dan dapat diperbarui setelah
audit repository selesai.
