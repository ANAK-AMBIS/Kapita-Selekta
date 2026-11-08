"use client";

import { useState } from "react";
import { RTS, MONTHS, rp, iuranKey, rtOf, totalTahun } from "@/lib/umkm";

/* pilihan tahun: tahun berjalan ±, plus tahun yang punya catatan iuran */
function opsiTahun(iuran, year) {
  const ys = new Set([year, new Date().getFullYear()]);
  for (const k of Object.keys(iuran)) ys.add(Number(k.split("|")[1].slice(0, 4)));
  for (let y = year - 3; y <= year + 1; y++) ys.add(y);
  return [...ys].filter((x) => x >= 2020 && x <= 2100).sort((a, b) => a - b);
}

/* Tab "Iuran Bulanan": statistik + buku iuran per RT */
export default function IuranTab({ data, iuran, onBukaIuran }) {
  const now = new Date();
  const [rt, setRt] = useState("Semua");
  const [year, setYear] = useState(now.getFullYear());
  const [bulan, setBulan] = useState(now.getMonth());

  const semua = rt === "Semua";
  const rtLabel = semua ? "Semua RT" : rt;
  /* "Semua RT": urutkan per RT agar buku iuran tetap rapi */
  const listRt = semua
    ? [...data].sort((a, b) => RTS.indexOf(rtOf(a)) - RTS.indexOf(rtOf(b)))
    : data.filter((d) => rtOf(d) === rt);
  const rtTotal = listRt.reduce((acc, d) => acc + totalTahun(iuran, d.id, year), 0);
  const bulanBerjalan = now.getFullYear() === year ? now.getMonth() : -1;

  /* statistik bulan terpilih */
  let sumBulan = 0, sudah = 0;
  for (const d of listRt) {
    const v = iuran[iuranKey(d.id, year, bulan)] || 0;
    if (v > 0) sudah++;
    sumBulan += v;
  }
  const blnName = MONTHS[bulan] + " " + year;
  const stats = [
    { num: "Rp " + rp(sumBulan), label: "Iuran " + blnName + " (" + rtLabel + ")" },
    { num: sudah, label: "Sudah bayar " + blnName },
    { num: listRt.length - sudah, label: "Belum bayar " + blnName },
    { num: "Rp " + rp(rtTotal), label: "Total " + year + " (" + rtLabel + ")" },
  ];

  const sumPerBulan = MONTHS.map((_, m) =>
    listRt.reduce((acc, d) => acc + (iuran[iuranKey(d.id, year, m)] || 0), 0)
  );

  return (
    <>
      <div className="pheadrow">
        <h1 className="ptitle">Iuran Bulanan UMKM</h1>
        <div className="pyear">
          <svg className="pyear-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Bulan:
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} aria-label="Bulan">
            {MONTHS.map((mn, m) => <option key={m} value={m}>{mn}</option>)}
          </select>
          Tahun:
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Tahun">
            {opsiTahun(iuran, year).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="pstatgrid">
        {stats.map((s) => (
          <div className="pstatcard" key={s.label}>
            <span className="pstat-title">{s.label}</span>
            <span className="pstat-num">{s.num}</span>
          </div>
        ))}
      </div>

      <section>
        {/* pemilih RT */}
        <div className="punders pmt-4">
          {["Semua"].concat(RTS).map((r) => (
            <button key={r} className={"putab" + (rt === r ? " aktif" : "")} onClick={() => setRt(r)}>
              {r === "Semua" ? "Semua RT" : r}
            </button>
          ))}
        </div>

        <div className="pinfo">
          <span><b className="tebal">{rtLabel}</b> &mdash; {listRt.length} UMKM terdata</span>
          <span className="td-muted">
            Tahun <b className="hijau">{year}</b>: <b className="hijau">Rp {rp(rtTotal)}</b>
          </span>
        </div>

        {/* buku iuran */}
        <div className="pcard pmt-3">
          <div className="pscroll">
            <table className="ptable iutable">
              <thead>
                <tr>
                  <th className="c-no">No</th>
                  <th className="c-nama hnama">Nama Usaha</th>
                  {MONTHS.map((mn, m) => (
                    <th key={m} className={"th-bln" + (m === bulanBerjalan ? " bln-aktif" : "")}>{mn}</th>
                  ))}
                  <th className="hjum">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {listRt.length === 0 && (
                  <tr>
                    <td colSpan={15} className="pempty">Belum ada UMKM terdata{semua ? "" : " di " + rt}.</td>
                  </tr>
                )}
                {listRt.map((d, idx) => (
                  <tr key={d.id}>
                    <td className="c-no">{idx + 1}</td>
                    <td className="c-nama">
                      <div className="pbiz-name iu-nama">{d.nama}</div>
                      {(d.pemilik || semua) && (
                        <div className="pbiz-owner iu-pemilik">
                          {[semua && rtOf(d), d.pemilik].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </td>
                    {MONTHS.map((mn, m) => {
                      const key = iuranKey(d.id, year, m);
                      const v = iuran[key] || 0;
                      return (
                        <td
                          key={key}
                          className={"c-bln" + (v > 0 ? " c-blnterisi" : " kosong")}
                          onClick={() => onBukaIuran(key, d.nama, mn + " " + year)}
                        >
                          {v > 0 ? rp(v) : "—"}
                        </td>
                      );
                    })}
                    <td className="c-jum">{rp(totalTahun(iuran, d.id, year))}</td>
                  </tr>
                ))}
                {/* baris jumlah */}
                <tr className="row-jum">
                  <td className="c-no"></td>
                  <td className="c-nama jum-label">Jumlah {rtLabel}</td>
                  {sumPerBulan.map((sum, m) => (
                    <td key={m} className="jum-val">{sum > 0 ? rp(sum) : "—"}</td>
                  ))}
                  <td className="c-jum">{rp(rtTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
