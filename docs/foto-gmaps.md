# Ambil Foto Usaha dari Google Maps

Dokumen ini mencatat **cara mengambil foto** untuk data UMKM yang sudah ada di database (contoh kasus: **Nasi Bakar Liwet Bunda Lisa**, `id = 42`), sekaligus **izin penggunaan foto** untuk direktori UMKM Dusun 6.

---

## 1. Izin penggunaan foto (baca dulu)

> **Foto pada listing Google Maps usaha ini BOLEH diambil dan dipakai** untuk keperluan direktori UMKM Dusun 6, Desa Way Huwi (web profil usaha desa, non-komersial).
>
> - Sumber: foto publik yang diunggah pemilik & pengunjung pada listing Google Maps usaha yang bersangkutan.
> - Pemakaian: hanya untuk menampilkan profil usaha di web direktori UMKM desa (halaman `/` dan `/umkm/[id]`), tidak dijual dan tidak dipakai untuk iklan pihak ketiga.
> - Kredit: sumber tetap dicantumkan sebagai "Foto: Google Maps — <nama usaha>". Kolom tautan lokasi (`maps_url`) disimpan di database supaya sumber mudah dicek.
> - Pemilik usaha berhak meminta foto diganti/dihapus kapan saja; ganti dengan foto dokumentasi sendiri lewat panel admin (**Kelola Data → Ubah → Foto Usaha / Galeri Foto**).
>
> Kesimpulan: **boleh ambil foto dari Google Maps** untuk direktori ini, dengan syarat di atas (non-komersial + kredit sumber + siap diganti bila diminta).

---

## 2. Yang dipakai untuk Nasi Bakar Liwet Bunda Lisa

| Peran | Berkas asal (urutan di listing) | Isi foto |
|---|---|---|
| `foto` (sampul) | `p2` | Tampak depan warung + spanduk "NASI LIWET Licus" |
| `galeri[0]` | `p1` | Interior warung (dinding merah, meja kayu) |
| `galeri[1]` | `p3` | Nasi liwet + cumi + tempe mendoan di daun pisang |
| `galeri[2]` | `p4` | Nasi bakar dalam daun pisang + mendoan |
| `galeri[3]` | `p5` | Nasi + lauk + sambal di daun pisang |
| `galeri[4]` | `p6` | Dapur & area masak |
| `galeri[5]` | `p7` | Paket nasi + mendoan + es teh |

Listing menampilkan **14 foto**; 7 di antaranya terbaca langsung dari data halaman (sisanya duplikat/varian ukuran dari foto yang sama). Semua sudah masuk database:

```
id 42 | foto: 1 (139 KB base64) | galeri: 6 foto (~660 KB base64)
```

---

## 3. Langkah mengambil foto (yang dipakai saat ini)

### 3.1 Buka listing & ambil identitas tempat

Tautan pendek dari database (`maps_url`):

```
https://maps.app.goo.gl/z5YHd8YZR6QpAPmw6
```

Ikuti redirect-nya (sekali saja, host tetap `maps.app.goo.gl`) → dapat URL tempat:

```
https://www.google.com/maps/place/Nasi+bakar+liwet+bunda/@-5.3533551,105.317049,19z/data=!4m6!3m5!1s0x2e40c32abffee347:0x45fc91e1e3956a3c!8m2!3d-5.3533551!4d105.317049!16s%2Fg%2F11hm54xqk3
```

Yang penting dari URL itu: `1s0x2e40c32abffee347:0x45fc91e1e3956a3c` (place id) dan `16s%2Fg%2F11hm54xqk3` (feature id). Koordinat `-5.3533551, 105.317049` juga sudah tersimpan di kolom `lat` / `lng`.

### 3.2 Ambil daftar URL foto dari data halaman

Foto **tidak** semuanya ada di `<img>` (halaman hanya memuat 2–3 thumbnail). Daftar lengkapnya ada di variabel global `window.APP_INITIALIZATION_STATE` dengan pola:

```
"CIHM0ogKEICAgIC...",10,12,...,["https://lh3.googleusercontent.com/grass-cs/<ID_FOTO>",...]
```

Cara cepat (jalankan di DevTools Console saat halaman tempat terbuka):

```js
// 1) daftar semua foto pada halaman tempat
(() => {
  const t = JSON.stringify(window.APP_INITIALIZATION_STATE);
  const re = /https:\/\/lh[3-6]\.googleusercontent\.com\/grass-cs\/[A-Za-z0-9_\-.=]+/g;
  const s = new Set(); let m;
  while ((m = re.exec(t))) s.add(m[0]);
  return [...s];
})();
```

Untuk mengambil versi resolusi besar, tambahkan sufiks ukuran `=w1200-h1200-k-no` (tanpa sufiks hanya dapat ±512 px; `k-no` = tanpa crop):

