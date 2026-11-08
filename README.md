# Panel UMKM Dusun 6, Desa Way Huwi

**Kelola Data & Iuran Bulanan UMKM Berbasis Web untuk Meningkatkan Efektivitas Pengelolaan di Desa Way Huwi**

Proyek Kelompok 4 ini dikembangkan sebagai bagian dari mata kuliah Kapita Selekta Informatika, Institut Teknologi Sumatera (ITERA) 2026.

## Struktur Repository

| Folder | Keterangan |
|---|---|
| `frontend/` | Aplikasi frontend Next.js yang berisi halaman login dan panel pengelolaan UMKM. |

## Demo

Aplikasi dapat diakses melalui GitHub Pages:

**[https://erzaaf.github.io/kapsel/](https://erzaaf.github.io/kapsel/)**

Gunakan akun berikut untuk masuk:

- **Username:** `pemdes`
- **Password:** `desa123`

Saat ini aplikasi masih menggunakan data dummy dan `localStorage` untuk menyimpan data sementara di browser. Integrasi database akan dikerjakan pada tahap pengembangan backend.

## Teknologi

Teknologi yang digunakan dalam pengembangan proyek ini:

- **Next.js** – Framework frontend menggunakan App Router.
- **JavaScript** – Bahasa pemrograman.
- **CSS** – Mengatur tampilan dan layout aplikasi.
- **PostgreSQL (Neon)** – Database yang direncanakan untuk tahap backend.
- **Figma** – Perancangan UI/UX.
- **GitHub** – Pengelolaan repository dan kolaborasi tim.

## Fitur Aplikasi

### 1. Login

Halaman login digunakan sebagai akses masuk perangkat desa sebelum mengelola data UMKM.

### 2. Kelola Data UMKM

Fitur ini digunakan untuk mencatat dan mengelola data UMKM di Dusun 6.

Fitur yang tersedia:
- Filter data berdasarkan RT (Semua RT, RT 05, 05A, 06, dan 06A).
- Pencarian UMKM.
- Filter berdasarkan kategori usaha.
- Menambah, mengubah, dan menghapus data UMKM.
- Melihat detail UMKM dengan memilih baris data.
- Melihat jumlah UMKM yang terdata pada setiap RT.

### 3. Iuran Bulanan

Halaman ini digunakan untuk mencatat pembayaran iuran bulanan UMKM.

Fitur yang tersedia:
- Rekap pembayaran berdasarkan RT.
- Pencatatan pembayaran untuk periode Januari hingga Desember.
- Melihat jumlah pembayaran setiap UMKM.
- Menghitung total iuran setiap RT secara otomatis.
- Mengganti tahun pencatatan.
- Menambah dan menghapus catatan pembayaran melalui tabel.

Nominal iuran awal ditetapkan sebesar **Rp10.000 per bulan**.

Seluruh perubahan data pembayaran saat ini disimpan menggunakan `localStorage` pada browser.

## Menjalankan Proyek

Pastikan Node.js dan npm sudah terpasang.

1. Clone repository:

   ```bash
   git clone https://github.com/erzaaf/kapsel.git
   ```

2. Masuk ke folder frontend:

   ```bash
   cd kapsel/frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

5. Buka aplikasi melalui browser:

   ```text
   http://localhost:3000
   ```

## Deployment

Aplikasi di-deploy menggunakan GitHub Pages melalui GitHub Actions.

File konfigurasi deployment berada di:

```text
.github/workflows/deploy.yml
```

Konfigurasi Next.js menggunakan `basePath: '/kapsel'` agar aplikasi dapat berjalan pada subpath GitHub Pages.

Setiap perubahan yang di-push ke branch `main` akan memicu proses deployment secara otomatis.

## Tim Pengembang

**Kelompok 4**  
Kapita Selekta Informatika  
Institut Teknologi Sumatera (ITERA)  
2026
