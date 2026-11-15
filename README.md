# Panel UMKM Dusun 6, Desa Way Huwi

**Kelola Data & Iuran Bulanan UMKM Berbasis Web untuk Meningkatkan Efektivitas Pengelolaan di Desa Way Huwi**

Proyek Kelompok 4 ini dikembangkan sebagai bagian dari mata kuliah Kapita Selekta Informatika, Institut Teknologi Sumatera (ITERA) 2026.

Satu codebase **Next.js** (App Router): halaman publik, panel admin, dan backend (API route + PostgreSQL) ada di repo yang sama.

## Struktur

| Folder | Isi |
|---|---|
| `app/` | Halaman (`/`, `/umkm/[id]`, `/loginadmin`, `/panel`) dan API (`app/api/...`) |
| `components/` | Komponen React (direktori publik, navbar, panel admin) |
| `lib/server/` | Kode khusus server: koneksi database, sesi admin, validasi |
| `lib/` | Helper bersama client/server (`api.js`, `umkm.js`, `useDebounce.js`) |
| `data/umkm.js` | Daftar kategori + data contoh untuk seed database pertama kali |
| `public/` | Aset statis (foto hero, logo) |

## Teknologi

- **Next.js 15** (App Router) + **React 19** – Framework aplikasi.
- **JavaScript** – Bahasa pemrograman.
- **CSS** (`app/globals.css`) + ikon **Hugeicons** – Tampilan dan layout aplikasi.
- **PostgreSQL** – Database (Neon di produksi; **PGlite** tertanam untuk lokal).
- **Figma** – Perancangan UI/UX.
- **GitHub** – Pengelolaan repository dan kolaborasi tim.

## Fitur Aplikasi

### 1. Direktori Publik

- Daftar UMKM dengan pencarian dan filter kategori.
- Halaman detail UMKM (`/umkm/[id]`): info usaha, galeri foto, peta lokasi, tombol WhatsApp, dan UMKM serupa.
- **Katalog produk** (foto, nama, harga, keterangan) yang bisa diaktifkan per UMKM; bila belum aktif, ditampilkan keterangan bahwa katalog belum diaktifkan penjual.

### 2. Login

Halaman login (`/loginadmin`) dipakai dua jenis akun:

- **Admin desa** — kredensial dari `ADMIN_USER` / `ADMIN_PASS` (env).
- **Akun UMKM** — dibuat admin dari panel, disimpan di tabel `akun` (sandi di-hash scrypt).
  Setelah masuk, pemilik usaha hanya melihat menu "UMKM Saya" dan "Iuran Saya".

Alur pendaftaran UMKM: pemilik usaha menghubungi admin lewat WhatsApp (nomor ada di
tombol hubungi pengurus) → admin membuka **Akun UMKM → Buatkan akun** → kredensial
dikirim kembali lewat WhatsApp.

### 3. Kelola Data UMKM

- Filter data berdasarkan RT (Semua RT, RT 05, 05A, 06, dan 06A).
- Pencarian UMKM dan filter berdasarkan kategori usaha.
- Menambah, mengubah, dan menghapus data UMKM (termasuk foto, galeri, link Google Maps, dan katalog produk).
- Melihat detail UMKM dan jumlah UMKM yang terdata pada setiap RT.
- Menandai UMKM yang sudah/belum punya akun panel.

### 4. Iuran Bulanan

- Rekap dan pencatatan pembayaran iuran per RT untuk periode Januari hingga Desember.
- Menghitung total iuran setiap RT secara otomatis dan mengganti tahun pencatatan.
- Menambah dan menghapus catatan pembayaran melalui tabel.

Nominal iuran awal ditetapkan sebesar **Rp10.000 per bulan**. Semua data tersimpan di database.

### 5. Akun UMKM

- Admin membuatkan akun untuk UMKM yang sudah terdata (satu akun per UMKM).
- Kata sandi di-hash dengan scrypt; tidak pernah dikembalikan oleh API.
- Admin bisa reset kata sandi, menonaktifkan, atau menghapus akun.
- Pemilik UMKM bisa mengganti kata sandinya sendiri (wajib sandi lama).
- Reset sandi / menonaktifkan akun langsung mematikan sesi yang sedang aktif.

## Menjalankan di lokal