```
https://lh3.googleusercontent.com/grass-cs/<ID_FOTO>=w1200-h1200-k-no
```

### 3.3 Unduh

Tidak perlu login/cookie — cukup `GET` biasa:

```js
// node scripts/unduh.cjs
const fs = require("node:fs");
const urls = [/* hasil langkah 3.2, sudah + =w1200-h1200-k-no */];

(async () => {
  fs.mkdirSync("_tmp_foto", { recursive: true });
  for (const [i, u] of urls.entries()) {
    const r = await fetch(u);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(`_tmp_foto/p${i + 1}.jpg`, buf);
    console.log(i + 1, r.status, buf.length);
  }
})();
```

Atau lewat PowerShell:

```powershell
Invoke-WebRequest "https://lh3.googleusercontent.com/grass-cs/<ID_FOTO>=w1200-h1200-k-no" -OutFile foto1.jpg
```

### 3.4 Perkecil → simpan sebagai data URL

Kolom `foto` (`TEXT`) dan `galeri` (`JSONB`) menyimpan **data URL**, jadi tidak perlu folder `public/`. Aturan validasi server (`lib/server/umkm.js`): format `data:image/(jpeg|png|webp);base64,` dan **maks 1,5 juta karakter per foto**, galeri maks 8 foto.

```js
// node scripts/kecilkan.cjs
const sharp = require("sharp");

const keDataUrl = async (berkas) => {
  const buf = await sharp(berkas)
    .rotate()                                        // hormati orientasi EXIF
    .resize({ width: 1000, withoutEnlargement: true }) // sisi terpanjang 1000 px
    .jpeg({ quality: 74, mozjpeg: true })
    .toBuffer();
  return "data:image/jpeg;base64," + buf.toString("base64");
};
```

Hasil nyata untuk 7 foto Liwet: 67–105 KB per foto (≈90–140 ribu karakter base64) — aman di bawah batas.

### 3.5 Masukkan ke database

Lewat API (butuh sesi admin):

```js
const base = "http://localhost:3000";
const login = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "pemdes", password: "desa123" }),
});
const cookie = login.headers.get("set-cookie").split(";")[0];

const d = await (await fetch(base + "/api/umkm/42")).json();      // data lama
await fetch(base + "/api/umkm/42", {
  method: "PUT",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify({ ...d, foto, galeri }),                   // foto + galeri baru
});
```

Atau langsung SQL:

```sql
UPDATE umkm
   SET foto = $2, galeri = $3::jsonb
 WHERE id = 42;
```

Foto lain (mis. untuk UMKM yang belum punya foto) cukup diganti `id`-nya.

### 3.6 Cek hasil

- `/` → kartu direktori menampilkan foto sampul.
- `/umkm/42` → foto sampul besar + carousel "Galeri foto (6 foto)".
- Panel admin → **Kelola Data** → klik baris → foto & galeri tampil; bisa diganti lewat **Ubah**.

---

## 4. Catatan teknis & batasan

1. **Jangan hardcode URL `lh3.googleusercontent.com`** di kode aplikasi. URL itu bisa berubah/kedaluwarsa; karena itu fotonya disalin ke database (data URL).
2. Ambil **sekali**, simpan lokal, lalu unggah — jangan memuat gambar langsung dari Google setiap kali halaman dibuka (juga menghindari masalah privasi & hotlink).
3. `=w1200-h1200-k-no` boleh diubah: `=w800-h800-k-no` (lebih ringan) atau `=s0` (ukuran asli, bisa >2 MB — perlu diperkecil lagi).
4. Foto berlabel pengguna (mis. "Foto Devri Zefanya") tetap milik pengunggahnya. Untuk direktori desa non-komersial ini boleh dipakai dengan kredit sumber seperti pada bagian 1; bila suatu saat web dipakai komersial, **ganti dengan foto dokumentasi sendiri**.
5. Simpan hasil dokumentasi (foto asli) di luar database bila perlu arsip — database hanya menyimpan versi terkompresi.
6. Kalau foto di listing berubah, ulangi langkah 3.2–3.5; `PUT /api/umkm/:id` akan menimpa `foto`/`galeri` lama.

---

## 5. Ringkas: perintah singkat

```
1. buka  https://maps.app.goo.gl/z5YHd8YZR6QpAPmw6   (ikuti redirect)
2. DevTools → Console → tempel skrip 3.2 → dapat daftar URL foto
3. tambahkan "=w1200-h1200-k-no" pada tiap URL → unduh (3.3)
4. perkecil dengan sharp 1000 px q74 → data URL (3.4)
5. PUT /api/umkm/42  { foto, galeri }  dengan cookie admin (3.5)
6. cek /umkm/42 dan panel admin (3.6)
```

> **Izin:** foto dari Google Maps **boleh dipakai** untuk direktori UMKM Dusun 6 (non-komersial, dengan kredit sumber, dan siap diganti bila pemilik usaha meminta).
