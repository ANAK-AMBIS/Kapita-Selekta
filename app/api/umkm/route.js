import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { wajibAdmin } from "@/lib/server/auth";
import { KOLOM, validasiUmkm } from "@/lib/server/umkm";
import { koordinatDari } from "@/lib/server/maps";

export const dynamic = "force-dynamic";

/* GET /api/umkm - daftar semua UMKM (publik) */
export async function GET() {
  const rows = await query(`SELECT ${KOLOM} FROM umkm ORDER BY id`);
  return NextResponse.json(rows);
}

/* POST /api/umkm - tambah UMKM (admin) */
export async function POST(req) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const { data, error } = validasiUmkm(await req.json().catch(() => null));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const titik = await koordinatDari(data.maps_url);
  const [row] = await query(
    `INSERT INTO umkm (nama, pemilik, kategori, rt, lokasi, deskripsi, produk, jam, telepon, foto, galeri, maps_url, lat, lng, produk_aktif, katalog)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16::jsonb) RETURNING ${KOLOM}`,
    [data.nama, data.pemilik, data.kategori, data.rt, data.lokasi, data.deskripsi, data.produk, data.jam, data.telepon, data.foto, JSON.stringify(data.galeri), data.maps_url, titik?.lat ?? null, titik?.lng ?? null, data.produk_aktif, JSON.stringify(data.katalog)]
  );
  return NextResponse.json(row, { status: 201 });
}
