"use client";

import { useState } from "react";
import Modal from "./Modal";
import Pilihan from "./Pilihan";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, WhatsappIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

const USER_RE = /^[a-z0-9._-]{3,32}$/;
const MIN_PASS = 8;

/* sandi acak yang mudah disalin lewat WhatsApp (tanpa karakter mirip) */
function acakSandi(panjang = 12) {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint32Array(panjang);
  window.crypto.getRandomValues(buf);
  return Array.from(buf, (n) => abc[n % abc.length]).join("");
}

function teksWhatsapp(nama, username, password) {
  const asal = typeof window !== "undefined" ? window.location.origin : "";
  return (
    "Halo, akun panel UMKM Way Huwi untuk " + nama + " sudah dibuat.\n\n" +
    "Nama pengguna: " + username + "\n" +
    "Kata sandi: " + password + "\n" +
    "Masuk di: " + asal + "/loginadmin\n\n" +
    "Setelah masuk, segera ganti kata sandi lewat menu \"UMKM Saya\"."
  );
}

/* kartu ringkasan kredensial: ditampilkan sekali setelah akun dibuat / sandi direset */
function Kredensial({ nama, username, password, onSelesai }) {
  const [tersalin, setTersalin] = useState("");

  async function salin(jenis, teks) {
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(jenis);
      setTimeout(() => setTersalin(""), 2000);
    } catch {
      setTersalin("");
    }
  }

  return (
    <div className="pform">
      <div className="pinfo-box pakun-ok">
        <div className="nama">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} aria-hidden="true" />
          Akun siap dipakai
        </div>
        <div className="bulan">{nama}</div>
      </div>

      <p className="pfoto-note">
        Kirim kredensial ini ke pemilik usaha. Kata sandi hanya ditampilkan sekali di layar ini.
      </p>

      <dl className="pdata-list pakun-kred">
        <div>
          <dt>Nama pengguna</dt>
          <dd><code>{username}</code></dd>
        </div>
        <div>
          <dt>Kata sandi</dt>
          <dd><code>{password}</code></dd>
        </div>
      </dl>

      <div className="pakun-salin">
        <button
          type="button"
          className="pbtn-ghost"
          onClick={() => salin("kredensial", "Nama pengguna: " + username + "\nKata sandi: " + password)}
        >
          <HugeiconsIcon icon={Copy01Icon} size={18} aria-hidden="true" />
          {tersalin === "kredensial" ? "Tersalin" : "Salin kredensial"}
        </button>
        <a
          className="pbtn-primary"
          href={"https://wa.me/?text=" + encodeURIComponent(teksWhatsapp(nama, username, password))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HugeiconsIcon icon={WhatsappIcon} size={18} aria-hidden="true" />
          Kirim via WhatsApp
        </a>
      </div>

      <div className="pmodal-actions">
        <button type="button" className="pbtn-primary pbtn-lebar" onClick={onSelesai} data-autofocus>
          Selesai
        </button>
      </div>
    </div>
  );
}

