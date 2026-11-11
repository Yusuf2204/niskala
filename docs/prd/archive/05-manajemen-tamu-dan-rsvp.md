# PRD 05: Manajemen Tamu & Sistem RSVP

**Fase Roadmap:** Mendukung Fase 1, 2, dan 3  
**Dokumen Acuan:** [project-plan-undangan-digital.md](file:///var/www/html/niskala/docs/project-plan-undangan-digital.md) | [rules.md](file:///var/www/html/niskala/docs/rules.md) | [context.md](file:///var/www/html/niskala/docs/context.md) | [02-navigasi-menu-dan-master-data.md](file:///var/www/html/niskala/docs/prd/02-navigasi-menu-dan-master-data.md)  
**Status:** Draf Spesifikasi Lengkap

---

## 1. Ringkasan & Tujuan Produk

Sistem ini melayani dua kebutuhan krusial:
1. **Bagi Penyelenggara/Pengantin:** Mengelola daftar nama tamu, mengelompokkan kategori (VIP, Keluarga, Teman), mengalokasikan kuota kursi/pax, membagikan tautan undangan personal via WhatsApp, dan memantau rekapitulasi konfirmasi kehadiran (RSVP) secara *real-time*.
2. **Bagi Tamu Undangan:** Mengonfirmasi kehadiran secara mudah dan menuliskan untaian doa/ucapan selamat yang langsung muncul pada buku tamu digital.

---

## 2. Struktur Database & Skema Migrasi

### 2.1 Tabel `tr_guests`
```sql
CREATE TABLE `tr_guests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invitation_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug_token` VARCHAR(64) NULL COMMENT 'Unique token for personalized link tracking',
  `phone_number` VARCHAR(30) NULL,
  `category` VARCHAR(50) DEFAULT 'General' COMMENT 'VIP, Family, Colleague, Friend',
  `pax_allocated` TINYINT UNSIGNED DEFAULT 1 COMMENT 'Number of seats reserved for this guest',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`invitation_id`) REFERENCES `tr_invitations`(`id`) ON DELETE CASCADE,
  INDEX `idx_guests_invitation` (`invitation_id`),
  INDEX `idx_guests_token` (`slug_token`)
);
```

### 2.2 Tabel `tr_rsvps`
```sql
CREATE TABLE `tr_rsvps` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invitation_id` BIGINT UNSIGNED NOT NULL,
  `guest_id` BIGINT UNSIGNED NULL COMMENT 'Linked guest record if accessed via personal token',
  `guest_name` VARCHAR(150) NOT NULL,
  `attendance_status` ENUM('attending', 'not_attending', 'tentative') NOT NULL,
  `pax_count` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `message` TEXT NULL COMMENT 'Ucapan selamat dan doa restu',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `is_hidden` BOOLEAN DEFAULT FALSE COMMENT 'Moderation flag for inappropriate greetings',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`invitation_id`) REFERENCES `tr_invitations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`guest_id`) REFERENCES `tr_guests`(`id`) ON DELETE SET NULL,
  INDEX `idx_rsvps_invitation_status` (`invitation_id`, `attendance_status`)
);
```

---

## 3. Alur Personalisasi Tautan Tamu & WhatsApp

```text
Dashboard Pengantin / Host
      │
      ├── Input Tamu: "Bapak Surya & Ibu" (Kategori: VIP)
      ▼
Sistem Menghasilkan Tautan Personal:
domain.com/rama-shinta?to=Bapak+Surya+%26+Ibu
      │
      ▼
Tombol "Kirim via WhatsApp":
https://api.whatsapp.com/send?phone=62812345678&text=Halo%20Bapak%20Surya...
```

1. **Format Tautan Personal:**
   * Melalui parameter URL `?to={Nama+Tamu}` (mudah dibagikan dan fleksibel tanpa registrasi sebelumnya).
   * Atau melalui token unik `?c={slug_token}` untuk tamu yang terdaftar di database.
2. **Template Pesan WhatsApp Otomatis:**
   * Tombol satu klik di dashboard untuk membuka WhatsApp Web / App dengan draf pesan sopan yang memuat tautan personal tamu.

---

## 4. Spesifikasi Endpoint REST API

### 4.1 Endpoint Publik (Tamu)
| Method | Endpoint | Fungsi & Validasi |
|---|---|---|
| `GET` | `/api/v1/public/invitations/{slug}/wishes` | Mengambil daftar ucapan selamat (paginasi 10 item, hanya yang `is_hidden = false`). |
| `POST` | `/api/v1/public/invitations/{slug}/rsvps` | Mengirim konfirmasi kehadiran & ucapan. **Rate limit: 5 request/menit/IP**. Sanitasi teks murni (strip HTML). |

### 4.2 Endpoint Terproteksi (Host / Admin Dashboard)
| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/v1/invitations/{id}/guests` | Daftar tamu undangan dengan filter kategori & pencarian nama. |
| `POST` | `/api/v1/invitations/{id}/guests` | Menambah tamu baru (single / batch import). |
| `DELETE` | `/api/v1/invitations/{id}/guests/{guestId}` | Menghapus tamu dari daftar. |
| `GET` | `/api/v1/invitations/{id}/rsvps` | Rekapitulasi RSVP: Total Hadir, Tidak Hadir, Ragu, & total perkiraan pax. |
| `PUT` | `/api/v1/invitations/{id}/rsvps/{rsvpId}/moderate` | Moderasi ucapan (sembunyikan/tampilkan ucapan di buku tamu). |
| `GET` | `/api/v1/invitations/{id}/rsvps/export` | Ekspor rekapitulasi daftar tamu & RSVP ke format CSV/Excel. |

---

## 5. Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

1. [ ] **Pengiriman RSVP Publik:** Tamu dapat mengirim RSVP dan ucapan pada undangan published, data langsung tersimpan di database.
2. [ ] **Throttling & Keamanan:** Pengiriman formulir RSVP dibatasi rate limiter (maksimal 5x per menit per IP) untuk mencegah spam bot.
3. [ ] **Sanitasi Pesan:** Script injection (`<script>alert(1)</script>`) pada kolom ucapan otomatis dibersihkan dan hanya disimpan sebagai teks biasa yang aman.
4. [ ] **Rekapitulasi Akurat:** Dashboard pengantin menampilkan jumlah konfirmasi kehadiran secara tepat (misal: 150 Hadir, 20 Tidak Hadir, 10 Ragu).
5. [ ] **Moderasi Ucapan:** Host atau admin dapat menyembunyikan komentar yang tidak pantas, dan ucapan tersebut otomatis hilang dari feed publik.

