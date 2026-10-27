# Design System & UI/UX Guidelines: Niskala

**Dokumen Acuan:** `docs/project-plan-undangan-digital.md`  
**Filosofi:** Elegan, abadi (*timeless*), bernuansa hangat dan premium, dengan keseimbangan visual modern dan sentuhan budaya.

---

## 1. Palet Warna & Kaidah 60-30-10

Niskala menggunakan prinsip proporsi warna visual **60-30-10** untuk menciptakan tampilan yang harmonis, nyaman di mata, dan berkelas:

```text
┌────────────────────────────────────────────────────────┐
│  60% Ivory (#F1EDE5)                                   │  Latar belakang, ruang kosong,
│  Bidang dominan kanvas & kartu                         │  kertas bertekstur halus
├──────────────────────────────┬─────────────────────────┤
│  30% Charcoal (#34342F)      │  10% Muted Gold         │
│  Teks, navbar, tombol utama  │  (#A68B65)              │
│  Kontras & struktur tegas    │  Aksen, border, ikon    │
└──────────────────────────────┴─────────────────────────┘
```

### 1.1 Tabel Palet Warna (Light & Dark Theme)

| Peran Elemen | Light Theme | Dark Theme | Penggunaan & Penerapan |
| --- | --- | --- | --- |
| **Primary** | `#34342F` (Charcoal) | `#D8C2A0` (Champagne Gold) | Tombol utama, header aktif, elemen penegas utama |
| **Background** | `#F1EDE5` (Ivory) | `#242420` (Deep Espresso) | Latar belakang seluruh halaman, kanvas editor, card body |
| **Text** | `#34342F` (Charcoal) | `#F1EDE5` (Ivory Soft) | Teks utama, judul, label input formulir |
| **Aksen Tambahan** | `#A68B65` (Muted Gold) | `#D8C2A0` (Champagne Gold) | Garis pemisah ornamen, badge status, highlight, ikon aktif |

### 1.2 Warna Semantik Tambahan
* **Surface / Card (Light):** `#FAF8F5` (Ivory sedikit lebih terang untuk kedalaman)
* **Surface / Card (Dark):** `#2D2D28`
* **Success:** `#4A7C59` (Sage Green — konfirmasi kehadiran / tersimpan)
* **Danger:** `#B85C56` (Terracotta Red — hapus, batalkan, tolak)
* **Warning:** `#D4A373` (Warm Amber — status menunggu / pending)
* **Border Lembut:** `rgba(52, 52, 47, 0.12)` (Light) / `rgba(216, 194, 160, 0.18)` (Dark)

### 1.3 Variabel SCSS / CSS Custom Properties
```scss
:root {
  // Light Theme (Default)
  --bg-color: #F1EDE5;
  --surface-color: #FAF8F5;
  --text-primary: #34342F;
  --text-muted: rgba(52, 52, 47, 0.65);
  --primary-color: #34342F;
  --accent-gold: #A68B65;
  --border-color: rgba(52, 52, 47, 0.12);
}

[data-coreui-theme="dark"],
.theme-dark {
  // Dark Theme
  --bg-color: #242420;
  --surface-color: #2D2D28;
  --text-primary: #F1EDE5;
  --text-muted: rgba(241, 237, 229, 0.70);
  --primary-color: #D8C2A0;
  --accent-gold: #D8C2A0;
  --border-color: rgba(216, 194, 160, 0.18);
}
```

---

## 2. Tipografi (Typography)

Penggunaan kombinasi dua gaya huruf (*Font Pairing*) untuk membedakan antara nuansa perayaan dan fungsionalitas UI:

1. **Display & Headings (Serif Elegan):**
   * *Contoh Font:* `Playfair Display`, `Cormorant Garamond`, atau `Cinzel`.
   * *Penggunaan:* Judul undangan, nama mempelai/penyelenggara, kutipan ayat/doa, tajuk section utama.
   * *Karakter:* Mewah, anggun, mencerminkan formalitas dan estetika perayaan.
2. **Body & Interface (Clean Sans-Serif):**
   * *Contoh Font:* `Plus Jakarta Sans` atau `Inter`.
   * *Penggunaan:* Teks deskripsi, rincian waktu & tempat, form input, tabel dashboard, tombol aksi, dan navigasi.
   * *Karakter:* Keterbacaan (*readability*) tinggi pada resolusi ponsel, presisi, dan modern.

---

## 3. Sistem Layout & Tampilan Antarmuka

