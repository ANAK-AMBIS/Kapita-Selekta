import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { wajibAdmin, usernameAdmin } from "@/lib/server/auth";
import { idValid } from "@/lib/server/umkm";
import {
  KOLOM_AKUN,
  galatUnik,
  validasiPassword,
  validasiUsername,
} from "@/lib/server/akun";
import { hashPassword } from "@/lib/server/password";

export const dynamic = "force-dynamic";

/* GET /api/akun - daftar akun UMKM (admin) */
export async function GET() {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const rows = await query(
    `SELECT ${KOLOM_AKUN}, u.nama AS nama_umkm
       FROM akun a JOIN umkm u ON u.id = a.umkm_id
      ORDER BY u.nama`
  );
  return NextResponse.json(rows);
}

/* POST /api/akun - buatkan akun untuk satu UMKM (admin)
   Body: { umkmId, username, password } */
export async function POST(req) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;

  const b = (await req.json().catch(() => null)) || {};
  const umkmId = idValid(b.umkmId);
  if (!umkmId) return NextResponse.json({ error: "Pilih UMKM yang akan dibuatkan akun." }, { status: 400 });

  const cekUser = validasiUsername(b.username);
  if (cekUser.error) return NextResponse.json({ error: cekUser.error }, { status: 400 });
  if (usernameAdmin(cekUser.value)) {
    return NextResponse.json({ error: "Nama pengguna itu dipakai admin. Pilih nama lain." }, { status: 400 });
  }
  const cekPass = validasiPassword(b.password);
  if (cekPass.error) return NextResponse.json({ error: cekPass.error }, { status: 400 });

  const [umkm] = await query("SELECT nama FROM umkm WHERE id = $1", [umkmId]);
  if (!umkm) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });

  try {
    const [row] = await query(
      `INSERT INTO akun (umkm_id, username, pass_hash)
       VALUES ($1, $2, $3)
       RETURNING id, umkm_id, username, aktif, created_at`,
      [umkmId, cekUser.value, hashPassword(cekPass.value)]
    );
    return NextResponse.json({ ...row, nama_umkm: umkm.nama }, { status: 201 });
  } catch (e) {
    if (galatUnik(e)) {
      return NextResponse.json(
        { error: "UMKM ini sudah punya akun, atau nama pengguna sudah dipakai." },
        { status: 409 }
      );
    }
    throw e;
  }
}