/* ---------- Buat akun baru untuk satu UMKM ---------- */
export function AkunBuatModal({ daftarUmkm, awalUmkmId, onSimpan, onClose }) {
  const [umkmId, setUmkmId] = useState(awalUmkmId || daftarUmkm[0]?.id || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tampilSandi, setTampilSandi] = useState(true);
  const [err, setErr] = useState({});
  const [sibuk, setSibuk] = useState(false);
  const [selesai, setSelesai] = useState(null);

  const namaTerpilih = daftarUmkm.find((u) => u.id === Number(umkmId))?.nama || "";

  async function submit(e) {
    e.preventDefault();
    if (sibuk) return;
    const salah = {};
    if (!umkmId) salah.umkm = "Pilih UMKM dulu.";
    if (!USER_RE.test(username)) salah.username = "3–32 karakter, hanya huruf kecil, angka, titik, garis bawah, atau tanda hubung.";
    if (password.length < MIN_PASS) salah.password = "Minimal " + MIN_PASS + " karakter.";
    setErr(salah);
    if (Object.keys(salah).length) return;

    setSibuk(true);
    const ok = await onSimpan({ umkmId: Number(umkmId), username, password });
    setSibuk(false);
    if (ok) setSelesai({ nama: namaTerpilih, username, password });
  }

  if (selesai) {
    return (
      <Modal title="Akun UMKM dibuat" onClose={onClose} className="small">
        <Kredensial {...selesai} onSelesai={onClose} />
      </Modal>
    );
  }

  if (!daftarUmkm.length) {
    return (
      <Modal title="Buatkan akun UMKM" onClose={onClose} className="small">
        <p className="phapus-txt">Semua UMKM di direktori sudah punya akun. Hapus akun lama dulu bila ingin membuat ulang.</p>
        <div className="pmodal-actions">
          <button type="button" className="pbtn-primary" onClick={onClose} data-autofocus>Selesai</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Buatkan akun UMKM" onClose={onClose} className="small">
      <form className="pform" onSubmit={submit} noValidate aria-busy={sibuk}>
        <div className="pfield">
          <span className="plabel" id="lblAkunUmkm">UMKM</span>
          <Pilihan
            id="fAkunUmkm" labelId="lblAkunUmkm" value={umkmId}
            options={daftarUmkm.map((u) => ({ value: u.id, label: u.nama }))}
            onChange={setUmkmId}
          />
          {err.umkm && <span className="pfield-err" role="alert">{err.umkm}</span>}
        </div>

        <div className="pfield">
          <label className="plabel" htmlFor="fAkunUser">Nama pengguna</label>
          <input
            id="fAkunUser" className="input" value={username} autoComplete="off" spellCheck={false}
            placeholder="contoh: warungbusari" data-autofocus
            onChange={(e) => { setUsername(e.target.value.toLowerCase()); if (err.username) setErr({ ...err, username: "" }); }}
            aria-invalid={err.username ? true : undefined}
          />
          <span className="pfoto-note">Dipakai untuk masuk. Huruf kecil, tanpa spasi.</span>
          {err.username && <span className="pfield-err" role="alert">{err.username}</span>}
        </div>

        <div className="pfield">
          <label className="plabel" htmlFor="fAkunPass">Kata sandi</label>
          <div className="pakun-passrow">
            <input
              id="fAkunPass" className="input" type={tampilSandi ? "text" : "password"} value={password}
              autoComplete="new-password" spellCheck={false}
              onChange={(e) => { setPassword(e.target.value); if (err.password) setErr({ ...err, password: "" }); }}
              aria-invalid={err.password ? true : undefined}
            />
            <button type="button" className="pbtn-ghost pakun-mini" onClick={() => setPassword(acakSandi())}>
              Acak
            </button>
          </div>
          <label className="pkat-switch">
            <input type="checkbox" checked={tampilSandi} onChange={(e) => setTampilSandi(e.target.checked)} />
            <span>Tampilkan kata sandi</span>
          </label>
          {err.password && <span className="pfield-err" role="alert">{err.password}</span>}
        </div>

        <div className="pmodal-actions">
          <button type="button" className="pbtn-ghost" onClick={onClose} disabled={sibuk}>Batal</button>
          <button type="submit" className="pbtn-primary pbtn-lebar" disabled={sibuk}>
            {sibuk && <span className="pbtn-spin" aria-hidden="true" />}
            {sibuk ? "Membuat..." : "Buat akun"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Reset kata sandi ---------- */
export function AkunResetModal({ akun, onSimpan, onClose }) {
  const [password, setPassword] = useState("");
  const [ulang, setUlang] = useState("");
  const [err, setErr] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [selesai, setSelesai] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (sibuk) return;
    if (password.length < MIN_PASS) { setErr("Minimal " + MIN_PASS + " karakter."); return; }
    if (password !== ulang) { setErr("Ulangan kata sandi tidak sama."); return; }
    setErr("");
    setSibuk(true);
    const ok = await onSimpan(akun.id, password);
    setSibuk(false);
    if (ok) setSelesai(true);
  }

  if (selesai) {
    return (
      <Modal title="Kata sandi direset" onClose={onClose} className="small">
        <Kredensial nama={akun.nama_umkm} username={akun.username} password={password} onSelesai={onClose} />
      </Modal>
    );
  }

  return (
    <Modal title="Reset kata sandi" onClose={onClose} className="small">
      <form className="pform" onSubmit={submit} noValidate aria-busy={sibuk}>
        <div className="pinfo-box">
          <div className="nama">{akun.nama_umkm}</div>
          <div className="bulan">{akun.username}</div>
        </div>
        <p className="pfoto-note">Sesi yang sedang aktif milik akun ini akan langsung keluar setelah sandi direset.</p>

        <div className="pfield">
          <label className="plabel" htmlFor="fResetPass">Kata sandi baru</label>
          <div className="pakun-passrow">
            <input
              id="fResetPass" className="input" type="text" value={password} autoComplete="new-password"
              spellCheck={false} data-autofocus
              onChange={(e) => { setPassword(e.target.value); setErr(""); }}
              aria-invalid={err ? true : undefined}
            />
            <button type="button" className="pbtn-ghost pakun-mini" onClick={() => { setPassword(acakSandi()); setErr(""); }}>
              Acak
            </button>
          </div>
        </div>
        <div className="pfield">
          <label className="plabel" htmlFor="fResetPass2">Ulangi kata sandi baru</label>
          <input
            id="fResetPass2" className="input" type="text" value={ulang} autoComplete="new-password"
            spellCheck={false}
            onChange={(e) => { setUlang(e.target.value); setErr(""); }}
            aria-invalid={err ? true : undefined}
          />
          {err && <span className="pfield-err" role="alert">{err}</span>}
        </div>

        <div className="pmodal-actions">
          <button type="button" className="pbtn-ghost" onClick={onClose} disabled={sibuk}>Batal</button>
          <button type="submit" className="pbtn-primary pbtn-lebar" disabled={sibuk}>
            {sibuk && <span className="pbtn-spin" aria-hidden="true" />}
            {sibuk ? "Menyimpan..." : "Simpan sandi baru"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Hapus akun ---------- */
export function AkunHapusModal({ akun, onHapus, onClose }) {
  const [sibuk, setSibuk] = useState(false);
  async function hapus() {
    setSibuk(true);
    const ok = await onHapus(akun.id);
    if (!ok) setSibuk(false);
  }
  return (
    <Modal title="Hapus akun?" onClose={() => { if (!sibuk) onClose(); }} className="small">
      <p className="phapus-txt">
        Akun <b>{akun.username}</b> milik <b>{akun.nama_umkm}</b> akan dihapus. Data UMKM-nya tetap ada,
        dan pemilik usaha tidak bisa masuk lagi sampai dibuatkan akun baru.
      </p>
      <div className="pmodal-actions">
        <button type="button" className="pbtn-ghost" onClick={onClose} data-autofocus disabled={sibuk}>Batal</button>
        <button type="button" className="pbtn-danger pbtn-danger-solid" onClick={hapus} disabled={sibuk}>
          {sibuk && <span className="pbtn-spin" aria-hidden="true" />}
          {sibuk ? "Menghapus..." : "Ya, hapus akun"}
        </button>
      </div>
    </Modal>
  );
}
