/* ============================================================
   Data UMKM Dusun 6 — dummy sementara.
   Nanti diganti query dari database (PostgreSQL / Neon).
   ============================================================ */

export const KATEGORI = [
  "Kuliner",
  "Sembako",
  "Kerajinan",
  "Jasa",
  "Lainnya",
];

export const KATEGORI_META = {
  "Kuliner": {
    emoji: "\u{1F372}",
    chip: "chip chip-green",
    img: "card-img-green",
  },
  "Sembako": {
    emoji: "\u{1F392}",
    chip: "chip chip-amber",
    img: "card-img-amber",
  },
  "Kerajinan": {
    emoji: "\u{1FA9E}",
    chip: "chip chip-blue",
    img: "card-img-blue",
  },
  "Jasa": {
    emoji: "\u{1F527}",
    chip: "chip chip-neutral",
    img: "card-img-neutral",
  },
  "Lainnya": {
    emoji: "\u{2699}\u{FE0F}",
    chip: "chip chip-neutral",
    img: "card-img-neutral",
  },
};

export const UMKM = [
  {
    id: 1,
    nama: "Warung Bu Sari",
    pemilik: "Sari Wulandari",
    kategori: "Kuliner",
    rt: "RT 05",
    alamat: "Jl. Raya Way Huwi, Dusun 6",
    deskripsi:
      "Warung makan rumahan dengan menu andalan pecel, emping, dan minuman dingin. Berdiri sejak 2015 dan menjadi tempat makan favorit warga Dusun 6.",
    produk: "Pecel, emping, aneka minuman",
    telepon: "0857-6001-1001",
    jam: "06.00 \u2013 17.00 setiap hari",
  },
  {
    id: 2,
    nama: "Toko Kelontong Jaya",
    pemilik: "Budi Santoso",
    kategori: "Sembako",
    rt: "RT 05A",
    alamat: "Perumahan Asri 1 Blok A, RT 05A",
    deskripsi:
      "Toko kelontong lengkap: sembako, bahan dapur, alat tulis, dan kebutuhan harian lainnya. Melayani pembelian langsung maupun pesan-antar bagi warga sekitar.",
    produk: "Sembako, kebutuhan harian",
    telepon: "0857-6001-1002",
    jam: "07.00 \u2013 21.00 setiap hari",
  },
  {
    id: 3,
    nama: "Kerajinan Anyaman Pak Min",
    pemilik: "Suhairi Minang",
    kategori: "Kerajinan",
    rt: "RT 06",
    alamat: "Gg. Kenanga, Jl. Desa Way Huwi, RT 06",
    deskripsi:
      "Kerajinan anyaman bambu: keranjang, tudung saji, kipas, dan tas. Menerima pesanan langsung maupun kontrak jumlah besar untuk kebutuhan acara desa.",
    produk: "Keranjang, tudung saji, tas anyaman",
    telepon: "0857-6001-1003",
    jam: "08.00 \u2013 17.00 Senin\u2013Sabtu",
  },
  {
    id: 4,
    nama: "Kue Basah Mama Nia",
    pemilik: "Nia Kartika",
    kategori: "Kuliner",
    rt: "RT 05",
    alamat: "Samping Masjid Al-Hikmah, RT 05",
    deskripsi:
      "Kue basah rasa khas: kue lumpur, putu ayu, dan bolu kukus. Cocok menjadi sajian acara warga maupun hantaran sesuai pesanan.",
    produk: "Kue lumpur, putu ayu, bolu kukus",
    telepon: "0857-6001-1004",
    jam: "05.00 \u2013 12.00 setiap hari",
  },
  {
    id: 5,
    nama: "Bengkel Rusli Motor",
    pemilik: "Rusli Andika",
    kategori: "Jasa",
    rt: "RT 06A",
    alamat: "Jl. Pendidikan, depan SDN 1, RT 06A",
    deskripsi:
      "Servis ringan dan besar sepeda motor, tune-up, ganti ban, serta penjualan part dan oli. Tersedia layanan panggilan ke rumah bagi warga sekitar.",
    produk: "Servis motor, part & oli",
    telepon: "0857-6001-1005",
    jam: "08.00 \u2013 20.00 Senin\u2013Sabtu",
  },
  {
    id: 6,
    nama: "Es Lilin Barokah",
    pemilik: "Rahmi Putri",
    kategori: "Sembako",
    rt: "RT 06A",
    alamat: "Griya Way Huwi Blok C, RT 06A",
    deskripsi:
      "Es lilin aneka rasa \u2014 mangga, durian, dan nangka \u2014 diproduksi sendiri setiap hari. Melayani pesanan jajaran bazar desa maupun pernikahan warga.",
    produk: "Es lilin aneka rasa",
    telepon: "0857-6001-1006",
    jam: "09.00 \u2013 18.00 setiap hari",
  },
  {
    id: 7,
    nama: "Gula Semut Bu Rahma",
    pemilik: "Rahma Zahira",
    kategori: "Lainnya",
    rt: "RT 06",
    alamat: "Sentra gula semut, RT 06",
    deskripsi:
      "Hasil olahan kelompok tani Dusun 6 berupa gula semut (gula kempa) murni dari nira kelapa. Dipasarkan ke pembeli lokal dan menjadi pasokan beberapa bakeri di kota.",
    produk: "Gula semut asli nira kelapa",
    telepon: "0857-6001-1007",
    jam: "08.00 \u2013 16.00 Senin\u2013Jumat",
  },
  {
    id: 8,
    nama: "Laundry Banjar Sari",
    pemilik: "Dwi Lestari",
    kategori: "Jasa",
    rt: "RT 06A",
    alamat: "Jl. Melati No. 4, RT 06A",
    deskripsi:
      "Pencucian kilat dan reguler untuk pakaian, sepatu, hingga sarung dan tikar. Antar-jemput gratis bagi pelanggan tetap di wilayah Dusun 6.",
    produk: "Cuci kilat, cuci sepatu, antar-jemput",
    telepon: "0857-6001-1008",
    jam: "07.00 \u2013 21.00 setiap hari",
  },
];

/* Data awal panel & halaman publik: semua kolom UMKM, "alamat" jadi "lokasi" (tanpa imbuhan RT) */
export const PANEL_SEED = UMKM.map(({ alamat, ...u }) => ({
  ...u,
  lokasi: alamat.replace(/,?\s*RT\s*\d{2}A?\s*$/, ""),
}));

/* Panel perangkat desa: contoh pencatatan iuran awal (Sep & Okt 2026) */
export const IURAN_SEED = {
  "1|2026-09": 10000, "2|2026-09": 10000, "3|2026-09": 10000, "4|2026-09": 10000, "5|2026-09": 10000, "6|2026-09": 10000,
  "1|2026-10": 10000, "2|2026-10": 10000, "3|2026-10": 10000, "4|2026-10": 10000, "5|2026-10": 10000, "6|2026-10": 10000,
  "7|2026-10": 5000,
};


