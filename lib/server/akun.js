/* ============================================================
   Validasi & helper akun UMKM (role "umkm").
   Satu UMKM punya paling banyak satu akun (lihat UNIQUE umkm_id).
   ============================================================ */

import { query } from "@/lib/server/db";

export const MIN_USERNAME = 3;
export const MAKS_USERNAME = 32;
export const MIN_PASS = 8;
export const MAKS_PASS = 72;

const USER_RE = /^[a-z0-9._-]+$/;

/* kolom yang aman dikirim ke klien (tanpa pass_hash) */
export const KOLOM_AKUN = "a.id, a.umkm_id, a.username, a.aktif, a.created_at";

export const rapikanUsername = (v) => String(v || "").trim().toLowerCase();

/* kembalikan { value } atau { error } */
export function validasiUsername(v) {
  const username = rapikanUsername(v);
  if (!username) return { error: "Nama pengguna wajib diisi." };
  if (username.length < MIN_USERNAME) return { error: "Nama pengguna minimal " + MIN_USERNAME + " karakter." };
  if (username.length > MAKS_USERNAME) return { error: "Nama pengguna maksimal " + MAKS_USERNAME + " karakter." };
  if (!USER_RE.test(username)) {
    return { error: "Nama pengguna hanya boleh huruf kecil, angka, titik, garis bawah, atau tanda hubung." };
  }
  return { value: username };
}

export function validasiPassword(v) {
  const password = typeof v === "string" ? v : "";
  if (!password) return { error: "Kata sandi wajib diisi." };
  if (password.length < MIN_PASS) return { error: "Kata sandi minimal " + MIN_PASS + " karakter." };
  if (password.length > MAKS_PASS) return { error: "Kata sandi maksimal " + MAKS_PASS + " karakter." };
  return { value: password };
}

/* akun lengkap (termasuk pass_hash) untuk proses login/verifikasi */
export async function cariAkun(username) {
  const [row] = await query(
    "SELECT id, umkm_id, username, pass_hash, aktif, sesi_ver FROM akun WHERE username = $1",
    [rapikanUsername(username)]
  );
  return row || null;
}

/* akun berdasarkan id, untuk halaman/aksi admin */
export async function cariAkunId(id) {
  const [row] = await query(
    "SELECT a.id, a.umkm_id, a.username, a.aktif, a.sesi_ver, a.created_at, u.nama AS nama_umkm " +
      "FROM akun a JOIN umkm u ON u.id = a.umkm_id WHERE a.id = $1",
    [id]
  );
  return row || null;
}

/* kode galat PostgreSQL untuk pelanggaran UNIQUE */
export const galatUnik = (e) => e && (e.code === "23505" || /duplicate key/i.test(String(e.message || "")));
