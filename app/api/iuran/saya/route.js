import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { getSesi, UMKM } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/* GET /api/iuran/saya - riwayat iuran UMKM yang sedang login.
   Bentuk: { "YYYY-MM": nominal }. Hanya untuk role "umkm";
   admin memakai /api/iuran (semua UMKM). */
export async function GET() {
  const sesi = await getSesi();
  if (!sesi) return NextResponse.json({ error: "Harus login dulu." }, { status: 401 });
  if (sesi.role !== UMKM) {
    return NextResponse.json({ error: "Halaman ini hanya untuk akun UMKM." }, { status: 403 });
  }
  const rows = await query("SELECT bulan, nominal FROM iuran WHERE umkm_id = $1 ORDER BY bulan", [sesi.umkmId]);
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.bulan, r.nominal])));
}
