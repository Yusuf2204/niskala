# Niskala

Niskala adalah platform undangan digital dan content management system berbasis Laravel dan React.
Proyek ini menyediakan layanan pembuatan undangan digital, manajemen pengguna, role dan permission,
menu dinamis, pengaturan identitas perusahaan, dashboard ringkas, serta dokumentasi OpenAPI.

## Fitur Utama

- Autentikasi token menggunakan Laravel Sanctum
- Users dan roles CRUD
- Menu bertingkat dan role-based navigation
- Pengaturan identitas platform/perusahaan, logo, dan favicon
- Dashboard summary
- Respons API yang konsisten
- Dokumentasi Swagger/OpenAPI
- Penanganan error dan validasi terpusat di frontend
- Deployment Docker lengkap (reverse proxy, backend, frontend, database MySQL)

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Backend | Laravel 12, PHP 8.3+, Laravel Sanctum |
| Frontend | React 19, Vite 7, Redux, CoreUI |
| API Docs | L5 Swagger / OpenAPI |
| Database | MySQL 8.0 (Docker container) |
| Deployment | Docker Compose, Nginx reverse proxy |

## Struktur Proyek

```text
niskala/
├── backend/          Laravel REST API dan Swagger
├── frontend/         React application
├── nginx/            Reverse proxy configuration
├── docker-compose.yml
├── .env              Docker environment variables
└── README.md
```

## Persyaratan

### Development Lokal

- PHP 8.2 atau lebih baru
- Composer 2
- Node.js 20 atau lebih baru
- npm
- Database MySQL/MariaDB

### Docker Deployment

- Docker Engine 24+
- Docker Compose v2

---

## Instalasi Development Lokal

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Atur koneksi database dan akun administrator di `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=niskala
DB_USERNAME=root
DB_PASSWORD=

ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
```

Password admin minimal 12 karakter. Setelah konfigurasi selesai:

```bash
php artisan migrate --seed
php artisan l5-swagger:generate
php artisan serve
```

Backend tersedia di `http://127.0.0.1:8000`.

### 2. Frontend

Buka terminal lain:

```bash
cd frontend
npm ci
npm start
```

Frontend tersedia di `http://localhost:3000`. Vite secara otomatis mem-proxy
request `/api` ke backend di `http://localhost:8000`.

---

## Deployment Docker

Stack Docker Niskala mencakup database MySQL 8.0, backend Laravel, frontend React SPA, dan Nginx reverse proxy.

### Arsitektur

```text
Pengguna / Klien
    │
    ▼
 Nginx Reverse Proxy (:8031)
    │
    ├── /           → Frontend Container (:80)
    ├── /api/*      → Backend Container (:80)
    ├── /storage/*  → Backend Media Storage (:80)
    ├── /docs/*     → Swagger UI & API Docs (:80)
    └── /up         → Backend Health Check (:80)
                            │
                            ▼
                      MySQL Container (:3306)
```

### Konfigurasi

Salin template environment ke `.env` di root proyek:

```bash
cp .env.example .env
nano .env
```

Nilai port dan kredensial default yang disediakan sudah siap pakai:

```dotenv
NGINX_PORT=8031
BACKEND_PORT=9003
FRONTEND_PORT=9004
DB_EXTERNAL_PORT=3320

DB_DATABASE=niskala
DB_USERNAME=niskala
DB_PASSWORD=niskala_db_secret123

ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_admin_password_123
```

### Menjalankan

```bash
# Build dan jalankan semua service di background
docker compose up -d --build

# Cek status seluruh container
docker compose ps

# Lihat logs jika diperlukan
docker compose logs -f backend
docker compose logs -f db
```

### Menghentikan

```bash
docker compose down
```

Untuk mereset database dan storage jika diperlukan instalasi ulang bersih:

```bash
docker compose down -v
```

### Restart

```bash
docker compose restart
```

### Update (setelah git pull)

```bash
docker compose down
docker compose up -d --build
```

### Service dan Port

| Service | Container Name | Host Port | Internal | Keterangan |
| --- | --- | --- | --- | --- |
| Nginx Reverse Proxy | `niskala-proxy` | `8031` | `80` | Entrypoint utama aplikasi |
| Backend | `niskala-backend` | `9003` | `80` | Laravel 12 API & Nginx |
| Frontend | `niskala-frontend` | `9004` | `80` | React SPA static build |
| Database | `niskala-db` | `3320` | `3306` | MySQL 8.0 (data persist) |

---

## URL Akses Docker

| Layanan | URL | Keterangan |
| --- | --- | --- |
| Aplikasi Utama | `http://localhost:8031` | Akses web frontend via proxy |
| API Base URL | `http://localhost:8031/api` | REST API |
| Health Check | `http://localhost:8031/up` | Status kesiapan Laravel |
| Swagger Docs | `http://localhost:8031/api/documentation` | Dokumentasi interaktif OpenAPI |
| Direct Frontend (Dev) | `http://localhost:9004` | Container frontend langsung |
| Direct Backend (Dev) | `http://localhost:9003` | Container backend langsung |

Di Swagger, jalankan endpoint login, salin token yang diterima, lalu gunakan
tombol **Authorize** dengan bearer token tersebut untuk menguji endpoint
terproteksi.

---

## Verifikasi

Backend:

```bash
cd backend
php artisan test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

---

## Dokumentasi

- [Panduan backend](backend/README.md)
- [Panduan frontend](frontend/README.md)
- [Panduan deployment production](backend/docs/production-deployment.md)

---

## Production

Jangan gunakan nilai `.env` development di server production. Gunakan
`backend/.env.production.example` sebagai acuan, nonaktifkan debug, batasi CORS,
gunakan HTTPS, dan simpan secret di luar version control.

Build frontend production dibuat dengan:

```bash
cd frontend
npm ci
npm run build
```

Hasil build berada di `frontend/build`.

Untuk deployment Docker production, gunakan `.env` root dengan `APP_ENV=production`
dan `APP_DEBUG=false`, lalu jalankan `docker compose up -d --build`.
