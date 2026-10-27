# Rules: Standar Pengembangan & Keamanan Niskala

**Dokumen Acuan:** `docs/project-plan-undangan-digital.md`  
**Cakupan:** Aturan backend, frontend, arsitektur, keamanan, dan alur kerja AI/Developer.

---

## 1. Prinsip Utama Pengembangan

1. **Verify Before Action:** Selalu periksa kode dan konfigurasi aktual sebelum berasumsi atau mengubah logika.
2. **One Step at a Time:** Selesaikan satu perubahan fungsional secara teruji sebelum berpindah ke modul berikutnya.
3. **Preserve Documentation Integrity:** Jangan menghapus komentar atau dokumentasi yang masih relevan.
4. **No Destructive Overwrite:** Jangan pernah menimpa file konfigurasi lingkungan (`.env`, docker compose) tanpa memahami dampaknya secara menyeluruh.
5. **No Forced Dependencies:** Jangan meng-upgrade atau menambah library baru sebelum memastikan kompatibilitasnya dengan React 19 dan PHP 8.3/Laravel 12.

---

## 2. Aturan Keamanan & Otorisasi (Security Rules)

### 2.1 Pencegahan IDOR (Insecure Direct Object Reference)
* **Kewajiban Server-Side Policy:** Setiap controller yang menangani operasi CRUD undangan, tamu, atau RSVP **wajib** menggunakan Laravel Authorization Policy.
* **Scope Kepemilikan:**
  ```php
  // BENAR: Selalu filter berdasarkan pemilik atau pastikan policy memvalidasi kepemilikan
  $invitation = $request->user()->invitations()->findOrFail($id);
  
  // SALAH: Mencari langsung tanpa verifikasi akses pengguna
  $invitation = Invitation::findOrFail($id);
  ```
* Pelanggan **hanya boleh** mengakses data miliknya sendiri. Admin memiliki akses menyeluruh untuk keperluan layanan bantuan.

### 2.2 Isolasi Draft vs Publik
* Undangan berstatus `draft` **dilarang keras** dapat diakses melalui endpoint publik `GET /api/v1/public/invitations/{slug}`.
* Endpoint publik hanya mengembalikan data jika `status === 'published'`. Jika status adalah `draft` atau `archived`, endpoint wajib merespons `404 Not Found` (atau pesan penutup yang terisolasi).

### 2.3 Sanitasi & Registry Komponen Konten Undangan
* **Larangan Eksekusi Kode Arbitrer:** Pengguna **tidak boleh** menyimpan atau mengirim kode HTML mentah (`<script>`, `<iframe>` tidak terverifikasi) atau sintaks JavaScript bebas ke database.
* **Component Registry Pattern:** Seluruh konten undangan wajib berupa structured JSON dengan komponen yang terdaftar:
  ```json
  {
    "schema_version": "1.0",
    "theme_id": "classic-ivory",
    "sections": [
      {
        "id": "hero-section-1",
        "type": "HeroCover",
        "props": {
          "title": "The Wedding of Rama & Shinta",
          "date": "2026-12-12",
          "cover_image": "storage/invitations/covers/sample.jpg"
        }
      }
    ]
  }
  ```
* Renderer publik hanya merender komponen yang telah terdaftar di registry frontend. Komponen tidak dikenal wajib diabaikan secara aman.

### 2.4 Keamanan Unggahan Berkas (File Upload)
* Validasi berkas mencakup MIME-type aktual (bukan hanya ekstensi), ukuran maksimum (maks. 10MB), dan pemindaian dasar ekstensi berbahaya.
* Seluruh berkas disimpan dengan nama acak/hash unik di disk lokal publik (`storage/app/public/...`), tidak pernah menggunakan nama asli berkas dari pengguna.

### 2.5 Reserved Slugs (Slug yang Dicadangkan)
Slug undangan publik tidak boleh menabrak rute sistem. Slug berikut **wajib dicadangkan** dan ditolak saat validasi pembuatan/perubahan slug:
* `admin`, `api`, `login`, `register`, `logout`, `dashboard`
* `docs`, `storage`, `up`, `setup`, `themes`, `settings`
* `public`, `assets`, `favicon.ico`, `robots.txt`

---

