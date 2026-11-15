"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon, Shield01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { RTS } from "@/lib/umkm";
import KategoriIcon from "@/components/KategoriIcon";

const MIN_PASS = 8;

/* Tab "UMKM Saya": satu usaha milik akun yang sedang login.
   Hanya data usahanya sendiri; RT dan penghapusan tetap urusan admin. */
export default function UmkmSaya({ umkm: d, akun, onUbah, onGantiSandi }) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [tampil, setTampil] = useState(false);

  const jmlProduk = Array.isArray(d.katalog) ? d.katalog.length : 0;
  const jmlGaleri = Array.isArray(d.galeri) ? d.galeri.length : 0;

  async function submitSandi(e) {
    e.preventDefault();
    if (sibuk) return;
    if (baru.length < MIN_PASS) { setErr("Kata sandi baru minimal " + MIN_PASS + " karakter."); return; }
    if (baru !== ulang) { setErr("Ulangan kata sandi baru tidak sama."); return; }
    if (baru === lama) { setErr("Kata sandi baru harus berbeda dari yang lama."); return; }
    setErr("");
    setOk("");
    setSibuk(true);
    const berhasil = await onGantiSandi(lama, baru);
    setSibuk(false);
    if (berhasil) {
      setLama(""); setBaru(""); setUlang("");
      setOk("Kata sandi berhasil diganti.");
      setTampil(false);
    }
  }

  return (
    <>
      <div className="pheadrow">
        <div>
          <h1 className="ptitle">UMKM Saya</h1>
          <p className="psubtitle">Perbarui informasi usaha yang tampil di direktori publik Dusun 6.</p>
        </div>
        <button type="button" className="pbtn-primary" onClick={onUbah}>
          <HugeiconsIcon icon={PencilEdit02Icon} size={18} aria-hidden="true" />
          Ubah data
        </button>
      </div>

      <section className="pcard pmt-4 pprofil" aria-label="Profil usaha">
        <div className="pprofil-atas">
          {d.foto ? (
            <img className="pprofil-foto" src={d.foto} alt={"Foto " + d.nama} />
          ) : (
            <span className="pprofil-foto pprofil-kosong">
              <KategoriIcon kategori={d.kategori} size={34} strokeWidth={1.4} />
            </span>
          )}
          <div className="pprofil-teks">
            <h2 className="pprofil-nama">{d.nama}</h2>
            {d.pemilik && <p className="pprofil-pemilik">{d.pemilik}</p>}
            <p className="pprofil-ket">
              {d.kategori} &middot; {d.rt || RTS[0]}
            </p>
          </div>
        </div>

        <dl className="pdata-list pprofil-rows">
          <div><dt>Alamat usaha</dt><dd>{d.lokasi || "-"}</dd></div>
          <div><dt>Telepon / WhatsApp</dt><dd>{d.telepon || "-"}</dd></div>
          <div>
            <dt>Link Google Maps</dt>
            <dd>
              {d.maps_url ? (
                <a href={d.maps_url} target="_blank" rel="noopener noreferrer">Buka di Google Maps</a>
              ) : "-"}
            </dd>
          </div>
          <div><dt>Katalog produk</dt><dd>{d.produk_aktif ? "Aktif (" + jmlProduk + " produk)" : "Nonaktif (" + jmlProduk + " produk tersimpan)"}</dd></div>
          <div><dt>Foto galeri</dt><dd>{jmlGaleri} foto</dd></div>
        </dl>

      </section>

      <section className="pcard pmt-4 pakun-saya" aria-label="Keamanan akun">
        <div className="pcard-head">
          <h2 className="pcard-title">
            <HugeiconsIcon icon={Shield01Icon} size={18} aria-hidden="true" />
            Keamanan akun
          </h2>
        </div>

        <div className="pakun-saya-isi">
          <div className="pfield">
            <span className="plabel">Nama pengguna</span>
            <code className="pakun-user">{akun?.username || "-"}</code>
            <span className="pfoto-note">Nama pengguna diatur admin dan tidak bisa diubah sendiri.</span>
          </div>

          <form className="pform" onSubmit={submitSandi} noValidate aria-busy={sibuk}>
            <fieldset className="psect">
              <legend className="psect-title">Ganti kata sandi</legend>
              <div className="pfield">
                <label className="plabel" htmlFor="fSandiLama">Kata sandi sekarang</label>
                <input
                  id="fSandiLama" className="input" type="password" value={lama}
                  autoComplete="current-password" data-autofocus
                  onChange={(e) => { setLama(e.target.value); setErr(""); setOk(""); }}
                />
              </div>
              <div className="prow-2">
                <div className="pfield">
                  <label className="plabel" htmlFor="fSandiBaru">Kata sandi baru</label>
                  <input
                    id="fSandiBaru" className="input" type={tampil ? "text" : "password"} value={baru}
                    autoComplete="new-password"
                    onChange={(e) => { setBaru(e.target.value); setErr(""); setOk(""); }}
                  />
                </div>
                <div className="pfield">
                  <label className="plabel" htmlFor="fSandiUlang">Ulangi kata sandi baru</label>
                  <input
                    id="fSandiUlang" className="input" type={tampil ? "text" : "password"} value={ulang}
                    autoComplete="new-password"
                    onChange={(e) => { setUlang(e.target.value); setErr(""); setOk(""); }}
                  />
                </div>
              </div>
              <label className="pkat-switch">
                <input type="checkbox" checked={tampil} onChange={(e) => setTampil(e.target.checked)} />
                <span>Tampilkan kata sandi</span>
              </label>
              {err && <span className="pfield-err" role="alert">{err}</span>}
              {ok && (
                <span className="pakun-ok-teks" role="status">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} aria-hidden="true" />
                  {ok}
                </span>
              )}
            </fieldset>

            <div className="pakun-saya-aksi">
              <button type="submit" className="pbtn-primary" disabled={sibuk}>
                {sibuk && <span className="pbtn-spin" aria-hidden="true" />}
                {sibuk ? "Menyimpan..." : "Simpan kata sandi"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="pmt-4" aria-label="Pindah atau menutup usaha">
        <div className="pub-join-box">
          <div>
            <h2 className="pub-join-title">Ingin pindah atau menutup usaha?</h2>
            <p className="pub-join-desc">Hubungi pengurus Dusun 6 untuk menghapus atau mengubah RT</p>
          </div>
          <a
            className="btn btn-lg pub-join-btn"
            href={"https://wa.me/6281234567890?text=" + encodeURIComponent("Halo, saya ingin pindah RT atau menutup usaha.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
