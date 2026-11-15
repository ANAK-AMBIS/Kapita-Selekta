"use client";

import { useIngat } from "./ingat";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { MONTHS, iuranKey, rp, totalTahun } from "@/lib/umkm";
import Pilihan from "./Pilihan";

const BULAN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/* pilihan tahun: tahun berjalan ±, plus tahun yang sudah punya catatan */
function opsiTahun(iuran, id, year) {
  const ys = new Set([year, new Date().getFullYear()]);
  for (const k of Object.keys(iuran)) {
    const [kid, bulan] = k.split("|");
    if (kid === String(id)) ys.add(Number(bulan.slice(0, 4)));
  }
  for (let y = year - 2; y <= year + 1; y++) ys.add(y);
  return [...ys].filter((x) => x >= 2020 && x <= 2100).sort((a, b) => a - b);
}

/* Tab "Iuran Saya": riwayat iuran bulanan milik UMKM yang login (hanya baca). */
export default function IuranSaya({ umkm, iuran }) {
  const now = new Date();
  const [year, setYear] = useIngat("iuran-saya:tahun", now.getFullYear(), (v) => Number.isInteger(v) && v >= 2020 && v <= 2100);

  const total = totalTahun(iuran, umkm.id, year);
  const lunas = MONTHS.map((_, m) => (iuran[iuranKey(umkm.id, year, m)] || 0) > 0);
  const jmlLunas = lunas.filter(Boolean).length;
  const bulanIni = now.getMonth();
  const tahunIni = now.getFullYear();
  const persen = Math.round((jmlLunas / 12) * 100);

  let statusBulanIni = "Belum ada catatan untuk bulan ini.";
  if (year === tahunIni) {
    const v = iuran[iuranKey(umkm.id, year, bulanIni)] || 0;
    statusBulanIni = v > 0
      ? BULAN_PANJANG[bulanIni] + ": sudah dibayar Rp " + rp(v) + "."
      : BULAN_PANJANG[bulanIni] + ": belum ada catatan pembayaran.";
  }

  return (
    <>
      <div className="pheadrow">
        <div>
          <h1 className="ptitle">Iuran Saya</h1>
          <p className="psubtitle">Riwayat iuran bulanan {umkm.nama} yang dicatat admin desa.</p>
        </div>
        <div className="pperiode">
          <div className="pperiode-item">
            <span id="lblTahunSaya">Tahun</span>
            <Pilihan
              id="pilTahunSaya" labelId="lblTahunSaya" value={year} onChange={setYear}
              options={opsiTahun(iuran, umkm.id, year)}
            />
          </div>
        </div>
      </div>

      <section className="pringkas" aria-label={"Ringkasan iuran " + year}>
        <div className="pringkas-utama">
          <p className="pringkas-angka">
            <strong>{jmlLunas}</strong> dari 12 bulan sudah dibayar
          </p>
          <p className="pringkas-ket">
            Tahun {year}
            <span className="pringkas-hp"> &middot; Rp {rp(total)} total</span>
          </p>
          <div
            className="pprogress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen}
            aria-label={persen + "% bulan sudah dibayar"}
          >
            <span style={{ width: persen + "%" }} />
          </div>
        </div>
        <dl className="pringkas-sisi">
          <div><dt>Total {year}</dt><dd>Rp {rp(total)}</dd></div>
          <div><dt>Sudah dibayar</dt><dd>{jmlLunas} bulan</dd></div>
          <div><dt>Belum dibayar</dt><dd>{12 - jmlLunas} bulan</dd></div>
        </dl>
      </section>

      <p className="piuran-catatan">{statusBulanIni}</p>

      <section className="pcard pmt-4" aria-label={"Rincian iuran " + year}>
        <div className="pbar">
          <span className="pbar-info" style={{ marginLeft: 0 }}>
            Data diisi admin desa. Hubungi admin bila ada pembayaran yang belum tercatat.
          </span>
        </div>
        <ul className="piuran-list">
          {MONTHS.map((mn, m) => {
            const v = iuran[iuranKey(umkm.id, year, m)] || 0;
            const iniBulan = year === tahunIni && m === bulanIni;
            return (
              <li key={mn} className={"piuran-item" + (iniBulan ? " kini" : "")}>
                <span className="piuran-bulan">
                  {BULAN_PANJANG[m]}
                  {iniBulan && <span className="piuran-kini">bulan ini</span>}
                </span>
                {v > 0 ? (
                  <span className="piuran-status lunas">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} aria-hidden="true" />
                    Rp {rp(v)}
                  </span>
                ) : (
                  <span className="piuran-status belum">
                    <HugeiconsIcon icon={Clock01Icon} size={16} aria-hidden="true" />
                    Belum dicatat
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
