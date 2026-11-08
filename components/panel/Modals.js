"use client";

import { useState } from "react";
import { KATEGORI, KATEGORI_META } from "@/data/umkm";
import { RTS, gradClass } from "@/lib/umkm";
import Modal from "./Modal";

const MAKS_GALERI = 8;
const MAKS_PRODUK = 20;
import KategoriIcon from "@/components/KategoriIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

/* ---------- Detail UMKM ---------- */
export function DetailModal({ umkm: d, onClose, onUbah }) {
  const meta = KATEGORI_META[d.kategori] || KATEGORI_META.Lainnya;
  return (
    <Modal title={d.nama} onClose={onClose} className="pdet" hideHead>
      {d.foto ? (
        <img className="pdet-foto" src={d.foto} alt={d.nama} />
      ) : (
        <div className={"pdet-foto pdet-foto-grad " + gradClass(d.kategori, KATEGORI)}>
          <KategoriIcon kategori={d.kategori} size={72} strokeWidth={1.4} className="img-ico" />
        </div>
      )}
      <div className="pmodal-head">
        <h2 className="pmodal-title">{d.nama}</h2>
        <button className="pico-btn" aria-label="Tutup" onClick={onClose}><HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" /></button>
      </div>
      {d.pemilik && <p className="pdet-owner">{d.pemilik}</p>}
      <dl className="pdet-rows">
        <div><dt>Kategori</dt><dd>{d.kategori}</dd></div>
        <div><dt>RT</dt><dd>{d.rt || "-"}</dd></div>
        <div><dt>Alamat usaha</dt><dd>{d.lokasi || "-"}</dd></div>
      </dl>
      <div className="pmodal-actions">
        <button className="pbtn-ghost" onClick={onUbah}>&#9998; Ubah Data</button>
        <button className="pbtn-primary" onClick={onClose}>Tutup</button>
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

/* awal: data UMKM yang diubah, atau null untuk tambah baru */
export function UmkmFormModal({ awal, rtDefault, onSimpan, onClose }) {
  const [f, setF] = useState({
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
  });
  const [err, setErr] = useState("");
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });

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
    prev.katalog.length >= MAKS_PRODUK ? prev : { ...prev, katalog: [...prev.katalog, { nama: "", harga: "", keterangan: "", foto: "" }] }
  ));
  const hapusProduk = (i) => setF((prev) => ({ ...prev, katalog: prev.katalog.filter((_, j) => j !== i) }));
  function fotoProduk(i, e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file) kecilkanFoto(file, (foto) => ubahProduk(i, "foto", foto), 600);
  }

  const hapusGaleri = (i) => setF((prev) => ({ ...prev, galeri: prev.galeri.filter((_, j) => j !== i) }));

  function submit(e) {
    e.preventDefault();
    if (!f.nama.trim()) {
      setErr("Nama usaha wajib diisi. Nama pemilik opsional.");
      return;
    }
    if (f.katalog.some((p) => !p.nama.trim())) {
      setErr("Setiap produk di katalog wajib punya nama.");
      return;
    }
    onSimpan({
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
  }

  return (
    <Modal title={awal ? "Ubah UMKM" : "Tambah UMKM"} onClose={onClose}>
      <form onSubmit={submit} className="pform">
        <div className="pfield">
          <label className="plabel" htmlFor="fNama">Nama Usaha</label>
          <input id="fNama" className="input" value={f.nama} onChange={ubah("nama")} placeholder="Contoh: Warung Bu Sari" autoFocus />
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fPemilik">Nama Pemilik (opsional)</label>
          <input id="fPemilik" className="input" value={f.pemilik} onChange={ubah("pemilik")} placeholder="Contoh: Sari Wulandari" />
        </div>
        <div className="prow-2">
          <div className="pfield">
            <label className="plabel" htmlFor="fKategori">Kategori</label>
            <select id="fKategori" className="input" value={f.kategori} onChange={ubah("kategori")}>
              {KATEGORI.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="pfield">
            <label className="plabel" htmlFor="fRt">RT</label>
            <select id="fRt" className="input" value={f.rt} onChange={ubah("rt")}>
              {RTS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fLokasi">Lokasi (opsional)</label>
          <input id="fLokasi" className="input" value={f.lokasi} onChange={ubah("lokasi")} placeholder="Contoh: Jl. Raya Way Huwi" />
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fMaps">Link Google Maps (opsional)</label>
          <input id="fMaps" className="input" type="url" value={f.maps_url} onChange={ubah("maps_url")} placeholder="https://maps.app.goo.gl/..." />
          <span className="pfoto-note">Buka lokasi usaha di Google Maps, tekan Bagikan, lalu salin tautannya ke sini.</span>
        </div>
        <div className="pfield">
          <span className="plabel">Foto Usaha (opsional)</span>
          <div className="pfoto-row">
            {f.foto ? (
              <img className="pfoto-prev" src={f.foto} alt="Pratinjau foto usaha" />
            ) : (
              <span className="pfoto-prev pfoto-empty">Belum ada foto</span>
            )}
            <div className="pfoto-acts">
              <label className="pbtn-ghost pfoto-btn">
                Pilih Foto&hellip;
                <input type="file" accept="image/*" hidden onChange={pilihFoto} />
              </label>
              {f.foto && (
                <button type="button" className="pbtn-danger" onClick={() => setF({ ...f, foto: "" })}>Hapus Foto</button>
              )}
            </div>
          </div>
          <span className="pfoto-note">Foto otomatis dikecilkan (maks 400px).</span>
        </div>
        <div className="pfield">
          <span className="plabel">Galeri Foto ({f.galeri.length}/{MAKS_GALERI})</span>
          <div className="pgal">
            {f.galeri.map((src, i) => (
              <div key={i} className="pgal-item">
                <img src={src} alt={"Foto galeri " + (i + 1)} />
                <button type="button" className="pgal-del" aria-label={"Hapus foto " + (i + 1)} onClick={() => hapusGaleri(i)}>
                  <HugeiconsIcon icon={Cancel01Icon} size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
            {f.galeri.length < MAKS_GALERI && (
              <label className="pgal-add">
                <input type="file" accept="image/*" multiple hidden onChange={tambahGaleri} />
                + Tambah
              </label>
            )}
          </div>
          <span className="pfoto-note">Tampil sebagai carousel di halaman detail. Foto dikecilkan (maks 1000px).</span>
        </div>
        <div className="pfield">
          <span className="plabel">Katalog Produk ({f.katalog.length}/{MAKS_PRODUK})</span>
          <label className="pkat-switch">
            <input type="checkbox" checked={f.produk_aktif} onChange={(e) => setF({ ...f, produk_aktif: e.target.checked })} />
            <span>Aktifkan katalog produk di halaman detail</span>
          </label>
          <div className="pkat-list">
            {f.katalog.map((p, i) => (
              <div key={i} className="pkat-item">
                <label className="pkat-foto" title="Pilih foto produk">
                  {p.foto ? <img src={p.foto} alt={"Foto " + (p.nama || "produk")} /> : <span>+ Foto</span>}
                  <input type="file" accept="image/*" hidden onChange={(e) => fotoProduk(i, e)} />
                </label>
                <div className="pkat-fields">
                  <input className="input" value={p.nama} onChange={(e) => ubahProduk(i, "nama", e.target.value)} placeholder="Nama produk" aria-label="Nama produk" maxLength={80} />
                  <input className="input" type="number" min="0" step="500" value={p.harga} onChange={(e) => ubahProduk(i, "harga", e.target.value)} placeholder="Harga (Rp, opsional)" aria-label="Harga" />
                  <input className="input pkat-ket" value={p.keterangan} onChange={(e) => ubahProduk(i, "keterangan", e.target.value)} placeholder="Keterangan singkat (opsional)" aria-label="Keterangan" maxLength={300} />
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
            <button type="button" className="pbtn-ghost pkat-add" onClick={tambahProduk}>+ Tambah produk</button>
          )}
          <span className="pfoto-note">
            {f.produk_aktif ? "Katalog tampil di halaman detail." : "Katalog nonaktif: produk tetap tersimpan, tapi pengunjung hanya melihat keterangan bahwa katalog belum diaktifkan."}
          </span>
        </div>
        {err && <p className="perr">{err}</p>}
        <div className="pmodal-actions">
          <button type="button" className="pbtn-ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="pbtn-primary pbtn-lebar">Simpan</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Konfirmasi hapus ---------- */
export function HapusModal({ umkm: d, jmlIuran, onHapus, onClose }) {
  return (
    <Modal title="Hapus UMKM?" onClose={onClose} className="small">
      <p>
        <b>{d.nama}</b> akan dihapus dari direktori.
        {jmlIuran > 0 && <> Sebanyak <b>{jmlIuran} catatan iuran</b> milik usaha ini juga ikut terhapus.</>}
        {" "}Tindakan ini tidak bisa dibatalkan.
      </p>
      <div className="pmodal-actions">
        <button className="pbtn-ghost" onClick={onClose}>Batal</button>
        <button className="pbtn-danger" onClick={onHapus}>Ya, Hapus</button>
      </div>
    </Modal>
  );
}

/* ---------- Bayar iuran ---------- */
export function IuranModal({ paying, nilaiAwal, onSimpan, onHapus, onClose }) {
  const [nominal, setNominal] = useState(nilaiAwal > 0 ? nilaiAwal : 10000);
  return (
    <Modal title="Bayar Iuran" onClose={onClose} className="small">
      <div className="pinfo-box">
        <div className="nama">{paying.nama}</div>
        <div className="bulan">Iuran bulan {paying.bulanTeks}</div>
      </div>
      <div className="pfield">
        <label className="plabel" htmlFor="fNominal">Nominal (Rp)</label>
        <input
          id="fNominal" className="input" type="number" min={0} step={500}
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          onFocus={(e) => e.target.select()}
          autoFocus
        />
      </div>
      <div className="pmodal-actions">
        {nilaiAwal > 0 && <button className="pbtn-danger" onClick={onHapus}>Hapus Bayar</button>}
        <button className="pbtn-ghost" onClick={onClose}>Batal</button>
        <button className="pbtn-primary pbtn-lebar" onClick={() => onSimpan(Math.max(0, Number(nominal) || 0))}>
          Simpan
        </button>
      </div>
    </Modal>
  );
}