## 3. Standar Backend (Laravel 12 API)

### 3.1 Konvensi Penamaan Tabel Database (Prefixing Convention)
Agar database rapi dan mudah dibedakan antara data master, data transaksi pengguna, dan sistem:
1. **Master Data (`ms_`):** Tabel referensi/katalog sistem.
   * `ms_themes`: Katalog tema dan preset desain.
   * `ms_music`: Katalog lagu latar bawaan.
2. **Transaksi / Operasional (`tr_`):** Tabel data dinamis yang dibuat/dikelola user.
   * `tr_invitations`: Undangan digital milik user.
   * `tr_invitation_contents`: Struktur block/section dan pengaturan undangan.
   * `tr_invitation_events`: Sesi rangkaian acara (Akad, Resepsi, dll).
   * `tr_guests`: Daftar tamu undangan.
   * `tr_rsvps`: Konfirmasi kehadiran dan ucapan/doa tamu.
   * `tr_service_orders`: Tiket permintaan bantuan pembuatan undangan.
3. **Audit & Log (`log_`):** Tabel pencatatan riwayat aktivitas operasional.
   * `log_audits`: Catatan tindakan kritis admin dan perubahan penting.
4. **Bawaan System / Laravel (Tanpa Prefix):** Dibiarkan asli sesuai bawaan framework template:
   * `users`, `roles`, `menus`, `rolemenus`, `companies`, `personal_access_tokens`, `cache`, `jobs`, `migrations`.
5. **Model Eloquent:** Model tetap menggunakan nama entitas tunggal bersih (misal: `Theme`, `Invitation`, `Guest`) dengan mendefinisikan properti eksplisit `protected $table = 'ms_themes';`, `protected $table = 'tr_invitations';`, dst.

### 3.2 Format Respons & Validasi API
   ```json
   {
     "data": null,
     "message": "Deskripsi pesan status",
     "errors": null
   }
   ```
2. **Form Request Validation:** Seluruh validasi request dipisahkan ke dalam class `FormRequest` khusus, bukan ditulis langsung di dalam controller.
3. **Dokumentasi OpenAPI / Swagger:** Setiap controller dan endpoint baru wajib dilengkapi anotasi OpenAPI lengkap (`@OA\Get`, `@OA\Post`, `@OA\Parameter`, `@OA\Response`) sehingga dokumentasi Swagger selalu sinkron.
4. **Relasi & Database:**
   * Gunakan tipe data MySQL yang tepat (`json` untuk dokumen konten, `enum` atau `string` terindeks untuk status).
   * Berikan foreign key constraint dan index pada kolom pencarian (`slug`, `user_id`, `event_date`).

---

## 4. Standar Frontend (React 19 & Vite)

1. **Sentralisasi HTTP Client:** Semua request ke server wajib melalui [frontend/src/services/api.js](file:///var/www/html/niskala/frontend/src/services/api.js). Tidak boleh memanggil `axios` langsung secara acak di dalam komponen view.
2. **Penanganan Error Terpusat:** Manfaatkan interceptor dan layanan toast yang sudah ada (`toastService`) untuk umpan balik interaktif saat request gagal atau sukses.
3. **Editor State Management:**
   * Gunakan local reducer / state khusus untuk editor kanvas.
   * Setiap perubahan memicu preview lokal instan.
   * Simpan draft ke server dengan mekanisme debounce (misal: 1500ms setelah pengetikan berhenti).
   * Sediakan riwayat undo/redo lokal tanpa membuat HTTP request berulang untuk tiap langkah undo.
4. **Mobile-First Public Renderer:**
   * Tampilan publik undangan wajib dioptimalkan untuk layar ponsel (rentang 360px – 430px) sebelum desktop.
   * Gambar harus mendukung responsive loading (`loading="lazy"`).

---

## 5. Pengujian & Verifikasi

Sebelum menyatakan suatu tugas/fitur selesai:
1. Jalankan `npm run lint` dan `npm run build` di frontend untuk memastikan tidak ada syntax error atau bundle issue.
2. Jalankan `php artisan test` di backend untuk memvalidasi fitur dan otorisasi.
3. Pastikan container Docker tetap dalam kondisi `healthy` tanpa peringatan restart loop.

