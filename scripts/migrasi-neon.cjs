/* Migrasi data lokal (PGlite) -> PostgreSQL Neon.
   - buat skema (sama seperti lib/server/db.js)
   - salin semua baris umkm & iuran apa adanya (id dipertahankan)
   - setel ulang sequence id
   Jalankan: node scripts/migrasi-neon.cjs            (salin)
             node scripts/migrasi-neon.cjs --dry-run  (hanya hitung)
*/
const fs = require("node:fs");
const path = require("node:path");

const DRY = process.argv.includes("--dry-run");

/* ambil DATABASE_URL dari .env.local bila belum ada di environment */
function envLocal() {
  const f = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(f)) return;
  for (const baris of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
envLocal();

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
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS galeri JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS maps_url TEXT`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS produk_aktif BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE umkm ADD COLUMN IF NOT EXISTS katalog JSONB NOT NULL DEFAULT '[]'::jsonb`,
];

(async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diisi (.env.local).");

  /* ---- sumber: PGlite lokal ---- */
  const { PGlite } = await import("@electric-sql/pglite");
  const lokal = new PGlite(process.env.PGLITE_DIR || "./.data/pglite");
  const umkm = (await lokal.query("SELECT * FROM umkm ORDER BY id")).rows;
  const iuran = (await lokal.query("SELECT * FROM iuran ORDER BY umkm_id, bulan")).rows;
  await lokal.close();
  console.log(`sumber: ${umkm.length} UMKM, ${iuran.length} catatan iuran`);

  if (DRY) {
    console.log(JSON.stringify(umkm.map((u) => ({ id: u.id, nama: u.nama })), null, 1));
    return;
  }

  /* ---- tujuan: Neon ---- */
  const { Pool } = await import("pg");
  const url = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString: url,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
  });
  const q = (text, params) => pool.query(text, params).then((r) => r.rows);

  for (const s of SCHEMA) await q(s);

  /* tabel tujuan dikosongkan supaya hasil migrasi = sumber (idempoten) */
  await q("TRUNCATE iuran, umkm RESTART IDENTITY CASCADE");

  for (const u of umkm) {
    await q(
      `INSERT INTO umkm (id, nama, pemilik, kategori, rt, lokasi, deskripsi, produk, jam, telepon, foto, galeri, maps_url, lat, lng, created_at, produk_aktif, katalog)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18::jsonb)`,
      [
        u.id, u.nama, u.pemilik, u.kategori, u.rt, u.lokasi, u.deskripsi, u.produk, u.jam, u.telepon,
        u.foto, JSON.stringify(u.galeri || []), u.maps_url, u.lat, u.lng, u.created_at,
        u.produk_aktif === true, JSON.stringify(u.katalog || []),
      ]
    );
  }
  for (const i of iuran) {
    await q("INSERT INTO iuran (umkm_id, bulan, nominal) VALUES ($1,$2,$3)", [i.umkm_id, i.bulan, i.nominal]);
  }
  await q("SELECT setval(pg_get_serial_sequence('umkm','id'), COALESCE((SELECT max(id) FROM umkm), 1))");

  const cek = await q("SELECT count(*)::int AS n FROM umkm");
  const cekI = await q("SELECT count(*)::int AS n FROM iuran");
  console.log(`selesai: ${cek[0].n} UMKM, ${cekI[0].n} catatan iuran di Neon`);
  await pool.end();
})().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
