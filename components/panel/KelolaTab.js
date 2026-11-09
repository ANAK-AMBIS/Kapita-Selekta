"use client";

import { useIngat } from "./ingat";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon, Search01Icon, Cancel01Icon, PencilEdit02Icon, Delete02Icon, ArrowLeft01Icon, ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useDebounce } from "@/lib/useDebounce";
import { KATEGORI } from "@/data/umkm";
import { RTS, PER_PAGE, rtOf } from "@/lib/umkm";
import KategoriIcon from "@/components/KategoriIcon";
import Pilihan from "./Pilihan";

/* Tab "Data UMKM": ringkasan, filter RT/kategori, pencarian, tabel berhalaman */
export default function KelolaTab({ data, rtKelola, setRtKelola, onTambah, onDetail, onUbah, onHapus }) {
  /* filter, pencarian, dan halaman diingat (lihat ingat.js) */
  const [cat, setCat] = useIngat("kelola:kategori", "Semua", (v) => v === "Semua" || KATEGORI.includes(v));
  const [q, setQ] = useIngat("kelola:cari", "", (v) => typeof v === "string");
  const [page, setPage] = useIngat("kelola:halaman", 1, (v) => Number.isInteger(v) && v >= 1);

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
  const adaFilter = cat !== "Semua" || qu !== "";

  const tanpaFoto = diRt.filter((d) => !d.foto).length;

  return (
    <>
      <div className="pheadrow">
        <div>
          <h1 className="ptitle">Data UMKM</h1>
          <p className="psubtitle">
            {diRt.length} usaha terdata{rtKelola === "Semua" ? "" : " di " + rtKelola}
            {tanpaFoto > 0 && <>, {tanpaFoto} belum punya foto</>}.
          </p>
        </div>
        <button type="button" className="pbtn-primary" onClick={onTambah}>
          <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
          Tambah UMKM
        </button>
      </div>

      {/* pemilih RT */}
      <div className="pseg" role="group" aria-label="Pilih RT">
        {["Semua"].concat(RTS).map((r) => (
          <button
            key={r}
            type="button"
            className={"pseg-btn" + (rtKelola === r ? " aktif" : "")}
            aria-pressed={rtKelola === r}
            onClick={() => { setRtKelola(r); setPage(1); }}
          >
            {r === "Semua" ? "Semua RT" : r}
          </button>
        ))}
      </div>

      <section className="pcard pmt-4" aria-label="Daftar UMKM">
        {/* pencarian + filter kategori */}
        <div className="pbar">
          <label className="psearch">
            <HugeiconsIcon icon={Search01Icon} size={18} className="psearch-ico" aria-hidden="true" />
            <span className="sr-only">Cari UMKM</span>
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari nama usaha, pemilik, atau lokasi"
            />
            {q && (
              <button type="button" className="psearch-x" aria-label="Hapus pencarian" onClick={() => { setQ(""); setPage(1); }}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} aria-hidden="true" />
              </button>
            )}
          </label>
          <Pilihan
            className="pbar-pilih"
            value={cat}
            ariaLabel="Filter kategori"
            onChange={(v) => { setCat(v); setPage(1); }}
            options={[{ value: "Semua", label: "Semua kategori" }].concat(KATEGORI)}
          />
        </div>

        <div className="pscroll">
          <table className="ptable ptable-kelola">
            <thead>
              <tr>
                <th className="th-umkm">Usaha</th>
                <th>Kategori</th>
                <th>RT</th>
                <th>Lokasi</th>
                <th className="th-aksi"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {cocok.length === 0 && (
                <tr className="prow-empty">
                  <td colSpan={5} className="pempty">
                    <strong>Tidak ada usaha yang cocok</strong>
                    <span>
                      {adaFilter
                        ? "Coba kata kunci lain atau pilih kategori yang berbeda."
                        : "Belum ada UMKM" + (rtKelola === "Semua" ? "" : " di " + rtKelola) + ". Klik Tambah UMKM untuk mulai."}
                    </span>
                  </td>
                </tr>
              )}
              {tampil.map((d) => (
                <tr key={d.id} className="prow-klik" onClick={() => onDetail(d.id)}>
                  <td>
                    <div className="pcell-biz">
                      {d.foto ? (
                        <img className="pbiz-img" src={d.foto} alt="" />
                      ) : (
                        <span className="pbiz-ava"><KategoriIcon kategori={d.kategori} size={20} /></span>
                      )}
                      <div className="pbiz-text">
                        <button
                          type="button"
                          className="pbiz-name"
                          onClick={(e) => { e.stopPropagation(); onDetail(d.id); }}
                        >
                          {d.nama}
                        </button>
                        {d.pemilik && <div className="pbiz-owner">{d.pemilik}</div>}
                      </div>
                    </div>
                  </td>
                  <td data-label="Kategori">{d.kategori}</td>
                  <td data-label="RT" className="td-nowrap">{rtOf(d)}</td>
                  <td data-label="Lokasi" className="td-muted td-lokasi">
                    {d.lokasi || "-"}
                  </td>
                  <td className="td-aksi">
                    <div className="pactions">
                      <button
                        type="button" className="pico-btn" title="Ubah" aria-label={"Ubah " + d.nama}
                        onClick={(e) => { e.stopPropagation(); onUbah(d.id); }}
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button" className="pico-btn pico-del" title="Hapus" aria-label={"Hapus " + d.nama}
                        onClick={(e) => { e.stopPropagation(); onHapus(d.id); }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pfoot">
          <span>
            {cocok.length === 0
              ? "0 usaha"
              : <>Menampilkan <b>{awal + 1}&ndash;{awal + tampil.length}</b> dari <b>{cocok.length}</b> usaha</>}
          </span>
          {totalPage > 1 && (
            <span className="ppager">
              <button
                type="button" className="ppage-btn" aria-label="Halaman sebelumnya"
                disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} aria-hidden="true" />
              </button>
              <span aria-live="polite">{curPage} / {totalPage}</span>
              <button
                type="button" className="ppage-btn" aria-label="Halaman berikutnya"
                disabled={curPage >= totalPage} onClick={() => setPage(curPage + 1)}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
      </section>
    </>
  );
}
