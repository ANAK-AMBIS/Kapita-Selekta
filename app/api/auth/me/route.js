import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { getSesi } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/* GET /api/auth/me - sesi aktif: { user, role, umkmId, namaUmkm }
   Balas 401 dengan { user: null } bila belum login. */
export async function GET() {
  const sesi = await getSesi();
  if (!sesi) return NextResponse.json({ user: null, role: null, umkmId: null, namaUmkm: null }, { status: 401 });

  let namaUmkm = null;
  if (sesi.umkmId) {
    const [row] = await query("SELECT nama FROM umkm WHERE id = $1", [sesi.umkmId]);
    namaUmkm = row ? row.nama : null;
  }
  return NextResponse.json({
    user: sesi.user,
    role: sesi.role,
    umkmId: sesi.umkmId ?? null,
    namaUmkm,
  });
}
