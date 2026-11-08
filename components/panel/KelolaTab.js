"use client";

import { useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
import { KATEGORI, KATEGORI_META } from "@/data/umkm";
import { RTS, PER_PAGE, rtOf, gradClass } from "@/lib/umkm";
import KategoriIcon from "@/components/KategoriIcon";

/* Tab "Kelola Data": filter RT/kategori, pencarian, tabel berhalaman */
export default function KelolaTab({ data, rtKelola, setRtKelola, onTambah, onDetail, onUbah, onHapus }) {
  const [cat, setCat] = useState("Semua");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const qDebounced = useDebounce(q, 300);
  const qu = qDebounced.trim().toLowerCase();
  const diRt = data.filter((d) => rtKelola === "Semua" || rtOf(d) === rtKelola);
  const cocok = diRt.filter((d) => {
    const okCat = cat === "Semua" || d.kategori === cat;
    const okQ =
      !qu ||
      d.nama.toLowerCase().includes(qu) ||
      (d.pemilik || "").toLowerCase().includes(qu) ||
      (d.lokasi || "").toLowerCase().includes(qu);
    return okCat && okQ;
  });

  const totalPage = Math.max(1, Math.ceil(cocok.length / PER_PAGE));
  const curPage = Math.min(page, totalPage);
  const awal = (curPage - 1) * PER_PAGE;
  const tampil = cocok.slice(awal, awal + PER_PAGE);

  return (
    <>
      <div className="pheadrow">
        <h1 className="ptitle">Kelola Data UMKM</h1>
        <button className="pbtn-primary" onClick={onTambah}>+ Tambah UMKM</button>
      </div>

      <section>
        {/* pemilih RT + hitungan */}
        <div className="punders pmt-6">
          {["Semua"].concat(RTS).map((r) => (
            <button
              key={r}
              className={"putab" + (rtKelola === r ? " aktif" : "")}
              onClick={() => { setRtKelola(r); setPage(1); }}
            >
              {r === "Semua" ? "Semua RT" : r}
            </button>
          ))}
          <span className="pcount"><b>{diRt.length}</b> UMKM terdata</span>
        </div>

        {/* pencarian + filter kategori */}
        <div className="pbar">
          <div className="psearch">
            <span className="pub-search-ico" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari nama usaha, pemilik, atau lokasi..."
              aria-label="Cari UMKM"
            />
          </div>
          <div className="pfilter">
            <select
              className="input pselect" id="fKat" value={cat} aria-label="Filter kategori"
              onChange={(e) => { setCat(e.target.value); setPage(1); }}
            >
              <option value="Semua">Semua kategori</option>
              {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        {/* tabel */}
        <div className="pcard">
          <div className="pscroll">
            <table className="ptable">
              <thead>
                <tr>
                  <th className="th-umkm">UMKM</th>
                  <th>Kategori</th>
                  <th>Lokasi</th>
                  <th className="th-aksi"></th>
                </tr>
              </thead>
              <tbody>
                {cocok.length === 0 && (
                  <tr>
                    <td colSpan={4} className="pempty">
                      Belum ada UMKM{rtKelola === "Semua" ? "" : " di " + rtKelola} yang cocok.
                    </td>
                  </tr>
                )}
                {tampil.map((d) => {
                  const meta = KATEGORI_META[d.kategori] || KATEGORI_META.Lainnya;
                  return (
                    <tr key={d.id} className="prow-klik" onClick={() => onDetail(d.id)}>
                      <td>
                        <div className="pcell-biz">
                          {d.foto ? (
                            <img className="pbiz-img" src={d.foto} alt={d.nama} />
                          ) : (
                            <span className={"pbiz-ava " + gradClass(d.kategori, KATEGORI)}><KategoriIcon kategori={d.kategori} size={20} /></span>
                          )}
                          <div>
                            <div className="pbiz-name">{d.nama}</div>
                            {d.pemilik && <div className="pbiz-owner">{d.pemilik}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="pcat-txt">{d.kategori}</span></td>
                      <td className="td-muted">{d.lokasi || "-"}</td>
                      <td>
                        <div className="pactions">
                          <button
                            className="pico-btn" title="Ubah" aria-label={"Ubah " + d.nama}
                            onClick={(e) => { e.stopPropagation(); onUbah(d.id); }}
                          >&#9998;</button>
                          <button
                            className="pico-btn pico-del" title="Hapus" aria-label={"Hapus " + d.nama}
                            onClick={(e) => { e.stopPropagation(); onHapus(d.id); }}
                          >&#128465;</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pfoot">
            <span>
              Menampilkan {cocok.length === 0 ? 0 : awal + 1}&ndash;{awal + tampil.length} dari {cocok.length} UMKM
              {rtKelola === "Semua" ? "" : " - " + rtKelola}
            </span>
            <span className="ppager">
              <button className="ppage-btn" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}>
                &larr; Sebelumnya
              </button>
              <span>Halaman {curPage} dari {totalPage}</span>
              <button className="ppage-btn" disabled={curPage >= totalPage} onClick={() => setPage(curPage + 1)}>
                Berikutnya &rarr;
              </button>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
