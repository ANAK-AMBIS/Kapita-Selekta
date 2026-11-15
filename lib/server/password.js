/* ============================================================
   Hash kata sandi akun UMKM memakai scrypt bawaan Node.
   Tidak menambah dependency, dan sandi tidak pernah disimpan
   dalam bentuk teks biasa.

   Format tersimpan: scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>
   Parameter disimpan ikut supaya hash lama tetap bisa diverifikasi
   kalau suatu saat N/r/p dinaikkan.
   ============================================================ */

import crypto from "node:crypto";

const PREFIX = "scrypt";
const N = 16384; /* 2^14, ~16 MB memori per hash */
const R = 8;
const P = 1;
const KEYLEN = 64;

export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(String(plain), salt, KEYLEN, { N, r: R, p: P }).toString("hex");
  return [PREFIX, N, R, P, salt, key].join("$");
}

/* perbandingan waktu-tetap; selalu false untuk format yang tidak dikenal */
export function verifyPassword(plain, tersimpan) {
  if (typeof tersimpan !== "string") return false;
  const bagian = tersimpan.split("$");
  if (bagian.length !== 6 || bagian[0] !== PREFIX) return false;
  const [, n, r, p, salt, key] = bagian;
  try {
    const hitung = crypto.scryptSync(String(plain), salt, KEYLEN, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    const asli = Buffer.from(key, "hex");
    return hitung.length === asli.length && crypto.timingSafeEqual(hitung, asli);
  } catch {
    return false;
  }
}
