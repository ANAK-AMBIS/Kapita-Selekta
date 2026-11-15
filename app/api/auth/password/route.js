import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { COOKIE, cookieOpts, buatToken, getSesi, UMKM } from "@/lib/server/auth";
import { cariAkun, validasiPassword } from "@/lib/server/akun";
import { hashPassword, verifyPassword } from "@/lib/server/password";

export const dynamic = "force-dynamic";

/* PATCH /api/auth/password - { passwordLama, passwordBaru }
   Hanya untuk role "umkm". Sandi admin diatur lewat env server. */
export async function PATCH(req) {
  const sesi = await getSesi();
  if (!sesi) return NextResponse.json({ error: "Harus login dulu." }, { status: 401 });
  if (sesi.role !== UMKM) {
    return NextResponse.json({ error: "Kata sandi admin diatur lewat konfigurasi server." }, { status: 403 });
  }

  const b = (await req.json().catch(() => null)) || {};
  const lama = typeof b.passwordLama === "string" ? b.passwordLama : "";
  const cekBaru = validasiPassword(b.passwordBaru);
  if (cekBaru.error) return NextResponse.json({ error: cekBaru.error }, { status: 400 });
  if (cekBaru.value === lama) {
    return NextResponse.json({ error: "Kata sandi baru harus berbeda dari yang lama." }, { status: 400 });
  }

  const akun = await cariAkun(sesi.user);
  if (!akun || !verifyPassword(lama, akun.pass_hash)) {
    return NextResponse.json({ error: "Kata sandi lama salah." }, { status: 400 });
  }

  /* sesi_ver naik: semua cookie lama milik akun ini langsung mati */
  const [row] = await query(
    "UPDATE akun SET pass_hash = $2, sesi_ver = sesi_ver + 1 WHERE id = $1 RETURNING sesi_ver",
    [akun.id, hashPassword(cekBaru.value)]
  );

  const res = NextResponse.json({ ok: true });
  /* terbitkan token baru supaya sesi yang sedang dipakai tidak ikut keluar */
  res.cookies.set(
    COOKIE,
    buatToken({
      user: akun.username,
      role: UMKM,
      akunId: akun.id,
      umkmId: akun.umkm_id,
      sesiVer: row.sesi_ver,
    }),
    cookieOpts
  );
  return res;
}
