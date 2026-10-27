# PRD 01: Fondasi Data & API Undangan

**Fase Roadmap:** Fase 1 (Fondasi Backend Undangan)  
**Dokumen Acuan:** [project-plan-undangan-digital.md](file:///var/www/html/niskala/docs/project-plan-undangan-digital.md) | [rules.md](file:///var/www/html/niskala/docs/rules.md) | [context.md](file:///var/www/html/niskala/docs/context.md)  
**Status:** Draf Spesifikasi Lengkap

---

## 1. Ringkasan & Tujuan Produk

Modul ini adalah fondasi backend bagi seluruh ekosistem undangan Niskala. Modul ini bertanggung jawab atas perancangan database, model relasional, aturan validasi slug, manajemen status siklus hidup undangan (*lifecycle state*), otorisasi anti-IDOR yang ketat, serta penyediaan REST API untuk mengelola undangan.

---

## 2. Struktur Database & Skema Migrasi

### 2.1 Tabel `ms_themes`
Menyimpan katalog master tema bawaan yang dapat dipilih oleh pelanggan saat membuat undangan.
```sql
CREATE TABLE `ms_themes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `category` ENUM('wedding', 'birthday', 'general') DEFAULT 'wedding',
  `description` TEXT NULL,
  `thumbnail` VARCHAR(255) NULL,
  `default_config` JSON NULL COMMENT 'Default palette, fonts, and default section presets',
  `is_active` BOOLEAN DEFAULT TRUE,
  `version` VARCHAR(20) DEFAULT '1.0.0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
);
```

### 2.2 Tabel `tr_invitations`
Menyimpan entitas inti transaksi undangan digital milik pengguna.
```sql
CREATE TABLE `tr_invitations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `theme_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `event_type` ENUM('wedding', 'birthday', 'general') DEFAULT 'wedding',
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `cover_image` VARCHAR(255) NULL,
  `meta_description` TEXT NULL,
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`theme_id`) REFERENCES `ms_themes`(`id`) ON DELETE RESTRICT,
  INDEX `idx_invitations_slug` (`slug`),
  INDEX `idx_invitations_status` (`status`),
  INDEX `idx_invitations_user` (`user_id`)
);
```

### 2.3 Tabel `tr_invitation_contents`
Menyimpan struktur dokumen dan susunan block/section undangan dalam bentuk JSON terstruktur.
```sql
CREATE TABLE `tr_invitation_contents` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invitation_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `schema_version` VARCHAR(20) DEFAULT '1.0.0',
  `sections_data` JSON NOT NULL COMMENT 'Array of ordered section blocks with ID, type, and validated props',
  `music_url` VARCHAR(255) NULL,
  `settings` JSON NULL COMMENT 'Typography, color overrides, animation toggles',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`invitation_id`) REFERENCES `tr_invitations`(`id`) ON DELETE CASCADE
);
```

### 2.4 Tabel `tr_invitation_events`
Menyimpan data sesi acara (misal: Akad Nikah, Pemberkatan, Resepsi) untuk memudahkan kalender, countdown, dan lokasi peta.
```sql
CREATE TABLE `tr_invitation_events` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invitation_id` BIGINT UNSIGNED NOT NULL,
  `event_title` VARCHAR(150) NOT NULL COMMENT 'e.g. Akad Nikah, Resepsi',
  `event_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NULL,
  `time_zone` VARCHAR(50) DEFAULT 'WIB',
  `location_name` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  `google_maps_url` TEXT NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`invitation_id`) REFERENCES `tr_invitations`(`id`) ON DELETE CASCADE,
  INDEX `idx_events_invitation_date` (`invitation_id`, `event_date`)
);
```

---

## 3. Aturan Bisnis & Logika Domain

### 3.1 Aturan Siklus Hidup Undangan (Lifecycle State)
1. **Status Draft:**
   * Setiap undangan baru berstatus `draft`.
   * Konten dapat diubah dan disimpan berkali-kali tanpa memengaruhi publik.
   * `published_at` bernilai `NULL`.
2. **Status Published:**
   * Diaktifkan melalui endpoint khusus `POST /api/v1/invitations/{id}/publish`.
   * Menetapkan `published_at = now()`.
   * Memvalidasi bahwa komponen wajib (Hero/Cover, Acara/Waktu, Mempelai/Penyelenggara) telah diisi.
3. **Status Archived:**
   * Menutup akses RSVP dan menandai acara selesai melalui `POST /api/v1/invitations/{id}/archive`.

### 3.2 Validasi Keunikan Slug & Reserved Slugs
* Slug harus berupa format string URL yang bersih: lowercase, alfanumerik, dan tanda strip (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
* **Reserved Slugs Guard:** Rule validasi kustom `ReservedSlugRule` menolak slug sistem:
  `admin`, `api`, `login`, `register`, `logout`, `dashboard`, `docs`, `storage`, `up`, `setup`, `themes`, `settings`, `public`, `assets`, `favicon.ico`, `robots.txt`.

### 3.3 Otorisasi & Pencegahan IDOR (`InvitationPolicy`)
* `view`: Hanya pemilik undangan (`$user->id === $invitation->user_id`) atau user ber-role `admin`.
* `update`: Hanya pemilik undangan atau user ber-role `admin`.
* `delete`: Hanya pemilik undangan atau user ber-role `admin`.
* `publish` & `archive`: Hanya pemilik undangan atau user ber-role `admin`.

---

## 4. Spesifikasi Endpoint REST API

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/themes` | Daftar tema katalog yang tersedia | Publik / Authenticated |
| `POST` | `/api/v1/invitations` | Membuat undangan baru (status awal `draft`) | Pelanggan / Admin |
| `GET` | `/api/v1/invitations` | Daftar undangan milik user yang login (admin melihat semua) | Pelanggan / Admin |
| `GET` | `/api/v1/invitations/{id}` | Detail lengkap undangan dan section contents | Pemilik / Admin |
| `PUT` | `/api/v1/invitations/{id}` | Update informasi dasar undangan | Pemilik / Admin |
| `PUT` | `/api/v1/invitations/{id}/content` | Menyimpan perubahan draft susunan section JSON | Pemilik / Admin |
| `POST` | `/api/v1/invitations/{id}/publish` | Mengubah status draft menjadi published | Pemilik / Admin |
| `POST` | `/api/v1/invitations/{id}/archive` | Mengarsipkan undangan | Pemilik / Admin |
| `DELETE` | `/api/v1/invitations/{id}` | Menghapus undangan | Pemilik / Admin |

---

## 5. Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

1. [ ] **Migrasi Berjalan Mulus:** Seluruh tabel (`themes`, `invitations`, `invitation_contents`, `invitation_events`) berhasil dimigrasi tanpa error foreign key atau collation.
2. [ ] **Theme Seeder:** Disediakan minimal 2 tema awal (`classic-ivory` dan `modern-charcoal`).
3. [ ] **Anti-IDOR Lolos Uji:** User A tidak bisa melihat, mengedit, atau menghapus undangan milik User B (mengembalikan status `403 Forbidden`).
4. [ ] **Slug Unik & Reserved Slug:** Slug duplikat atau slug terlarang (seperti `api` atau `admin`) ditolak dengan pesan validasi yang jelas (`422 Unprocessable Content`).
5. [ ] **Dokumentasi OpenAPI Sinkron:** Semua controller di atas memiliki anotasi OpenAPI lengkap dan dapat diuji melalui Swagger UI di `http://localhost:8031/api/documentation`.