### 3.1 Dashboard & CMS Pelanggan/Admin
* **Sidebar:** Berlatar Charcoal (`#34342F`), teks terang Ivory (`#F1EDE5`), dengan status item menu aktif berhiaskan aksen Muted Gold (`#A68B65`).
* **Header & Topbar:** Bersih dengan latar Ivory / Surface, menampilkan identitas platform, breadcrumb, dan profil user.
* **Content Cards:** Kartu informasi menggunakan border halus, bayangan sangat lembut (*subtle elevation*), dan tombol aksi Charcoal berteks Ivory.

---

### 3.2 Visual Drag-and-Drop Editor
Tata letak editor dibagi menjadi 4 zona kerja utama:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  TOPBAR: Judul Undangan | Status Draft/Published | Undo | Redo | Preview | Simpan | Publish │
├──────────────┬──────────────────────────────────────────┬──────────────┤
│ PANEL KIRI   │ KANVAS TENGAH (PREVIEW INTERAKTIF)       │ PANEL KANAN  │
│ (Komponen)   │                                          │ (Properti)   │
│              │          ┌───────────────────┐           │              │
│ • Hero Cover │          │   Bingkai Mobile  │           │ Form Edit:   │
│ • Mempelai   │          │   (375px / 390px) │           │ • Ganti Foto │
│ • Acara/Sesi │   Drag   │                   │   Klik    │ • Ubah Teks  │
│ • Countdown  │  ─────►  │   [ Hero Cover ]  │  ──────►  │ • Warna &    │
│ • Lokasi/Map │          │   [ Mempelai   ]  │   Section │   Font       │
│ • Galeri     │          │   [ Countdown  ]  │           │ • Atur Waktu │
│ • RSVP/Buku  │          │   [ Lokasi     ]  │           │              │
│ • Musik      │          └───────────────────┘           │              │
└──────────────┴──────────────────────────────────────────┴──────────────┘
```

1. **Top Bar:** Kontrol status dokumen (indikator autosave tersimpan, tombol Undo/Redo, tombol Switch Device Desktop/Mobile, Preview Modal, dan Tombol Publish).
2. **Left Panel (Section Library):** Daftar komponen terdaftar yang dapat di-*drag* atau diklik untuk ditambahkan ke susunan kanvas.
3. **Center Canvas:** Representasi pratinjau langsung di dalam bingkai layar ponsel (*mobile viewport frame*) yang mencerminkan tampilan asli saat diakses tamu. Section dapat digeser (*reordered*) ke atas/bawah.
4. **Right Panel (Property Inspector):** Form kontekstual yang berubah sesuai section yang sedang aktif diklik (mengubah nama pengantin, tanggal, upload foto galeri, titik koordinat peta, konfigurasi RSVP).

---

### 3.3 Halaman Undangan Publik (`domain.com/{slug}`)

Pengalaman pengguna publik dirancang **Mobile-First** vertikal satu kolom dengan alur penceritaan yang runtut:

1. **Cover / Amplop Pembuka (Gate Section):**
   * Menampilkan nama tamu undangan yang dituju (misal: *"Kepada Yth. Bpk/Ibu/Sdr/i: Nama Tamu"*).
   * Tombol elegan beraksen emas *"Buka Undangan"* yang memicu animasi membuka amplop / membuka tirai cover.
   * Musik latar mulai diputar otomatis setelah tombol dibuka (sesuai aturan interaksi browser modern).
2. **Floating Audio Control:**
   * Tombol mengambang di pojok layar (piringan hitam / ikon piringan berputar saat musik play, berhenti saat pause) untuk kemudahan kontrol tamu.
3. **Floating Quick Navigation:**
   * Bilah menu mengambang di bawah layar (*bottom nav pill*) untuk melompat cepat ke bagian: *Acara*, *Lokasi*, *Galeri*, *RSVP*, *Ucapan*.
4. **Section Rangkaian Acara & Countdown:**
   * Penghitung waktu mundur yang dinamis dan tombol *"Simpan ke Kalender"* (Google Calendar / iCal).
5. **Peta & Penunjuk Arah:**
   * Integrasi tombol langsung ke Google Maps / Waze.
6. **Formulir RSVP & Ucapan (Buku Tamu):**
   * Input nama, opsi kehadiran (Hadir / Tidak Hadir), jumlah orang, dan kolom ucapan selamat.
   * Daftar ucapan langsung muncul secara terurut di bawah formulir dengan paginasi/infinite scroll yang rapi.

