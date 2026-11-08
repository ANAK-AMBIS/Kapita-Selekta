/* ============================================================
   Sesi admin: cookie httpOnly berisi token bertanda tangan HMAC.
   Kredensial dari env ADMIN_USER / ADMIN_PASS (default demo).
   ============================================================ */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE = "umkm_sess";
const MAX_AGE = 60 * 60 * 24 * 7; /* 7 hari */

const SECRET = process.env.SESSION_SECRET || "dev-secret-ganti-di-produksi";
const ADMIN_USER = process.env.ADMIN_USER || "pemdes";
const ADMIN_PASS = process.env.ADMIN_PASS || "desa123";

const sign = (data) => crypto.createHmac("sha256", SECRET).update(data).digest("base64url");

function sameText(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function cekKredensial(user, pass) {
  return sameText(String(user || "").trim().toLowerCase(), ADMIN_USER) && sameText(pass || "", ADMIN_PASS);
}

export function buatToken(user) {
  const data = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return data + "." + sign(data);
}

function bacaToken(token) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!sameText(sig, sign(data))) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString());
    return p.exp > Date.now() ? p.u : null;
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

/* nama admin yang sedang login, atau null */
export async function getUser() {
  const c = await cookies();
  return bacaToken(c.get(COOKIE)?.value);
}

/* untuk route yang wajib login: kembalikan respons 401 bila belum login */
export async function wajibAdmin() {
  const user = await getUser();
  return user ? null : NextResponse.json({ error: "Harus login sebagai admin." }, { status: 401 });
}
