/* ============================================================
   Sesi panel: cookie httpOnly berisi token bertanda tangan HMAC.

   Dua role:
   - "admin" → kredensial dari env ADMIN_USER / ADMIN_PASS
   - "umkm"  → baris di tabel akun (dibuat admin dari panel)

   Token role "umkm" menyimpan id akun + versi sesi. Setiap kali
   token dibaca, akun dicek masih ada, masih aktif, dan versinya
   cocok. Reset sandi / nonaktifkan akun jadi langsung mematikan
   cookie lama tanpa menunggu kedaluwarsa.
   ============================================================ */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export const COOKIE = "umkm_sess";
const MAX_AGE = 60 * 60 * 24 * 7; /* 7 hari */

const SECRET = process.env.SESSION_SECRET || "dev-secret-ganti-di-produksi";
export const ADMIN_USER = String(process.env.ADMIN_USER || "pemdes").trim().toLowerCase();
const ADMIN_PASS = process.env.ADMIN_PASS || "desa123";

export const ADMIN = "admin";
export const UMKM = "umkm";

const sign = (data) => crypto.createHmac("sha256", SECRET).update(data).digest("base64url");

function sameText(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/* apakah username ini milik admin (dipakai saat membuat akun UMKM) */
export const usernameAdmin = (user) => sameText(String(user || "").trim().toLowerCase(), ADMIN_USER);

export function cekKredensialAdmin(user, pass) {
  return usernameAdmin(user) && sameText(pass || "", ADMIN_PASS);
}

/* sesi: { user, role, akunId?, umkmId?, sesiVer? } */
export function buatToken(sesi) {
  const data = Buffer.from(
    JSON.stringify({
      u: sesi.user,
      r: sesi.role,
      k: sesi.akunId ?? null,
      m: sesi.umkmId ?? null,
      v: sesi.sesiVer ?? null,
      exp: Date.now() + MAX_AGE * 1000,
    })
  ).toString("base64url");
  return data + "." + sign(data);
}

function bacaToken(token) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!sameText(sig, sign(data))) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!p || !p.u || !(p.exp > Date.now())) return null;
    return p;
  } catch {
    return null;
  }
}

export const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

/* sesi yang sedang aktif, atau null */
export async function getSesi() {
  const c = await cookies();
  const p = bacaToken(c.get(COOKIE)?.value);
  if (!p) return null;

  if (p.r === ADMIN) {
    return { user: p.u, role: ADMIN, akunId: null, umkmId: null };
  }
  if (p.r !== UMKM) return null;

  const [akun] = await query(
    "SELECT id, umkm_id, username, sesi_ver FROM akun WHERE id = $1 AND aktif = true",
    [p.k]
  );
  if (!akun || akun.sesi_ver !== p.v) return null;
  return { user: akun.username, role: UMKM, akunId: akun.id, umkmId: akun.umkm_id };
}

/* nama pengguna yang sedang login, atau null */
export async function getUser() {
  const sesi = await getSesi();
  return sesi ? sesi.user : null;
}

/* untuk route yang wajib login */
export async function wajibSesi() {
  const sesi = await getSesi();
  return sesi ? null : NextResponse.json({ error: "Harus login dulu." }, { status: 401 });
}

/* untuk route khusus admin */
export async function wajibAdmin() {
  const sesi = await getSesi();
  if (!sesi) return NextResponse.json({ error: "Harus login sebagai admin." }, { status: 401 });
  if (sesi.role !== ADMIN) {
    return NextResponse.json({ error: "Halaman ini hanya untuk admin." }, { status: 403 });
  }
  return null;
}

/* admin boleh semuanya; role umkm hanya untuk umkmId miliknya */
export async function aksesPemilikUmkm(id) {
  const sesi = await getSesi();
  if (!sesi) {
    return { sesi: null, tolak: NextResponse.json({ error: "Harus login dulu." }, { status: 401 }) };
  }
  if (sesi.role === ADMIN) return { sesi, tolak: null };
  if (sesi.role === UMKM && sesi.umkmId === id) return { sesi, tolak: null };
  return {
    sesi,
    tolak: NextResponse.json({ error: "Kamu tidak punya akses ke data UMKM ini." }, { status: 403 }),
  };
}

export async function wajibPemilikUmkm(id) {
  return (await aksesPemilikUmkm(id)).tolak;
}
