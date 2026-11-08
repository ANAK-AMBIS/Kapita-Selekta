"use client";

import { useEffect, useState } from "react";
import { KATEGORI, KATEGORI_META, UMKM, PANEL_SEED } from "@/data/umkm";
import { RTS, DATA_KEY, rtOf, gradClass, loadLS } from "@/lib/umkm";

/* ============================================================
   Direktori UMKM publik — bisa diakses tanpa login.
   Data dibaca dari localStorage yang diisi admin di /panel,
   jatuh ke data contoh bila belum ada (backend menyusul).
   ============================================================ */

/* basePath GitHub Pages (lihat next.config.mjs) untuk aset di /public */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PublicDirectory() {
  const [data, setData] = useState(PANEL_SEED);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [rt, setRt] = useState("Semua");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const d = loadLS(DATA_KEY, null);
    if (Array.isArray(d) && d.length > 0) setData(d);
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  /* data lama di localStorage belum punya deskripsi/produk/jam/telepon → ambil dari data contoh */
  const lengkap = (d) => ({ ...(UMKM.find((u) => u.id === d.id) || {}), ...d });

  const qu = q.trim().toLowerCase();
  const cocok = data.filter((d) => {
    const okCat = cat === "Semua" || d.kategori === cat;
    const okRt = rt === "Semua" || rtOf(d) === rt;
    const okQ =
      !qu ||
      d.nama.toLowerCase().includes(qu) ||
      (d.pemilik || "").toLowerCase().includes(qu) ||
      (d.lokasi || "").toLowerCase().includes(qu);
    return okCat && okRt && okQ;
  });

  return (
    <div className="pwrap pub-page">
      {/* Section 1: hero layar penuh dengan foto latar (ganti file public/img/hero-bg.jpg) */}
      <section className="pub-hero" style={{ "--hero-bg": `url(${BASE}/img/hero-bg.jpg)` }}>
        <header className="pub-topnav">
          <div className="container pub-topnav-in">
            <span className="pub-brand">UMKM Way Huwi</span>
            <span className="pub-brand-sub">Dusun 6 &mdash; Desa Way Huwi</span>
          </div>
        </header>

        <div className="container pub-hero-in">
          <h1 className="pub-hero-title">Dukung usaha warga,<br />tumbuh bersama Dusun 6</h1>
          <p className="pub-hero-desc">
            Direktori UMKM Dusun 6, Desa Way Huwi, Jati Agung, Lampung Selatan &mdash;
            kuliner, sembako, kerajinan, hingga jasa milik tetangga sekitar Anda.
          </p>
          <a href="#direktori" className="pub-cta">Lihat Daftar UMKM</a>
          <div className="pub-stats">
            <div><b>{data.length}</b><span>UMKM terdata</span></div>
            <div><b>{new Set(data.map((d) => d.kategori)).size}</b><span>Kategori usaha</span></div>
            <div><b>{RTS.length}</b><span>RT di Dusun 6</span></div>
          </div>
        </div>
      </section>

      {/* Section 2: pencarian + daftar */}
      <main id="direktori" className="container pub-main">
        <div className="section-head">
          <span className="pub-eyebrow">Direktori UMKM</span>
          <h2 className="section-title">Temukan usaha di sekitar Anda</h2>
          <p className="section-sub">Cari berdasarkan nama usaha, pemilik, lokasi, kategori, atau RT.</p>
        </div>

        <div className="dir-search">
          <label className="search-field">
            <span className="pub-search-ico" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              className="search-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama usaha, pemilik, atau lokasi..."
              aria-label="Cari UMKM"
            />
          </label>
        </div>

        <div className="dir-filter pub-filter">
          <div className="dir-chips">
            {["Semua"].concat(KATEGORI).map((k) => (
              <button
                key={k}
                className={"chip pub-chip" + (cat === k ? " chip-solid" : " chip-outline")}
                onClick={() => setCat(k)}
              >
                {k === "Semua" ? "Semua kategori" : k}
              </button>
            ))}
          </div>
          <select className="input pub-rt pselect" value={rt} onChange={(e) => setRt(e.target.value)} aria-label="Filter RT">
            <option value="Semua">Semua RT</option>
            {RTS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <p className="pub-count">{cocok.length} UMKM ditemukan</p>

        {cocok.length === 0 ? (
          <p className="dir-empty">Tidak ada UMKM yang cocok dengan pencarian.</p>
        ) : (
          <div className="dir-grid">
            {cocok.map((d) => {
              const meta = KATEGORI_META[d.kategori] || KATEGORI_META["Lainnya"];
              return (
                <button key={d.id} className="umkm-card pub-card" onClick={() => setDetail(d)}>
                  {d.foto ? (
                    <img className="card-img pub-img" src={d.foto} alt={d.nama} />
                  ) : (
                    <div className={"card-img " + meta.img}>
                      <span className="img-emoji">{meta.emoji}</span>
                    </div>
                  )}
                  <div className="card-body">
                    <span className={meta.chip}>{d.kategori}</span>
                    <span className="card-title">{d.nama}</span>
                    {d.pemilik && <span className="card-loc">{d.pemilik}</span>}
                    <div className="card-foot">
                      <span className="card-loc">&#128205; {d.lokasi || d.rt || "Dusun 6"}</span>
                      <span className="card-link">Detail &rarr;</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <footer className="pub-foot" style={{ "--hero-bg": `url(${BASE}/img/hero-bg.jpg)` }}>
        <div className="container pub-foot-in">
          <div>
            <span className="pub-brand">UMKM Way Huwi</span>
            <span className="pub-brand-sub">Dusun 6 &mdash; Desa Way Huwi</span>
          </div>
          <p className="pub-foot-desc">
            Direktori usaha milik warga Dusun 6, Desa Way Huwi, Kecamatan Jati Agung, Kabupaten Lampung Selatan.
          </p>
        </div>
        <div className="container pub-foot-bottom">
          &copy; {new Date().getFullYear()} UMKM Way Huwi
        </div>
      </footer>

      {detail && (() => {
        const d = detail;
        const x = lengkap(d);
        const meta = KATEGORI_META[d.kategori] || KATEGORI_META["Lainnya"];
        return (
          <div className="pmodal" onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
            <div className="pmodal-card pdet pub-det" role="dialog" aria-modal="true" aria-label={d.nama}>
              <div className="pub-det-media">
                {d.foto ? (
                  <img className="pdet-foto" src={d.foto} alt={d.nama} />
                ) : (
                  <div className={"pdet-foto pdet-foto-grad " + gradClass(d.kategori, KATEGORI)}>
                    <span>{meta.emoji}</span>
                  </div>
                )}
                <button className="pub-det-close" aria-label="Tutup" onClick={() => setDetail(null)}>&#10005;</button>
              </div>
              <div className="pub-det-body">
                <span className={meta.chip}>{d.kategori}</span>
                <h2 className="pmodal-title">{d.nama}</h2>
                {d.pemilik && <p className="pub-det-owner">oleh {d.pemilik}</p>}
                {x.deskripsi && <p className="pub-desc">{x.deskripsi}</p>}
                <dl className="pub-det-rows">
                  <div><dt>RT</dt><dd>{d.rt || "—"}</dd></div>
                  <div><dt>Alamat</dt><dd>{d.lokasi || "—"}</dd></div>
                  {x.produk && <div><dt>Produk</dt><dd>{x.produk}</dd></div>}
                  {x.jam && <div><dt>Jam buka</dt><dd>{x.jam}</dd></div>}
                  {x.telepon && (
                    <div><dt>Telepon</dt><dd><a href={"tel:" + x.telepon.replace(/[^0-9+]/g, "")}>{x.telepon}</a></dd></div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
