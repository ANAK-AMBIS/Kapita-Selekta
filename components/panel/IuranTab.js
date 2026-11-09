"use client";

import { useIngat } from "./ingat";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { RTS, MONTHS, rp, iuranKey, rtOf, totalTahun } from "@/lib/umkm";
import { useDebounce } from "@/lib/useDebounce";
import Pilihan from "./Pilihan";

const BULAN_PANJANG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/* pilihan tahun: tahun berjalan ±, plus tahun yang punya catatan iuran */
function opsiTahun(iuran, year) {
  const ys = new Set([year, new Date().getFullYear()]);
  for (const k of Object.keys(iuran)) ys.add(Number(k.split("|")[1].slice(0, 4)));
  for (let y = year - 3; y <= year + 1; y++) ys.add(y);
  return [...ys].filter((x) => x >= 2020 && x <= 2100).sort((a, b) => a - b);
}

/* Tab "Iuran Bulanan": ringkasan bulan terpilih + buku iuran per RT */
export default function IuranTab({ data, iuran, onBukaIuran }) {
  const now = new Date();
  /* RT, periode, pencarian, dan filter status diingat (lihat ingat.js) */
  const [rt, setRt] = useIngat("iuran:rt", "Semua", (v) => v === "Semua" || RTS.includes(v));
  const [year, setYear] = useIngat("iuran:tahun", now.getFullYear(), (v) => Number.isInteger(v) && v >= 2020 && v <= 2100);
  const [bulan, setBulan] = useIngat("iuran:bulan", now.getMonth(), (v) => Number.isInteger(v) && v >= 0 && v <= 11);
  const [q, setQ] = useIngat("iuran:cari", "", (v) => typeof v === "string");
  const [status, setStatus] = useIngat("iuran:status", "semua", (v) => ["semua", "belum", "sudah"].includes(v)); /* untuk bulan terpilih */

  const semua = rt === "Semua";
  const rtLabel = semua ? "Semua RT" : rt;
  /* "Semua RT": urutkan per RT agar buku iuran tetap rapi */
  const listRt = semua
    ? [...data].sort((a, b) => RTS.indexOf(rtOf(a)) - RTS.indexOf(rtOf(b)))
    : data.filter((d) => rtOf(d) === rt);
  const rtTotal = listRt.reduce((acc, d) => acc + totalTahun(iuran, d.id, year), 0);
  const bulanBerjalan = now.getFullYear() === year ? now.getMonth() : -1;

  /* pencarian dan filter status hanya menyaring daftar; ringkasan tetap menghitung seluruh RT */
  const qu = useDebounce(q, 200).trim().toLowerCase();
  const hasilCari = qu
    ? listRt.filter((d) => d.nama.toLowerCase().includes(qu) || (d.pemilik || "").toLowerCase().includes(qu))
    : listRt;
  const lunas = (d) => (iuran[iuranKey(d.id, year, bulan)] || 0) > 0;
  const jmlSudah = hasilCari.filter(lunas).length;
  const opsiStatus = [
    ["semua", "Semua", hasilCari.length],
    ["belum", "Belum", hasilCari.length - jmlSudah],
    ["sudah", "Sudah", jmlSudah],
  ];
  const tampil = status === "semua" ? hasilCari : hasilCari.filter((d) => (status === "sudah") === lunas(d));

  /* pesan saat daftar kosong, sesuai penyebabnya */
  let kosongJudul, kosongKet;
  if (hasilCari.length === 0 && qu) {
    kosongJudul = <>Tidak ada usaha bernama &ldquo;{q.trim()}&rdquo;</>;
    kosongKet = "Periksa ejaan, atau pilih Semua RT kalau usahanya ada di RT lain.";
  } else if (hasilCari.length === 0) {
    kosongJudul = "Belum ada usaha" + (semua ? "" : " di " + rt);
    kosongKet = "Tambahkan dulu lewat menu Data UMKM.";
  } else if (status === "belum") {
    kosongJudul = "Semua sudah bayar " + BULAN_PANJANG[bulan] + " " + year;
    kosongKet = "Tidak ada yang perlu ditagih untuk bulan ini.";
  } else {
    kosongJudul = "Belum ada yang bayar " + BULAN_PANJANG[bulan] + " " + year;
    kosongKet = "Pilih Belum bayar untuk melihat daftar yang perlu ditagih.";
  }

  /* ringkasan bulan terpilih */
  let sumBulan = 0, sudah = 0;
  for (const d of listRt) {
    const v = iuran[iuranKey(d.id, year, bulan)] || 0;
    if (v > 0) sudah++;
    sumBulan += v;
  }
  const persen = listRt.length ? Math.round((sudah / listRt.length) * 100) : 0;
  const blnName = BULAN_PANJANG[bulan] + " " + year;

  const sumPerBulan = MONTHS.map((_, m) =>
    tampil.reduce((acc, d) => acc + (iuran[iuranKey(d.id, year, m)] || 0), 0)
  );
  const totalTampil = tampil.reduce((acc, d) => acc + totalTahun(iuran, d.id, year), 0);

  return (
    <>
      <div className="pheadrow">
        <div>
          <h1 className="ptitle">Iuran Bulanan</h1>
          <p className="psubtitle">
            <span className="iu-lebar-teks">Klik sel bulan di tabel untuk mencatat atau mengubah pembayaran.</span>
            <span className="iu-hp-teks">Pilih bulan, lalu ketuk Catat di samping nama usaha.</span>
          </p>
        </div>
        <div className="pperiode">
          <div className="pperiode-item">
            <span id="lblBulan">Bulan</span>
            <Pilihan
              id="pilBulan" labelId="lblBulan" value={bulan} onChange={setBulan}
              options={BULAN_PANJANG.map((mn, m) => ({ value: m, label: mn }))}
            />
          </div>
          <div className="pperiode-item">
            <span id="lblTahun">Tahun</span>
            <Pilihan id="pilTahun" labelId="lblTahun" value={year} onChange={setYear} options={opsiTahun(iuran, year)} />
          </div>
        </div>
      </div>

      <div className="pseg" role="group" aria-label="Pilih RT">
        {["Semua"].concat(RTS).map((r) => (
          <button
            key={r}
            type="button"
            className={"pseg-btn" + (rt === r ? " aktif" : "")}
            aria-pressed={rt === r}
            onClick={() => setRt(r)}
          >
            {r === "Semua" ? "Semua RT" : r}
          </button>
        ))}
      </div>

      <section className="pringkas" aria-label={"Ringkasan " + blnName}>
        <div className="pringkas-utama">
          <p className="pringkas-angka">
            <strong>{sudah}</strong> dari {listRt.length} usaha sudah bayar
          </p>
          <p className="pringkas-ket">
            {blnName}, {rtLabel}
            <span className="pringkas-hp"> · Rp {rp(sumBulan)} terkumpul</span>
          </p>
          <div
            className="pprogress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen}
            aria-label={persen + "% sudah bayar"}
          >
            <span style={{ width: persen + "%" }} />
          </div>
        </div>
        <dl className="pringkas-sisi">
          <div><dt>Terkumpul {BULAN_PANJANG[bulan]}</dt><dd>Rp {rp(sumBulan)}</dd></div>
          <div><dt>Belum bayar</dt><dd>{listRt.length - sudah} usaha</dd></div>
          <div><dt>Total {year}</dt><dd>Rp {rp(rtTotal)}</dd></div>
        </dl>
      </section>

      <section className="pcard pmt-4" aria-label={"Buku iuran " + rtLabel + " tahun " + year}>
        <div className="pbar">
          <label className="psearch">
            <HugeiconsIcon icon={Search01Icon} size={18} className="psearch-ico" aria-hidden="true" />
            <span className="sr-only">Cari usaha di buku iuran</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama usaha atau pemilik"
            />
            {q && (
              <button type="button" className="psearch-x" aria-label="Hapus pencarian" onClick={() => setQ("")}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="pseg pstatus" role="group" aria-label={"Saring status bayar " + blnName}>
            {opsiStatus.map(([id, label, n]) => (
              <button
                key={id}
                type="button"
                className={"pseg-btn" + (status === id ? " aktif" : "")}
                aria-pressed={status === id}
                onClick={() => setStatus(id)}
              >
                {label}{id !== "semua" && <span className="pstatus-ext"> bayar</span>} <span className="pstatus-n">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* HP: daftar per usaha untuk bulan terpilih (tabel 12 bulan terlalu lebar untuk layar kecil) */}
        <div className="iu-hp">
          <p className="iu-hp-judul">Iuran {blnName}</p>
          {tampil.length === 0 ? (
            <div className="pempty">
              <strong>{kosongJudul}</strong>
              <span>{kosongKet}</span>
            </div>
          ) : (
            <ul className="iu-hp-list">
              {tampil.map((d) => {
                const key = iuranKey(d.id, year, bulan);
                const v = iuran[key] || 0;
                return (
                  <li key={d.id} className="iu-hp-item">
                    <div className="iu-hp-info">
                      <div className="iu-nama">{d.nama}</div>
                      <div className="iu-pemilik">{[rtOf(d), d.pemilik].filter(Boolean).join(" · ")}</div>
                      <div className={"iu-hp-status" + (v > 0 ? " lunas" : "")}>
                        {v > 0 ? "Sudah bayar Rp " + rp(v) : "Belum bayar"}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={v > 0 ? "pbtn-ghost iu-hp-btn" : "pbtn-primary iu-hp-btn"}
                      aria-label={(v > 0 ? "Ubah iuran " : "Catat iuran ") + d.nama + ", " + blnName}
                      onClick={() => onBukaIuran(key, d.nama, blnName)}
                    >
                      {v > 0 ? "Ubah" : "Catat"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="iu-hp-catatan">Ganti bulan lewat pilihan Bulan di atas. Tabel setahun penuh tampil di layar yang lebih lebar.</p>
        </div>

        <div className="pscroll iu-lebar">
          <table className="ptable iutable">
            <thead>
              <tr>
                <th className="c-no">No</th>
                <th className="c-nama hnama">Nama usaha</th>
                {MONTHS.map((mn, m) => (
                  <th
                    key={m}
                    className={"th-bln" + (m === bulanBerjalan ? " bln-aktif" : "") + (m === bulan ? " bln-pilih" : "")}
                  >
                    {mn}
                  </th>
                ))}
                <th className="hjum">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {tampil.length === 0 && (
                <tr>
                  <td colSpan={15} className="pempty">
                    <strong>{kosongJudul}</strong>
                    <span>{kosongKet}</span>
                  </td>
                </tr>
              )}
              {tampil.map((d, idx) => (
                <tr key={d.id}>
                  <td className="c-no">{idx + 1}</td>
                  <td className="c-nama">
                    <div className="iu-nama">{d.nama}</div>
                    {(d.pemilik || semua) && (
                      <div className="iu-pemilik">
                        {[semua && rtOf(d), d.pemilik].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </td>
                  {MONTHS.map((mn, m) => {
                    const key = iuranKey(d.id, year, m);
                    const v = iuran[key] || 0;
                    return (
                      <td key={key} className={"c-bln" + (m === bulan ? " bln-pilih" : "")}>
                        <button
                          type="button"
                          className={"iu-sel" + (v > 0 ? " terisi" : "")}
                          aria-label={d.nama + ", " + BULAN_PANJANG[m] + " " + year + ": " + (v > 0 ? "Rp " + rp(v) : "belum bayar")}
                          onClick={() => onBukaIuran(key, d.nama, BULAN_PANJANG[m] + " " + year)}
                        >
                          {v > 0 ? rp(v) : "–"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="c-jum">{rp(totalTahun(iuran, d.id, year))}</td>
                </tr>
              ))}
              {tampil.length > 0 && (
                <tr className="row-jum">
                  <td className="c-no"></td>
                  <td className="c-nama jum-label">{qu || status !== "semua" ? "Jumlah yang tampil" : "Jumlah"}</td>
                  {sumPerBulan.map((sum, m) => (
                    <td key={m} className="jum-val">{sum > 0 ? rp(sum) : "–"}</td>
                  ))}
                  <td className="c-jum">{rp(totalTampil)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
