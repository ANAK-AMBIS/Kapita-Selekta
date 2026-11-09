"use client";

import { useRef, useState } from "react";
import { KATEGORI } from "@/data/umkm";
import { RTS } from "@/lib/umkm";
import Modal from "./Modal";
import Pilihan from "./Pilihan";

import KategoriIcon from "@/components/KategoriIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PencilEdit02Icon, Add01Icon, Image01Icon } from "@hugeicons/core-free-icons";

const MAKS_GALERI = 8;
const MAKS_PRODUK = 20;
const NOMINAL_CEPAT = [5000, 10000, 20000, 50000];

/* ---------- Detail UMKM ---------- */
export function DetailModal({ umkm: d, onClose, onUbah }) {
  return (
    <Modal title={d.nama} onClose={onClose} className="pdet" hideHead>
      {d.foto ? (
        <img className="pdet-foto" src={d.foto} alt={"Foto " + d.nama} />
      ) : (
        <div className="pdet-foto pdet-foto-kosong">
          <KategoriIcon kategori={d.kategori} size={40} strokeWidth={1.4} />
          <span>Belum ada foto</span>
        </div>
      )}
      <div className="pmodal-head">
        <h2 className="pmodal-title">{d.nama}</h2>
        <button type="button" className="pico-btn" aria-label="Tutup" onClick={onClose}><HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" /></button>
      </div>
      {d.pemilik && <p className="pdet-owner">{d.pemilik}</p>}
      <dl className="pdet-rows">
        <div><dt>Kategori</dt><dd>{d.kategori}</dd></div>
        <div><dt>RT</dt><dd>{d.rt || "-"}</dd></div>
        <div><dt>Alamat usaha</dt><dd>{d.lokasi || "-"}</dd></div>
        <div><dt>Katalog</dt><dd>{d.produk_aktif ? "Aktif" : "Nonaktif"}</dd></div>
      </dl>
      <div className="pmodal-actions">
        <button type="button" className="pbtn-ghost" onClick={onClose}>Tutup</button>
        <button type="button" className="pbtn-primary" onClick={onUbah}>
          <HugeiconsIcon icon={PencilEdit02Icon} size={18} aria-hidden="true" />
          Ubah data
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Tambah / Ubah UMKM ---------- */

/* perkecil foto (sisi terpanjang maks `maks` px) supaya hemat ruang di database */
function kecilkanFoto(file, done, maks = 400) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new window.Image();
    img.onload = () => {
      const s = Math.min(1, maks / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      done(c.toDataURL("image/jpeg", 0.75));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* tombol pemilih file yang bisa dijangkau keyboard (input file-nya disembunyikan) */
function PilihFile({ className, multiple = false, onPilih, ariaLabel, children }) {
  const input = useRef(null);
  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={() => input.current.click()}>
        {children}
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden tabIndex={-1} onChange={onPilih} />
    </>
  );
}

const kosongkanProduk = () => ({ nama: "", harga: "", keterangan: "", foto: "" });

/* awal: data UMKM yang diubah, atau null untuk tambah baru */
export function UmkmFormModal({ awal, rtDefault, onSimpan, onClose }) {
  const [f, setF] = useState(() => ({
    nama: awal?.nama || "",
    pemilik: awal?.pemilik || "",
    kategori: awal?.kategori || KATEGORI[0],
    rt: awal?.rt || rtDefault,
    lokasi: awal?.lokasi || "",
    maps_url: awal?.maps_url || "",
    foto: awal?.foto || "",
    galeri: Array.isArray(awal?.galeri) ? awal.galeri : [],
    produk_aktif: awal?.produk_aktif === true,
    katalog: Array.isArray(awal?.katalog)
      ? awal.katalog.map((p) => ({ nama: p.nama || "", harga: p.harga ?? "", keterangan: p.keterangan || "", foto: p.foto || "" }))
      : [],
  }));
  const [awalJson] = useState(() => JSON.stringify(f));
  const [errNama, setErrNama] = useState("");
  const [errProduk, setErrProduk] = useState(-1); /* indeks produk tanpa nama */
  const [sibuk, setSibuk] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });

  /* jangan buang isian tanpa bertanya */
  function tutup() {
    if (sibuk) return;
    if (JSON.stringify(f) !== awalJson && !window.confirm("Perubahan belum disimpan. Tutup dan buang perubahan?")) return;
    onClose();
  }

  function pilihFoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; /* agar file sama bisa dipilih lagi */
    if (file) kecilkanFoto(file, (foto) => setF((prev) => ({ ...prev, foto })));
  }

  function tambahGaleri(e) {
    const files = Array.from(e.target.files || []).slice(0, MAKS_GALERI - f.galeri.length);
    e.target.value = "";
    files.forEach((file) =>
      kecilkanFoto(file, (foto) => setF((prev) => (
        prev.galeri.length >= MAKS_GALERI ? prev : { ...prev, galeri: [...prev.galeri, foto] }
      )), 1000)
    );
  }
  const ubahProduk = (i, k, v) => setF((prev) => ({
    ...prev, katalog: prev.katalog.map((p, j) => (j === i ? { ...p, [k]: v } : p)),
  }));
  const tambahProduk = () => setF((prev) => (
    prev.katalog.length >= MAKS_PRODUK ? prev : { ...prev, katalog: [...prev.katalog, kosongkanProduk()] }
  ));
  const hapusProduk = (i) => { setErrProduk(-1); setF((prev) => ({ ...prev, katalog: prev.katalog.filter((_, j) => j !== i) })); };
  function fotoProduk(i, e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file) kecilkanFoto(file, (foto) => ubahProduk(i, "foto", foto), 600);
  }

  const hapusGaleri = (i) => setF((prev) => ({ ...prev, galeri: prev.galeri.filter((_, j) => j !== i) }));

  async function submit(e) {
    e.preventDefault();
    if (sibuk) return;
    const tanpaNama = f.katalog.findIndex((p) => !p.nama.trim());
    setErrNama(f.nama.trim() ? "" : "Isi nama usaha, misalnya Warung Bu Sari.");
    setErrProduk(tanpaNama);
    /* fokus ke kolom pertama yang salah */
    if (!f.nama.trim()) { document.getElementById("fNama")?.focus(); return; }
    if (tanpaNama >= 0) { document.getElementById("fProduk" + tanpaNama)?.focus(); return; }

    setSibuk(true);
    const ok = await onSimpan({
      nama: f.nama.trim(), pemilik: f.pemilik.trim(), kategori: f.kategori,
      rt: f.rt, lokasi: f.lokasi.trim(), maps_url: f.maps_url.trim(), foto: f.foto || null, galeri: f.galeri,
      produk_aktif: f.produk_aktif,
      katalog: f.katalog.map((p) => ({
        nama: p.nama.trim(),
        harga: p.harga === "" ? null : Math.round(Number(p.harga)),
        keterangan: p.keterangan.trim(),
        foto: p.foto || null,
      })),
    });
    if (!ok) setSibuk(false);
  }

  return (
    <Modal title={awal ? "Ubah UMKM" : "Tambah UMKM"} onClose={tutup}>
      <form onSubmit={submit} className="pform" noValidate aria-busy={sibuk}>
        <fieldset className="psect">
        <legend className="psect-title">Info usaha</legend>
        <div className="pfield">
          <label className="plabel" htmlFor="fNama">Nama usaha</label>
          <input
            id="fNama" className="input" value={f.nama} placeholder="Contoh: Warung Bu Sari" data-autofocus
            onChange={(e) => { ubah("nama")(e); if (errNama && e.target.value.trim()) setErrNama(""); }}
            aria-invalid={errNama ? true : undefined}
            aria-describedby={errNama ? "errNama" : undefined}
          />
          {errNama && <span className="pfield-err" id="errNama" role="alert">{errNama}</span>}
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fPemilik">Nama pemilik <span className="popsi">(opsional)</span></label>
          <input id="fPemilik" className="input" value={f.pemilik} onChange={ubah("pemilik")} placeholder="Contoh: Sari Wulandari" autoComplete="off" />
        </div>
        <div className="prow-2">
          <div className="pfield">
            <span className="plabel" id="lblKategori">Kategori</span>
            <Pilihan id="fKategori" labelId="lblKategori" value={f.kategori} options={KATEGORI} onChange={(v) => setF({ ...f, kategori: v })} />
          </div>
          <div className="pfield">
            <span className="plabel" id="lblRt">RT</span>
            <Pilihan id="fRt" labelId="lblRt" value={f.rt} options={RTS} onChange={(v) => setF({ ...f, rt: v })} />
          </div>
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fLokasi">Alamat <span className="popsi">(opsional)</span></label>
          <input id="fLokasi" className="input" value={f.lokasi} onChange={ubah("lokasi")} placeholder="Contoh: Jl. Raya Way Huwi" autoComplete="off" />
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fMaps">Link Google Maps <span className="popsi">(opsional)</span></label>
          <input id="fMaps" className="input" type="url" inputMode="url" value={f.maps_url} onChange={ubah("maps_url")} placeholder="https://maps.app.goo.gl/..." aria-describedby="noteMaps" />
          <span className="pfoto-note" id="noteMaps">Di Google Maps, buka lokasi usaha, tekan Bagikan, lalu tempel tautannya di sini.</span>
        </div>
        </fieldset>
        <fieldset className="psect">
        <legend className="psect-title">Foto</legend>
        <div className="pfield">
          <span className="plabel">Foto utama <span className="popsi">(opsional)</span></span>
          <div className="pfoto-row">
            {f.foto ? (
              <img className="pfoto-prev" src={f.foto} alt="Pratinjau foto usaha" width={88} height={88} />
            ) : (
              <span className="pfoto-prev pfoto-empty"><HugeiconsIcon icon={Image01Icon} size={28} aria-hidden="true" /></span>
            )}
            <div className="pfoto-acts">
              <PilihFile className="pbtn-ghost pfoto-btn" onPilih={pilihFoto}>
                {f.foto ? "Ganti foto" : "Pilih foto"}
              </PilihFile>
              {f.foto && (
                <button type="button" className="pbtn-danger" onClick={() => setF({ ...f, foto: "" })}>Hapus foto</button>
              )}
            </div>
          </div>
          <span className="pfoto-note">Ukuran foto dikecilkan otomatis jadi maksimal 400px.</span>
        </div>
        <div className="pfield">
          <span className="plabel">Galeri <span className="popsi">({f.galeri.length} dari {MAKS_GALERI})</span></span>
          <div className="pgal">
            {f.galeri.map((src, i) => (
              <div key={i} className="pgal-item">
                <img src={src} alt={"Foto galeri " + (i + 1)} />
                <button type="button" className="pgal-del" aria-label={"Hapus foto galeri " + (i + 1)} onClick={() => hapusGaleri(i)}>
                  <HugeiconsIcon icon={Cancel01Icon} size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
            {f.galeri.length < MAKS_GALERI && (
              <PilihFile className="pgal-add" multiple onPilih={tambahGaleri} ariaLabel="Tambah foto galeri">
                <HugeiconsIcon icon={Add01Icon} size={20} aria-hidden="true" />
                Tambah
              </PilihFile>
            )}
          </div>
          <span className="pfoto-note">Muncul sebagai slide foto di halaman detail usaha (maksimal 1000px).</span>
        </div>
        </fieldset>
        <fieldset className="psect">
        <legend className="psect-title">Katalog produk</legend>
        <div className="pfield">
          <span className="plabel">Produk <span className="popsi">({f.katalog.length} dari {MAKS_PRODUK})</span></span>
          <label className="pkat-switch">
            <input type="checkbox" checked={f.produk_aktif} onChange={(e) => setF({ ...f, produk_aktif: e.target.checked })} />
            <span>Tampilkan katalog di halaman detail</span>
          </label>
          <div className="pkat-list">
            {f.katalog.map((p, i) => (
              <div key={i} className={"pkat-item" + (errProduk === i ? " salah" : "")}>
                <PilihFile className="pkat-foto" onPilih={(e) => fotoProduk(i, e)} ariaLabel={(p.foto ? "Ganti" : "Pilih") + " foto produk " + (i + 1)}>
                  {p.foto ? <img src={p.foto} alt="" /> : <span aria-hidden="true">+ Foto</span>}
                </PilihFile>
                <div className="pkat-fields">
                  <input
                    id={"fProduk" + i} className="input" value={p.nama} placeholder="Nama produk" maxLength={80}
                    aria-label={"Nama produk " + (i + 1)}
                    aria-invalid={errProduk === i ? true : undefined}
                    aria-describedby={errProduk === i ? "errProduk" : undefined}
                    onChange={(e) => { ubahProduk(i, "nama", e.target.value); if (errProduk === i && e.target.value.trim()) setErrProduk(-1); }}
                  />
                  <input className="input" type="number" inputMode="numeric" min="0" step="500" value={p.harga} onChange={(e) => ubahProduk(i, "harga", e.target.value)} placeholder="Harga (Rp, opsional)" aria-label={"Harga produk " + (i + 1)} />
                  <input className="input pkat-ket" value={p.keterangan} onChange={(e) => ubahProduk(i, "keterangan", e.target.value)} placeholder="Keterangan singkat (opsional)" aria-label={"Keterangan produk " + (i + 1)} maxLength={300} />
                  {errProduk === i && (
                    <span className="pfield-err pkat-ket" id="errProduk" role="alert">Produk nomor {i + 1} belum diberi nama. Isi namanya atau hapus produk ini.</span>
                  )}
                </div>
                <div className="pkat-acts">
                  {p.foto && <button type="button" className="pbtn-ghost pkat-mini" onClick={() => ubahProduk(i, "foto", "")}>Hapus foto</button>}
                  <button type="button" className="pgal-del pkat-del" aria-label={"Hapus produk " + (i + 1)} onClick={() => hapusProduk(i)}>
                    <HugeiconsIcon icon={Cancel01Icon} size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {f.katalog.length < MAKS_PRODUK && (
            <button type="button" className="pbtn-ghost pkat-add" onClick={tambahProduk}>
              <HugeiconsIcon icon={Add01Icon} size={18} aria-hidden="true" />
              Tambah produk
            </button>
          )}
          <span className="pfoto-note">
            {f.produk_aktif ? "Pengunjung bisa melihat daftar produk ini." : "Produk tetap tersimpan, tapi pengunjung hanya melihat tulisan bahwa katalog belum aktif."}
          </span>
        </div>
        </fieldset>
        <div className="pmodal-actions psticky">
          <button type="button" className="pbtn-ghost" onClick={tutup} disabled={sibuk}>Batal</button>
          <button type="submit" className="pbtn-primary pbtn-lebar" disabled={sibuk}>
            {sibuk && <span className="pbtn-spin" aria-hidden="true" />}
            {sibuk ? "Menyimpan..." : awal ? "Simpan perubahan" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Konfirmasi hapus ---------- */
export function HapusModal({ umkm: d, jmlIuran, onHapus, onClose }) {
  const [sibuk, setSibuk] = useState(false);
  async function hapus() {
    setSibuk(true);
    const ok = await onHapus();
    if (!ok) setSibuk(false);
  }
  return (
    <Modal title="Hapus UMKM?" onClose={() => { if (!sibuk) onClose(); }} className="small">
      <p className="phapus-txt">
        <b>{d.nama}</b> akan dihapus dari direktori.
        {jmlIuran > 0 && <> Sebanyak <b>{jmlIuran} catatan iuran</b> milik usaha ini juga ikut terhapus.</>}
        {" "}Tindakan ini tidak bisa dibatalkan.
      </p>
      <div className="pmodal-actions">
        <button type="button" className="pbtn-ghost" onClick={onClose} data-autofocus disabled={sibuk}>Batal</button>
        <button type="button" className="pbtn-danger pbtn-danger-solid" onClick={hapus} disabled={sibuk}>
          {sibuk && <span className="pbtn-spin" aria-hidden="true" />}
          {sibuk ? "Menghapus..." : "Ya, hapus"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Bayar iuran ---------- */
export function IuranModal({ paying, nilaiAwal, onSimpan, onHapus, onClose }) {
  const [nominal, setNominal] = useState(nilaiAwal > 0 ? nilaiAwal : 10000);
  const [sibuk, setSibuk] = useState(""); /* "", "simpan", atau "hapus" */
  const [err, setErr] = useState("");

  async function jalankan(jenis, fn) {
    if (sibuk) return;
    setSibuk(jenis);
    const ok = await fn();
    if (!ok) setSibuk("");
  }
  function simpan(e) {
    e.preventDefault();
    const v = Math.max(0, Number(nominal) || 0);
    if (v <= 0) {
      setErr(nilaiAwal > 0
        ? "Isi nominal lebih dari 0. Untuk membatalkan pembayaran, pakai tombol Hapus catatan."
        : "Isi nominal lebih dari 0.");
      document.getElementById("fNominal")?.focus();
      return;
    }
    jalankan("simpan", () => onSimpan(v));
  }

  return (
    <Modal title={nilaiAwal > 0 ? "Ubah iuran" : "Catat iuran"} onClose={() => { if (!sibuk) onClose(); }} className="small">
      <div className="pinfo-box">
        <div className="nama">{paying.nama}</div>
        <div className="bulan">{paying.bulanTeks}</div>
      </div>
      <form className="pform" onSubmit={simpan} noValidate aria-busy={!!sibuk}>
      <div className="pfield">
        <label className="plabel" htmlFor="fNominal">Nominal (Rp)</label>
        <div className="pnominal" role="group" aria-label="Nominal cepat">
          {NOMINAL_CEPAT.map((n) => (
            <button
              key={n} type="button"
              className={"pchip" + (Number(nominal) === n ? " aktif" : "")}
              aria-pressed={Number(nominal) === n}
              onClick={() => { setNominal(n); setErr(""); }}
            >
              {n.toLocaleString("id-ID")}
            </button>
          ))}
        </div>
        <input
          id="fNominal" className="input" type="number" inputMode="numeric" min={0} step={500}
          value={nominal}
          onChange={(e) => { setNominal(e.target.value); setErr(""); }}
          onFocus={(e) => e.target.select()}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? "errNominal" : undefined}
          data-autofocus
        />
        {err && <span className="pfield-err" id="errNominal" role="alert">{err}</span>}
      </div>
      <div className="pmodal-actions">
        {nilaiAwal > 0 && (
          <button type="button" className="pbtn-danger pkiri" disabled={!!sibuk} onClick={() => jalankan("hapus", onHapus)}>
            {sibuk === "hapus" ? "Menghapus..." : "Hapus catatan"}
          </button>
        )}
        <button type="button" className="pbtn-ghost" onClick={onClose} disabled={!!sibuk}>Batal</button>
        <button type="submit" className="pbtn-primary pbtn-lebar" disabled={!!sibuk}>
          {sibuk === "simpan" && <span className="pbtn-spin" aria-hidden="true" />}
          {sibuk === "simpan" ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
      </form>
    </Modal>
  );
}
