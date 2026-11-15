"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon, Search01Icon, Cancel01Icon, Delete02Icon, Key01Icon, SquareLock02Icon,
} from "@hugeicons/core-free-icons";

/* Tab "Akun UMKM" (khusus admin): daftar akun yang bisa masuk ke panel. */
export default function AkunTab({ akun, data, onBuat, onReset, onToggle, onHapus }) {
  const [q, setQ] = useState("");
  const qu = q.trim().toLowerCase();

  const tampil = qu
    ? akun.filter(
        (a) =>
          (a.nama_umkm || "").toLowerCase().includes(qu) ||
          (a.username || "").toLowerCase().includes(qu)
      )
    : akun;

  const jumlahUmkm = data.length;
  const belum = Math.max(0, jumlahUmkm - akun.length);

  const tanggal = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <div className="pheadrow">
        <div>
          <h1 className="ptitle">Akun UMKM</h1>
          <p className="psubtitle">
            {akun.length} dari {jumlahUmkm} usaha sudah punya akun
            {belum > 0 && <>, {belum} belum</>}.
          </p>
        </div>
        <button type="button" className="pbtn-primary" onClick={() => onBuat(null)}>
          <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
          Buatkan akun
        </button>
      </div>

      <section className="pcard pmt-4" aria-label="Daftar akun UMKM">
        <div className="pbar">
          <label className="psearch">
            <HugeiconsIcon icon={Search01Icon} size={18} className="psearch-ico" aria-hidden="true" />
            <span className="sr-only">Cari akun UMKM</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama usaha atau nama pengguna"
            />
            {q && (
              <button type="button" className="psearch-x" aria-label="Hapus pencarian" onClick={() => setQ("")}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} aria-hidden="true" />
              </button>
            )}
          </label>
          <span className="pbar-info">{tampil.length} akun ditampilkan</span>
        </div>

        <div className="pscroll">
          <table className="ptable ptable-akun">
            <thead>
              <tr>
                <th className="th-umkm">Usaha</th>
                <th>Nama pengguna</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th className="th-aksi"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {tampil.length === 0 && (
                <tr className="prow-empty">
                  <td colSpan={5} className="pempty">
                    {akun.length === 0 ? (
                      <>
                        <strong>Belum ada akun UMKM</strong>
                        <span>
                          Minta pemilik usaha menghubungi admin lewat WhatsApp, lalu klik Buatkan akun
                          untuk membuatkan nama pengguna dan kata sandi.
                        </span>
                      </>
                    ) : (
                      <>
                        <strong>Tidak ada akun yang cocok</strong>
                        <span>Coba kata kunci lain.</span>
                      </>
                    )}
                  </td>
                </tr>
              )}
              {tampil.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="pbiz-text">
                      <span className="pakun-nama">{a.nama_umkm}</span>
                      <div className="pbiz-owner">UMKM #{a.umkm_id}</div>
                    </div>
                  </td>
                  <td data-label="Nama pengguna"><code className="pakun-user">{a.username}</code></td>
                  <td data-label="Status">
                    <span className={"pakun-badge" + (a.aktif ? " ok" : " mati")}>
                      {a.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td data-label="Dibuat" className="td-muted td-nowrap">{tanggal(a.created_at)}</td>
                  <td className="td-aksi">
                    <div className="pactions">
                      <button
                        type="button" className="pico-btn" title="Reset kata sandi" aria-label={"Reset kata sandi " + a.username}
                        onClick={() => onReset(a)}
                      >
                        <HugeiconsIcon icon={Key01Icon} size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button" className="pico-btn" title={a.aktif ? "Nonaktifkan akun" : "Aktifkan akun"}
                        aria-label={(a.aktif ? "Nonaktifkan akun " : "Aktifkan akun ") + a.username}
                        onClick={() => onToggle(a)}
                      >
                        <HugeiconsIcon icon={SquareLock02Icon} size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button" className="pico-btn pico-del" title="Hapus akun" aria-label={"Hapus akun " + a.username}
                        onClick={() => onHapus(a)}
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
            Akun dibuat admin setelah pemilik usaha menghubungi lewat WhatsApp. Pemilik usaha bisa
            mengubah data usahanya sendiri setelah masuk.
          </span>
        </div>
      </section>
    </>
  );
}
