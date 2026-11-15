import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { COOKIE, cookieOpts, cekKredensialAdmin, buatToken, ADMIN, UMKM } from "@/lib/server/auth";
import { cariAkun, rapikanUsername } from "@/lib/server/akun";
import { hashPassword, verifyPassword } from "@/lib/server/password";

/* hash palsu untuk menyamakan waktu proses saat username tidak ada */
const HASH_UMPAN = hashPassword("umpan-timing-login");

/* POST /api/auth/login - { username, password } → set cookie sesi
   Urutan: cek akun admin (env), lalu akun UMKM (database). */
export async function POST(req) {
  const { username, password } = (await req.json().catch(() => null)) || {};
  const user = rapikanUsername(username);
  const pass = typeof password === "string" ? password : "";

  if (cekKredensialAdmin(user, pass)) {
    const res = NextResponse.json({ user, role: ADMIN, umkmId: null, namaUmkm: null });
    res.cookies.set(COOKIE, buatToken({ user, role: ADMIN }), cookieOpts);
    return res;
  }

  const akun = await cariAkun(user);
  /* tetap jalankan scrypt walau akun tidak ada, supaya waktu balasan tidak
     membocorkan nama pengguna mana yang terdaftar */
  const cocok = verifyPassword(pass, akun ? akun.pass_hash : HASH_UMPAN);
  if (!akun || !akun.aktif || !cocok) {
    return NextResponse.json({ error: "Nama pengguna atau kata sandi salah." }, { status: 401 });
  }

  const [row] = await query("SELECT nama FROM umkm WHERE id = $1", [akun.umkm_id]);
  if (!row) {
    return NextResponse.json({ error: "Data UMKM untuk akun ini tidak ditemukan." }, { status: 409 });
  }

  const res = NextResponse.json({
    user: akun.username,
    role: UMKM,
    umkmId: akun.umkm_id,
    namaUmkm: row.nama,
  });
  res.cookies.set(
    COOKIE,
    buatToken({
      user: akun.username,
      role: UMKM,
      akunId: akun.id,
      umkmId: akun.umkm_id,
      sesiVer: akun.sesi_ver,
    }),
    cookieOpts
  );
  return res;
}
