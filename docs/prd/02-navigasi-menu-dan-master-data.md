# PRD 02: Navigasi Menu CMS, Master Data & Pengelolaan Undangan

**Fase Roadmap:** Fase 1.5 (Fondasi Navigasi CMS & Antarmuka Undangan)  
**Dokumen Acuan:** [project-plan-undangan-digital.md](file:///var/www/html/niskala/docs/project-plan-undangan-digital.md) | [rules.md](file:///var/www/html/niskala/docs/rules.md) | [design.md](file:///var/www/html/niskala/docs/design.md) | [01-fondasi-data-dan-api.md](file:///var/www/html/niskala/docs/prd/01-fondasi-data-dan-api.md)  
**Status:** Selesai Diimplementasi & Terverifikasi (Fase 1.5)

---

## 1. Ringkasan & Tujuan Produk

Setelah fondasi database dan REST API inti selesai dibangun pada PRD 01, modul ini bertujuan menyediakan **kerangka navigasi aplikasi CMS (sidebar navigation)**, **pengelolaan master data pendukung**, serta **antarmuka daftar dan pembuatan undangan awal bagi pengguna**.

Modul ini menjadi gerbang utama (*entry point*) sebelum pengguna masuk ke kanvas interaktif **PRD 03: Visual Drag-and-Drop Editor**. Tanpa modul ini, pengguna tidak memiliki antarmuka untuk memilih tema, melihat daftar undangannya, atau mengelola master musik dan tema.

---

## 2. Struktur Menu & Matriks Hak Akses (Role-Based Navigation)

Struktur menu disimpan pada tabel sistem `menus` dan dipetakan ke peran pengguna melalui tabel `rolemenus`. Menu disajikan secara dinamis di sidebar CoreUI frontend melalui `NavigationService::forRole()`.

### 2.1 Peta Hirarki Menu

```text
├── 1. Dashboard (/dashboard) [Icon: cilSpeedometer]
├── 2. Master (/master) [Icon: cilLayers]
│   ├── 2.1 Tema Desain (/master/themes) [Icon: cilPaint]
│   └── 2.2 Musik Latar (/master/music) [Icon: cilMusicNote]
├── 3. Undangan (/invitations) [Icon: cilEnvelopeClosed]
│   ├── 3.1 Daftar Undangan (/invitations)
│   └── 3.2 Buat Undangan (/invitations/create)
├── 4. Tamu & RSVP (/guests) [Icon: cilPeople] (PRD 05)
│   ├── 4.1 Buku Tamu (/guests)
│   └── 4.2 Rekap RSVP & Doa (/guests/rsvp)
├── 5. Layanan Bantuan (/service-orders) [Icon: cilNotes] (PRD 06)
└── 6. Setup (/setup) [Icon: cilSettings]
    ├── 6.1 Profil Perusahaan (/setup/company)
    ├── 6.2 Manajemen User (/setup/users)
    ├── 6.3 Manajemen Role (/setup/roles)
    ├── 6.4 Manajemen Menu (/setup/menus)
    ├── 6.5 Hak Akses Role (/setup/role-permissions)
    └── 6.6 Ganti Password (/setup/change-password)
```

### 2.2 Matriks Hak Akses Peran Pengguna

| Menu | Path | Role Admin | Role Customer / User | Catatan |
|---|---|:---:|:---:|---|
| **Dashboard** | `/dashboard` | ✅ Akses | ✅ Akses | Menampilkan metrik sesuai scope (global vs milik user) |
| **Master: Tema** | `/master/themes` | ✅ Kelola (CRUD) | 👁️ Lihat Katalog | Pelanggan dapat melihat katalog tema yang aktif |
| **Master: Musik** | `/master/music` | ✅ Kelola (CRUD) | 👁️ Pratinjau Lagu | Pelanggan dapat memutar dan memilih lagu latar |
| **Daftar Undangan** | `/invitations` | ✅ Semua Undangan | ✅ Undangan Milik Sendiri | Anti-IDOR: Pelanggan hanya melihat undangannya |
| **Buat Undangan** | `/invitations/create` | ✅ Buat | ✅ Buat | Form wizard pemilihan tema & input awal |
| **Tamu & RSVP** | `/guests` | ✅ Akses | ✅ Undangan Miliknya | Menuju pengelolaan buku tamu per undangan |
| **Layanan Bantuan**| `/service-orders` | ✅ Kelola Tiket | ✅ Buat Tiket | Modul pendukung operasional (PRD 06) |
| **Setup (System)** | `/setup/*` | ✅ Akses Lengkap | ❌ Tersembunyi | Kecuali `/setup/change-password` yang dapat diakses semua role |

---

## 3. Modul Master Data (`/master`)

### 3.1 Master Tema Desain (`/master/themes`)
* **Tujuan:** Menampilkan katalog tema undangan (`ms_themes`), pratinjau thumbnail, palet warna, tipografi, dan status keaktifan tema.
* **Fitur UI:**
  * Card grid / table view tema dengan preview thumbnail dan tag kategori (`wedding`, `birthday`, `general`).
  * Modal detail tema: Menampilkan pratinjau swatch warna (Ivory 60%, Charcoal 30%, Gold 10%) dan default font.
  * Switch toggle aktif/non-aktif tema (khusus role `admin`).

### 3.2 Master Musik Latar (`/master/music`)
* **Tabel Database `ms_music`:**
  ```sql
  CREATE TABLE `ms_music` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `artist` VARCHAR(100) NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'wedding',
    `duration_seconds` INT UNSIGNED NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
  );
  ```
* **Fitur UI:**
  * Audio preview mini-player: Tombol play/pause langsung dari daftar tabel.
  * Modal upload audio (MP3, maks. 5MB) dengan penamaan acak pada disk lokal publik `storage/music/`.
  * Filter kategori lagu (romantis, islami, akustik, tradisional).

---

## 4. Modul Kelola Undangan (`/invitations`)

### 4.1 Halaman Daftar Undangan (`/invitations`)
* **Tujuan:** Pusat komando pelanggan untuk memantau semua undangan digital miliknya.
* **Fitur UI:**
  * **Header:** Judul halaman "Undangan Saya", rekap total undangan, dan tombol CTA utama **"+ Buat Undangan Baru"** bernuansa Charcoal `#34342F` dengan aksen Gold `#A68B65`.
  * **Filter Tab:** *Semua*, *Draf*, *Published*, *Archived*.
  * **Card / Table Tampilan:**
    * Thumbnail cover undangan & badge status berwarna (Draft: Amber, Published: Green, Archived: Muted Gray).
    * Judul undangan, tanggal acara, slug URL (`domain.com/{slug}`).
    * Informasi tema yang digunakan.
  * **Tombol Tindakan Cepat (Action Buttons):**
    1. **Edit Desain:** Membuka Visual Editor (`/invitations/{id}/editor` - PRD 03).
    2. **Buku Tamu & RSVP:** Melompat ke manajemen tamu undangan ini (`/invitations/{id}/guests` - PRD 05).
    3. **Buka Tautan Publik:** Membuka jendela baru pratinjau undangan publik (`/{slug}`).
    4. **Arsipkan / Hapus:** Dropdown opsi manajemen siklus hidup undangan.

### 4.2 Alur Wizard Pembuatan Undangan (`/invitations/create`)
Wizard 2-langkah yang ringkas dan ramah pengguna sebelum melompat ke Visual Editor:
1. **Langkah 1: Pilih Tema Desain**
   * Menampilkan katalog tema aktif dari `GET /api/v1/themes`.
   * Pilihan visual dengan kartu bertanda centang aktif.
2. **Langkah 2: Informasi Dasar Undangan**
   * Judul Undangan (misal: "Pernikahan Rama & Shinta").
   * Kategori Acara (Pernikahan / Ulang Tahun / Umum).
   * Kustomisasi Slug URL (otomatis terisi dari judul dengan validasi instan slug duplikat & reserved slug).
   * Informasi Awal Acara: Tanggal utama, waktu mulai, dan nama lokasi (opsional).
3. **Eksekusi:**
   * Memanggil endpoint `POST /api/v1/invitations` yang telah dibangun pada PRD 01.
   * Saat menerima respons sukses (201), otomatis mengarahkan browser pengguna ke `/invitations/{id}/editor` (PRD 03).

---

## 5. Standar Desain & Antarmuka Frontend

* Mengikuti pedoman palet [design.md](file:///var/www/html/niskala/docs/design.md):
  * Latar belakang konten: Ivory `#F1EDE5` / `#FAF8F5`.
  * Kartu dan tabel: Border halus `#E5DFC5` dengan radius `8px`.
  * Teks utama & heading: Charcoal `#34342F` dengan tipografi *Plus Jakarta Sans*.
  * Tombol aksi primer & badge aksen: Muted Gold `#A68B65` dan Charcoal `#34342F`.
* Responsif terhadap layar tablet dan desktop pada seluruh halaman CMS.

---

## 6. Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

1. [x] **Hirarki Menu Database Lengkap:** Seeder `MenuSeeder` dan `RoleMenuSeeder` memasukkan seluruh menu baru (`/master`, `/master/themes`, `/master/music`, `/invitations`, `/invitations/create`, `/guests`, `/service-orders`) dengan ikon CoreUI yang sesuai.
2. [x] **Hak Akses Role Tervalidasi:** User dengan role `customer` hanya melihat menu yang relevan (Dashboard, Undangan, Tamu/RSVP, Layanan Bantuan, Change Password) tanpa menu Setup.
3. [x] **Tabel & API Musik Latar:** Migrasi `ms_music` berjalan lancar, dan endpoint REST API `GET /api/v1/music` siap melayani pemilihan lagu latar.
4. [x] **Halaman Daftar Undangan Terhubung:** Frontend `/invitations` berhasil memuat data dari `GET /api/v1/invitations`, mendukung filter status (Draft/Published/Archived), dan tombol aksi.
5. [x] **Wizard Buat Undangan Mengarah ke Editor:** Alur pembuatan `/invitations/create` berhasil menyimpan undangan baru berstatus `draft` dan melakukan redirect otomatis ke editor.

