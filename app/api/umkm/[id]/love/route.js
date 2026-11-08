import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/server/db";
import { idValid } from "@/lib/server/umkm";

export const dynamic = "force-dynamic";

/* penanda device: UUID acak di cookie httpOnly (tanpa login) */
const COOKIE = "did";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function deviceId() {
  const v = (await cookies()).get(COOKIE)?.value;
  return v && UUID_RE.test(v) ? v : null;
}

async function umkmId(params) {
  const id = idValid((await params).id);
  if (!id) return null;
  const [row] = await query("SELECT id FROM umkm WHERE id = $1", [id]);
  return row ? id : null;
}

const hitung = async (id) => (await query("SELECT count(*)::int AS n FROM umkm_love WHERE umkm_id = $1", [id]))[0].n;
const tidakAda = () => NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });

/* GET /api/umkm/:id/love - jumlah love dan status device ini */
export async function GET(_req, { params }) {
  const id = await umkmId(params);
  if (!id) return tidakAda();
  const did = await deviceId();
  const loved = did ? (await query("SELECT 1 FROM umkm_love WHERE umkm_id = $1 AND device_id = $2", [id, did])).length > 0 : false;
  return NextResponse.json({ count: await hitung(id), loved });
}

/* POST /api/umkm/:id/love - beri love (sekali per device) */
export async function POST(_req, { params }) {
  const id = await umkmId(params);
  if (!id) return tidakAda();
  let did = await deviceId();
  const baru = !did;
  if (baru) did = crypto.randomUUID();
  await query("INSERT INTO umkm_love (umkm_id, device_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, did]);
  const res = NextResponse.json({ count: await hitung(id), loved: true });
  if (baru) {
    res.cookies.set(COOKIE, did, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

/* DELETE /api/umkm/:id/love - batalkan love device ini */
export async function DELETE(_req, { params }) {
  const id = await umkmId(params);
  if (!id) return tidakAda();
  const did = await deviceId();
  if (did) await query("DELETE FROM umkm_love WHERE umkm_id = $1 AND device_id = $2", [id, did]);
  return NextResponse.json({ count: await hitung(id), loved: false });
}
