/* validasi & mapping data UMKM untuk API */
import { KATEGORI } from "@/data/umkm";
import { RTS } from "@/lib/umkm";

export const KOLOM = "id, nama, pemilik, kategori, rt, lokasi, deskripsi, produk, jam, telepon, foto, galeri, maps_url, lat, lng, produk_aktif, katalog";
export const MAKS_GALERI = 8;
export const MAKS_PRODUK = 20;
/* kolom untuk daftar (tanpa galeri supaya ringan) */
export const KOLOM_LIST = "id, nama, pemilik, kategori, rt, lokasi, deskripsi, produk, jam, telepon, foto, maps_url, lat, lng, produk_aktif";

const fotoValid = (v) => typeof v === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(v) && v.length <= 1500000;

/* hanya tautan Google Maps (https) yang diterima */
const MAPS_RE = /^https:\/\/((www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)\b/i;

const teks = (v, max = 500) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};

/* kembalikan { data } yang bersih, atau { error } */
export function validasiUmkm(body) {
  if (!body || typeof body !== "object") return { error: "Data tidak valid." };
  const nama = teks(body.nama, 120);
  if (!nama) return { error: "Nama usaha wajib diisi." };
  const kategori = KATEGORI.includes(body.kategori) ? body.kategori : null;
  if (!kategori) return { error: "Kategori tidak dikenal." };
  const rt = RTS.includes(body.rt) ? body.rt : null;
  if (!rt) return { error: "RT tidak dikenal." };
  let foto = null;
  if (typeof body.foto === "string" && body.foto) {
    if (!fotoValid(body.foto)) return { error: "Foto tidak valid atau terlalu besar." };
    foto = body.foto;
  }
  const galeri = Array.isArray(body.galeri) ? body.galeri : [];
  if (galeri.length > MAKS_GALERI) return { error: "Galeri maksimal " + MAKS_GALERI + " foto." };
  if (!galeri.every(fotoValid)) return { error: "Ada foto galeri yang tidak valid atau terlalu besar." };
  const maps_url = teks(body.maps_url, 1000);
  if (maps_url && !MAPS_RE.test(maps_url)) return { error: "Link lokasi harus tautan Google Maps (https://maps.app.goo.gl/... atau https://www.google.com/maps/...)." };
  const katalogMentah = Array.isArray(body.katalog) ? body.katalog : [];
  if (katalogMentah.length > MAKS_PRODUK) return { error: "Katalog maksimal " + MAKS_PRODUK + " produk." };
  const katalog = [];
  for (const p of katalogMentah) {
    if (!p || typeof p !== "object") return { error: "Data produk tidak valid." };
    const pNama = teks(p.nama, 80);
    if (!pNama) return { error: "Setiap produk wajib punya nama." };
    let harga = null;
    if (p.harga !== null && p.harga !== undefined && p.harga !== "") {
      harga = Number(p.harga);
      if (!Number.isInteger(harga) || harga < 0 || harga > 100000000) return { error: "Harga produk \"" + pNama + "\" tidak valid." };
    }
    let pFoto = null;
    if (typeof p.foto === "string" && p.foto) {
      if (!fotoValid(p.foto)) return { error: "Foto produk \"" + pNama + "\" tidak valid atau terlalu besar." };
      pFoto = p.foto;
    }
    katalog.push({ nama: pNama, harga, keterangan: teks(p.keterangan, 300), foto: pFoto });
  }
  return {
    data: {
      nama,
      pemilik: teks(body.pemilik, 120),
      kategori,
      rt,
      lokasi: teks(body.lokasi, 200),
      deskripsi: teks(body.deskripsi, 2000),
      produk: teks(body.produk, 300),
      jam: teks(body.jam, 120),
      telepon: teks(body.telepon, 40),
      foto,
      galeri,
      maps_url,
      produk_aktif: body.produk_aktif === true,
      katalog,
    },
  };
}

export const idValid = (v) => (/^\d+$/.test(String(v)) ? Number(v) : null);
