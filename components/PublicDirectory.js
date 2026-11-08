"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
import { KATEGORI } from "@/data/umkm";
import { RTS, rtOf } from "@/lib/umkm";
import PublicNavbar from "@/components/PublicNavbar";
import UmkmCard from "@/components/UmkmCard";
import PublicFooter from "@/components/PublicFooter";
import JoinCta from "@/components/JoinCta";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, FilterHorizontalIcon } from "@hugeicons/core-free-icons";

/* ============================================================
   Direktori UMKM publik - bisa diakses tanpa login.
   Data diambil dari database di server (app/page.js) lalu
   disaring di browser.
   ============================================================ */

export default function PublicDirectory({ data }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [rt, setRt] = useState("Semua");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  /* tutup panel filter saat klik di luar atau tekan Escape */
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setFilterOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [filterOpen]);

  const nAktif = (cat !== "Semua" ? 1 : 0) + (rt !== "Semua" ? 1 : 0);

  const qDebounced = useDebounce(q, 300);
  const qu = qDebounced.trim().toLowerCase();
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

  /* pagination: 6 per halaman, kembali ke hal. 1 saat filter berubah */
  const PER_PAGE = 6;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [qu, cat, rt]);
  const totalPage = Math.max(1, Math.ceil(cocok.length / PER_PAGE));
  const hal = Math.min(page, totalPage);
  const tampil = cocok.slice((hal - 1) * PER_PAGE, hal * PER_PAGE);
  const goto = (p) => {
    setPage(p);
    document.getElementById("direktori")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pwrap pub-page">
      <PublicNavbar />
      {/* Section 1: hero layar penuh dengan foto latar (ganti file public/img/hero-bg.jpg) */}
      <section className="pub-hero" style={{ "--hero-bg": `url(/img/hero-bg.jpg)` }}>
        <div className="container pub-hero-in">
          <h1 className="pub-hero-title">Dukung usaha warga,<br />tumbuh bersama Dusun 6</h1>
          <p className="pub-hero-desc">
            Direktori UMKM Dusun 6, Desa Way Huwi, Jati Agung, Lampung Selatan:
            kuliner, sembako, kerajinan, hingga jasa milik tetangga sekitar Anda.
          </p>
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
          <h2 className="section-title">Temukan usaha di sekitar Anda</h2>
          <p className="section-sub">Cari berdasarkan nama usaha, pemilik, lokasi, kategori, atau RT.</p>
        </div>

        <div className="dir-search">
          <label className="search-field">
            <input
              className="search-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama usaha, pemilik, atau lokasi..."
              aria-label="Cari UMKM"
            />
            <span className="pub-search-ico" aria-hidden="true">
              <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2} />
            </span>
          </label>
          <div className="pub-filter-wrap" ref={filterRef}>
            <button
              className={"pub-filter-btn" + (filterOpen || nAktif ? " aktif" : "")}
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              aria-haspopup="true"
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} size={18} strokeWidth={2} aria-hidden="true" />
              Filter
              {nAktif > 0 && <span className="pub-filter-badge">{nAktif}</span>}
            </button>

            {filterOpen && (
              <div className="pub-filter-pop" role="dialog" aria-label="Filter UMKM">
                <div className="pub-fp-group">
                  <span className="pub-fp-lbl">Kategori</span>
                  <div className="pub-fp-opts">
                    {["Semua"].concat(KATEGORI).map((k) => (
                      <button key={k} className={"pub-fp-opt" + (cat === k ? " aktif" : "")} onClick={() => setCat(k)}>
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pub-fp-group">
                  <span className="pub-fp-lbl">RT</span>
                  <div className="pub-fp-opts">
                    {["Semua"].concat(RTS).map((r) => (
                      <button key={r} className={"pub-fp-opt" + (rt === r ? " aktif" : "")} onClick={() => setRt(r)}>
                        {r === "Semua" ? "Semua RT" : r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pub-fp-foot">
                  <button className="pub-fp-reset" onClick={() => { setCat("Semua"); setRt("Semua"); }} disabled={!nAktif}>Reset</button>
                  <button className="pub-fp-done" onClick={() => setFilterOpen(false)}>Lihat {cocok.length} UMKM</button>
                </div>
              </div>
            )}
          </div>
</div>

        <p className="pub-count">{cocok.length} UMKM ditemukan</p>

        {cocok.length === 0 ? (
          <p className="dir-empty">Tidak ada UMKM yang cocok dengan pencarian.</p>
        ) : (
          <div className="dir-grid">
            {tampil.map((d) => <UmkmCard key={d.id} umkm={d} />)}
          </div>
        )}

        {totalPage > 1 && (
          <nav className="pub-pager" aria-label="Halaman daftar UMKM">
            <button className="pub-pg" onClick={() => goto(hal - 1)} disabled={hal === 1} aria-label="Halaman sebelumnya">‹</button>
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={"pub-pg" + (p === hal ? " aktif" : "")}
                onClick={() => goto(p)}
                aria-current={p === hal ? "page" : undefined}
              >
                {p}
              </button>
            ))}
            <button className="pub-pg" onClick={() => goto(hal + 1)} disabled={hal === totalPage} aria-label="Halaman berikutnya">›</button>
          </nav>
        )}
      </main>

      {/* Section 3: ajakan mendaftarkan UMKM */}
      <JoinCta
        title="UMKM-mu belum masuk?"
        desc="Hubungi pengurus Dusun 6 untuk mendaftarkan usahamu ke direktori ini. Gratis, cukup siapkan nama usaha, pemilik, alamat, dan nomor kontak."
        pesan="Halo, saya ingin mendaftarkan UMKM saya"
      />

      <PublicFooter />

    </div>
  );
}
