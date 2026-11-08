/* ============================================================
   Koneksi database (khusus server).
   - DATABASE_URL diisi  → PostgreSQL sungguhan (mis. Neon) via `pg`
   - DATABASE_URL kosong → PGlite (Postgres tertanam) di folder .data/
     supaya bisa langsung jalan di lokal tanpa instal apa pun.
   Skema dibuat otomatis dan diisi data contoh bila tabel masih kosong.
   ============================================================ */

import { PANEL_SEED, IURAN_SEED } from "@/data/umkm";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS umkm (
     id         SERIAL PRIMARY KEY,
     nama       TEXT NOT NULL,
     pemilik    TEXT,
     kategori   TEXT NOT NULL,
     rt         TEXT NOT NULL,
     lokasi     TEXT,
     deskripsi  TEXT,
     produk     TEXT,
     jam        TEXT,
     telepon    TEXT,
     foto       TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS iuran (
     umkm_id INTEGER NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
     bulan   CHAR(7) NOT NULL,
     nominal INTEGER NOT NULL CHECK (nominal > 0),
     PRIMARY KEY (umkm_id, bulan)
   )`,
  /* galeri foto (array data URL), ditambahkan belakangan */
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS galeri JSONB NOT NULL DEFAULT '[]'::jsonb`,
  /* link Google Maps ke titik lokasi usaha */
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS maps_url TEXT`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION`,
  /* katalog produk: saklar aktif + daftar item {nama, harga, keterangan, foto} */
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS produk_aktif BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS katalog JSONB NOT NULL DEFAULT '[]'::jsonb`,
  /* love pengunjung: satu baris per (UMKM, device) */
  `CREATE TABLE IF NOT EXISTS umkm_love (
     umkm_id    INTEGER NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
     device_id  UUID NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (umkm_id, device_id)
   )`,
];

async function connect() {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const url = process.env.DATABASE_URL;
    const lokal = /localhost|127\.0\.0\.1/.test(url);
    const pool = new Pool({ connectionString: url, ssl: lokal ? false : { rejectUnauthorized: false } });
    return (text, params) => pool.query(text, params).then((r) => r.rows);
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  const dir = process.env.PGLITE_DIR || "./.data/pglite";
  mkdirSync(dir, { recursive: true });
  const db = new PGlite(dir);
  return (text, params) => db.query(text, params).then((r) => r.rows);
}

async function seed(q) {
  const [{ n }] = await q("SELECT count(*)::int AS n FROM umkm");
  if (n > 0) return;
  for (const u of PANEL_SEED) {
    await q(
      `INSERT INTO umkm (id, nama, pemilik, kategori, rt, lokasi, deskripsi, produk, jam, telepon, maps_url, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [u.id, u.nama, u.pemilik, u.kategori, u.rt, u.lokasi, u.deskripsi, u.produk, u.jam, u.telepon, u.maps_url, u.lat, u.lng].map((v) => (v === undefined || v === "" ? null : v))
    );
  }
  await q("SELECT setval(pg_get_serial_sequence('umkm','id'), (SELECT max(id) FROM umkm))");
  for (const [key, nominal] of Object.entries(IURAN_SEED)) {
    const [id, bulan] = key.split("|");
    await q("INSERT INTO iuran (umkm_id, bulan, nominal) VALUES ($1,$2,$3)", [Number(id), bulan, nominal]);
  }
}

async function init() {
  const q = await connect();
  for (const s of SCHEMA) await q(s);
  await seed(q);
  return q;
}

/* satu koneksi per proses (disimpan di globalThis agar tidak dobel saat hot reload) */
export function getDb() {
  if (!globalThis.__umkmDb) {
    globalThis.__umkmDb = init().catch((e) => {
      globalThis.__umkmDb = null;
      throw e;
    });
  }
  return globalThis.__umkmDb;
}

export async function query(text, params = []) {
  const q = await getDb();
  return q(text, params);
}