Pastikan Node.js dan npm sudah terpasang.

```bash
git clone https://github.com/erzaaf/kapsel.git
cd kapsel
npm install
npm run dev
```

Buka `http://localhost:3000`. Panel: `/loginadmin` (akun admin demo `pemdes` / `desa123`).
Akun UMKM tidak punya akun bawaan — buat dari tab **Akun UMKM** setelah login sebagai admin.

Tanpa konfigurasi apa pun, database memakai **PGlite** yang disimpan di folder `.data/` (tidak ikut di-commit). Tabel dibuat otomatis dan diisi data contoh saat pertama kali dijalankan. Hapus folder `.data/` untuk mengulang dari data contoh.

### Pakai PostgreSQL / Neon

Salin `.env.example` jadi `.env.local`, lalu isi:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (mis. dari Neon). Kosong = PGlite lokal |
| `SESSION_SECRET` | String acak panjang untuk menandatangani cookie sesi. **Wajib diganti di produksi** |
| `ADMIN_USER` / `ADMIN_PASS` | Akun admin panel |

### Pindah data lokal (PGlite) ke Neon

Setelah `DATABASE_URL` diisi di `.env.local`:

```bash
node scripts/migrasi-neon.cjs --dry-run   # cek isi sumber dulu
node scripts/migrasi-neon.cjs             # buat skema + salin umkm & iuran
```

Skrip menyalin apa adanya (id dipertahankan), mengosongkan tabel tujuan lebih dulu supaya idempoten,
lalu menyetel ulang sequence `umkm.id`. Tabel `akun` ikut disalin, jadi kata sandi UMKM tidak perlu
direset setelah pindah database. Perhatian: skrip mengosongkan `akun`, `iuran`, dan `umkm` di tujuan
(`TRUNCATE ... CASCADE`), jadi jangan dijalankan ke database produksi yang sedang dipakai.

## Dokumentasi lain

- [`docs/foto-gmaps.md`](docs/foto-gmaps.md) — cara mengambil foto usaha dari Google Maps, mengecilkannya, dan memasukkannya ke database (termasuk keterangan izin pemakaian foto).

## API

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/umkm` | publik | Daftar UMKM |
| GET | `/api/umkm/:id` | publik | Detail UMKM |
| POST | `/api/umkm` | admin | Tambah UMKM |
| PUT | `/api/umkm/:id` | admin, umkm (milik sendiri) | Ubah UMKM; role umkm tidak bisa mengubah RT |
| DELETE | `/api/umkm/:id` | admin | Hapus UMKM (beserta iurannya) |
| GET | `/api/iuran` | admin | Semua catatan iuran `{ "<id>\|<YYYY-MM>": nominal }` |
| GET | `/api/iuran/saya` | umkm | Riwayat iuran sendiri `{ "YYYY-MM": nominal }` |
| PUT | `/api/iuran` | admin | `{ umkmId, bulan, nominal }`; nominal `0` = hapus |
| GET | `/api/akun` | admin | Daftar akun UMKM |
| POST | `/api/akun` | admin | `{ umkmId, username, password }` |
| PUT | `/api/akun/:id` | admin | `{ username?, password?, aktif? }` |
| DELETE | `/api/akun/:id` | admin | Hapus akun (data UMKM tetap) |
| POST | `/api/auth/login` | publik | `{ username, password }` → cookie sesi + `{ user, role, umkmId }` |
| POST | `/api/auth/logout` | - | Hapus cookie sesi |
| GET | `/api/auth/me` | - | Sesi aktif `{ user, role, umkmId, namaUmkm }` |
| PATCH | `/api/auth/password` | umkm | `{ passwordLama, passwordBaru }` |

## Deployment

Karena sekarang ada backend, situs **tidak bisa lagi di GitHub Pages** (statis). Deploy ke hosting Node.js, misalnya **Vercel**: import repo, isi `DATABASE_URL` (Neon), `SESSION_SECRET`, `ADMIN_USER`, `ADMIN_PASS` di Environment Variables. PGlite hanya untuk lokal; di produksi wajib pakai `DATABASE_URL`.

## Tim Pengembang

**Kelompok 4**  
Kapita Selekta Informatika  
Institut Teknologi Sumatera (ITERA)  
2026
