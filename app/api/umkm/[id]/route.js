import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { wajibAdmin } from "@/lib/server/auth";
import { KOLOM, validasiUmkm, idValid } from "@/lib/server/umkm";
import { koordinatDari } from "@/lib/server/maps";

export const dynamic = "force-dynamic";

const tidakAda = () => NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });

/* GET /api/umkm/:id - detail satu UMKM (publik) */
export async function GET(_req, { params }) {
  const id = idValid((await params).id);
  if (!id) return tidakAda();
  const [row] = await query(`SELECT ${KOLOM} FROM umkm WHERE id = $1`, [id]);
  return row ? NextResponse.json(row) : tidakAda();
}

/* PUT /api/umkm/:id - ubah UMKM (admin). Kolom yang tidak dikirim tetap. */
export async function PUT(req, { params }) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const id = idValid((await params).id);
  if (!id) return tidakAda();
  const [lama] = await query(`SELECT ${KOLOM} FROM umkm WHERE id = $1`, [id]);
  if (!lama) return tidakAda();
  const body = await req.json().catch(() => null);
  const { data, error } = validasiUmkm({ ...lama, ...(body || {}) });
  if (error) return NextResponse.json({ error }, { status: 400 });
  /* koordinat dihitung ulang hanya bila link Maps berubah */
  const titik = data.maps_url === lama.maps_url && lama.lat != null
    ? { lat: lama.lat, lng: lama.lng }
    : await koordinatDari(data.maps_url);
  const [row] = await query(
    `UPDATE umkm SET nama=$2, pemilik=$3, kategori=$4, rt=$5, lokasi=$6, deskripsi=$7, produk=$8, jam=$9, telepon=$10, foto=$11, galeri=$12::jsonb, maps_url=$13, lat=$14, lng=$15, produk_aktif=$16, katalog=$17::jsonb
     WHERE id = $1 RETURNING ${KOLOM}`,
    [id, data.nama, data.pemilik, data.kategori, data.rt, data.lokasi, data.deskripsi, data.produk, data.jam, data.telepon, data.foto, JSON.stringify(data.galeri), data.maps_url, titik?.lat ?? null, titik?.lng ?? null, data.produk_aktif, JSON.stringify(data.katalog)]
  );
  return NextResponse.json(row);
}

/* DELETE /api/umkm/:id - hapus UMKM beserta catatan iurannya (admin) */
export async function DELETE(_req, { params }) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const id = idValid((await params).id);
  if (!id) return tidakAda();
  const rows = await query("DELETE FROM umkm WHERE id = $1 RETURNING id", [id]);
  return rows.length ? NextResponse.json({ ok: true }) : tidakAda();
}
