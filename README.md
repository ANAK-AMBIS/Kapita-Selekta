# Kapita Selekta 2026 — Panel UMKM Dusun 6, Desa Way Huwi

**Kelola Data & Iuran Bulanan UMKM Berbasis Web untuk Meningkatkan Efektivitas Pengelolaan di Desa Way Huwi** — Kelompok 4, Kapita Selekta Informatika ITERA 2026.

## Struktur Repo

| Folder | Keterangan |
|---|---|
| `frontend/` | **Frontend Next.js** — login perangkat desa + panel **Kelola Data** & **Iuran Bulanan** |

> Backup desain HTML statis versi pertama dihapus dari repo (masih tersimpan di riwayat commit).

## Web Live (GitHub Pages)

Panel sudah ter-deploy otomatis setiap push ke `main`:

**<https://erzaaf.github.io/kapsel/>** → login → panel

- Deploy statik via GitHub Actions (`.github/workflows/deploy.yml`), basePath `/kapsel`
- Data demo (dummy + localStorage) — backend PostgreSQL (Neon) menyusul

## Teknologi (sesuai proposal)

1. Framework: **Next.js** (App Router)
2. Bahasa: **JavaScript**
3. Styling: **CSS** (design system di `frontend/app/globals.css`)
4. Database: **PostgreSQL (Neon)** — *tahap backend; data saat ini masih dummy di `frontend/data/umkm.js` + localStorage*
5. Desain UI/UX: **Figma**
6. Kolaborasi: **GitHub**

## Fitur Frontend

- **Login** (`/`) — gate panel, kredensial demo `pemdes` / `desa123`
- **Panel Perangkat Desa** (`/panel`) — dua tab:
  - **Kelola Data**: pil RT (Semua RT / RT 05 / 05A / 06 / 06A), pencarian & filter kategori, tambah/ubah/hapus UMKM (modal + konfirmasi), hitungan jumlah UMKM terdata per RT, klik baris untuk kartu detail UMKM
  - **Iuran Bulanan**: buku iuran per RT — 12 kolom bulan + kolom **JUMLAH** + baris **JUMLAH RT**, klik sel bulan untuk catat/hapus pembayaran (default Rp 10.000), dropdown tahun, rekap otomatis
- Catatan pembayaran tersimpan sementara di `localStorage` browser (backend database menyusul)

## Menjalankan

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000` → login → panel.

## Tim

Kelompok 4 — Kapita Selekta Informatika, ITERA 2026.
