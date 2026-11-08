/* Ambil foto Google Maps untuk UMKM yang belum punya foto (lihat docs/foto-gmaps.md).
   node scripts/foto-gmaps.cjs [--dry-run] [--id=43] [--urls=file.json]
   --urls: JSON { "<id>": ["https://lh3.googleusercontent.com/grass-cs/..."] } (fallback dari browser) */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const { Pool } = require("pg");

const f = path.join(process.cwd(), ".env.local");
if (fs.existsSync(f)) for (const b of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
  const m = b.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=").slice(1).join("=");
const DRY = process.argv.includes("--dry-run");
const ID = arg("id");
const URLS = arg("urls") ? JSON.parse(fs.readFileSync(arg("urls"), "utf8")) : {};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const MAKS = 9, BATAS = 1_500_000;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

async function cariFoto(mapsUrl) {
  const r = await fetch(mapsUrl, { headers: { "User-Agent": UA, "Accept-Language": "id,en;q=0.8" } });
  const t = (await r.text()).split("\\u003d").join("=").split("\\/").join("/");
  const re = /https:\/\/lh[3-6]\.googleusercontent\.com\/grass-cs\/[A-Za-z0-9_\-]+/g;
  return [...new Set(t.match(re) || [])];
}

async function keDataUrl(buf) {
  const out = await sharp(buf).rotate().resize({ width: 1000, withoutEnlargement: true })
    .jpeg({ quality: 74, mozjpeg: true }).toBuffer();
  return "data:image/jpeg;base64," + out.toString("base64");
}

(async () => {
  const url = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
  const rows = (await pool.query(
    `SELECT id, nama, maps_url FROM umkm WHERE maps_url IS NOT NULL AND ${ID ? "id = $1" : "foto IS NULL"} ORDER BY id`,
    ID ? [ID] : [])).rows;
  const hasil = [];
  for (const u of rows) {
    try {
      const daftar = (URLS[u.id] || await cariFoto(u.maps_url)).map((x) => x.split("=")[0]).slice(0, MAKS);
      if (!daftar.length) { hasil.push({ id: u.id, nama: u.nama, foto: 0, status: "tidak ada foto" }); continue; }
      if (DRY) { hasil.push({ id: u.id, nama: u.nama, foto: daftar.length, status: "dry-run" }); continue; }
      const dir = path.join("_tmp_foto", String(u.id));
      fs.mkdirSync(dir, { recursive: true });
      const data = [];
      for (const [i, x] of daftar.entries()) {
        const r = await fetch(x + "=w1200-h1200-k-no", { headers: { "User-Agent": UA } });
        if (!r.ok) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(path.join(dir, `p${i + 1}.jpg`), buf);
        const d = await keDataUrl(buf).catch(() => null);
        if (d && d.length <= BATAS) data.push(d);
      }
      if (!data.length) { hasil.push({ id: u.id, nama: u.nama, foto: 0, status: "unduh gagal" }); continue; }
      await pool.query("UPDATE umkm SET foto = $2, galeri = $3::jsonb WHERE id = $1",
        [u.id, data[0], JSON.stringify(data.slice(1))]);
      hasil.push({ id: u.id, nama: u.nama, foto: data.length, status: "ok" });
    } catch (e) {
      hasil.push({ id: u.id, nama: u.nama, foto: 0, status: "error: " + e.message });
    }
    await tidur(1500);
  }
  console.table(hasil);
  await pool.end();
})();
