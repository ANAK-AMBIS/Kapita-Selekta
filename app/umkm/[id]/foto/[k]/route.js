import sharp from "sharp";
import { query } from "@/lib/server/db";
import { idValid } from "@/lib/server/umkm";

export const dynamic = "force-dynamic";

/* lebar yang boleh diminta lewat ?w= (dibatasi supaya tidak bisa disalahgunakan) */
const LEBAR = [480, 960, 1280];

/* GET /umkm/:id/foto/utama?w=..  - foto utama UMKM
   GET /umkm/:id/foto/:i?w=..     - foto galeri ke-i
   Diperkecil ke lebar w lalu dikirim sebagai WebP. URL pemanggil memuat ?v=<sidik isi>,
   jadi aman di-cache lama: saat foto diubah, URL ikut berubah. */
export async function GET(req, { params }) {
  const p = await params;
  const id = idValid(p.id);
  const i = p.k === "utama" ? null : idValid(p.k);
  if (id === null || (p.k !== "utama" && i === null)) return tidakAda();

  const [row] = i === null
    ? await query("SELECT foto AS src FROM umkm WHERE id = $1", [id])
    : await query("SELECT galeri->>$2::int AS src FROM umkm WHERE id = $1", [id, i]);
  const m = row?.src?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return tidakAda();

  let body = Buffer.from(m[2], "base64");
  let type = m[1];
  const w = Number(new URL(req.url).searchParams.get("w"));
  if (LEBAR.includes(w)) {
    try {
      body = await sharp(body).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
      type = "image/webp";
    } catch { /* gagal diproses: kirim aslinya */ }
  }

  return new Response(body, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

const tidakAda = () => new Response("Tidak ditemukan", { status: 404 });
