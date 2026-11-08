"use client";

import { useState } from "react";
import { KATEGORI, KATEGORI_META } from "@/data/umkm";
import { RTS, gradClass } from "@/lib/umkm";
import Modal from "./Modal";

/* ---------- Detail UMKM ---------- */
export function DetailModal({ umkm: d, onClose, onUbah }) {
  const meta = KATEGORI_META[d.kategori] || KATEGORI_META.Lainnya;
  return (
    <Modal title={d.nama} onClose={onClose} className="pdet" hideHead>
      {d.foto ? (
        <img className="pdet-foto" src={d.foto} alt={d.nama} />
      ) : (
        <div className={"pdet-foto pdet-foto-grad " + gradClass(d.kategori, KATEGORI)}>
          <span>{meta.emoji}</span>
        </div>
      )}
      <div className="pmodal-head">
        <h2 className="pmodal-title">{d.nama}</h2>
        <button className="pico-btn" aria-label="Tutup" onClick={onClose}>&#10005;</button>
      </div>
      {d.pemilik && <p className="pdet-owner">{d.pemilik}</p>}
      <dl className="pdet-rows">
        <div><dt>Kategori</dt><dd>{d.kategori}</dd></div>
        <div><dt>RT</dt><dd>{d.rt || "—"}</dd></div>
        <div><dt>Alamat usaha</dt><dd>{d.lokasi || "—"}</dd></div>
      </dl>
      <div className="pmodal-actions">
        <button className="pbtn-ghost" onClick={onUbah}>&#9998; Ubah Data</button>
        <button className="pbtn-primary" onClick={onClose}>Tutup</button>
      </div>
    </Modal>
  );
}

/* ---------- Tambah / Ubah UMKM ---------- */

/* perkecil foto maks 400px supaya hemat di localStorage */
function kecilkanFoto(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new window.Image();
    img.onload = () => {
      const s = Math.min(1, 400 / Math.max(img.width, img.height));
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
    foto: awal?.foto || "",
  });
  const [err, setErr] = useState("");
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function pilihFoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; /* agar file sama bisa dipilih lagi */
    if (file) kecilkanFoto(file, (foto) => setF((prev) => ({ ...prev, foto })));
  }

  function submit(e) {
    e.preventDefault();
    if (!f.nama.trim()) {
      setErr("Nama usaha wajib diisi. Nama pemilik opsional.");
      return;
    }
    onSimpan({
      nama: f.nama.trim(), pemilik: f.pemilik.trim(), kategori: f.kategori,
      rt: f.rt, lokasi: f.lokasi.trim(), foto: f.foto || null,
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
          <span className="pfoto-note">Foto otomatis dikecilkan (maks 400px) untuk disimpan lokal.</span>
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
