import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { wajibAdmin } from "@/lib/server/auth";
import { idValid } from "@/lib/server/umkm";

export const dynamic = "force-dynamic";

/* GET /api/iuran - semua catatan iuran sebagai map { "<id>|<YYYY-MM>": nominal } (admin) */
export async function GET() {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const rows = await query("SELECT umkm_id, bulan, nominal FROM iuran");
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.umkm_id + "|" + r.bulan, r.nominal])));
}

/* PUT /api/iuran - { umkmId, bulan: "YYYY-MM", nominal }; nominal 0 = hapus catatan (admin) */
export async function PUT(req) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const b = (await req.json().catch(() => null)) || {};
  const umkmId = idValid(b.umkmId);
  const nominal = Number.isInteger(b.nominal) ? b.nominal : NaN;
  if (!umkmId || !/^\d{4}-(0[1-9]|1[0-2])$/.test(b.bulan || "") || !(nominal >= 0 && nominal <= 100000000)) {
    return NextResponse.json({ error: "Data iuran tidak valid." }, { status: 400 });
  }
  if (nominal === 0) {
    await query("DELETE FROM iuran WHERE umkm_id = $1 AND bulan = $2", [umkmId, b.bulan]);
  } else {
    const ada = await query("SELECT 1 FROM umkm WHERE id = $1", [umkmId]);
    if (!ada.length) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });
    await query(
      `INSERT INTO iuran (umkm_id, bulan, nominal) VALUES ($1,$2,$3)
       ON CONFLICT (umkm_id, bulan) DO UPDATE SET nominal = EXCLUDED.nominal`,
      [umkmId, b.bulan, nominal]
    );
  }
  return NextResponse.json({ ok: true });
}
