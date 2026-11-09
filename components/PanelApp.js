"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RTS } from "@/lib/umkm";
import { api } from "@/lib/api";
import PanelNav from "./panel/PanelNav";
import KelolaTab from "./panel/KelolaTab";
import IuranTab from "./panel/IuranTab";
import { DetailModal, UmkmFormModal, HapusModal, IuranModal } from "./panel/Modals";
import { useIngat, bacaIngat, simpanIngat, hapusSemuaIngat } from "./panel/ingat";

/* ============================================================
   Panel Admin - Kelola Data + Iuran Bulanan
   Data dari API (/api/umkm, /api/iuran), sesi via cookie (/api/auth)
   ============================================================ */

export default function PanelApp() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [user, setUser] = useState("");
  const [galat, setGalat] = useState("");
  const [gagalMuat, setGagalMuat] = useState(false);
  const [pesan, setPesan] = useState(""); /* konfirmasi singkat setelah aksi berhasil */

  const [data, setData] = useState([]);
  const [iuran, setIuran] = useState({});

  /* posisi terakhir admin diingat di perangkat ini (lihat panel/ingat.js) */
  const [tab, setTab] = useIngat("tab", "kelola", (v) => v === "kelola" || v === "iuran");
  const [rtKelola, setRtKelola] = useIngat("kelola:rt", "Semua", (v) => v === "Semua" || RTS.includes(v));

  /* modal yang sedang terbuka */
  const [detailId, setDetailId] = useState(null);
  const [form, setForm] = useState(null); /* { id: null | number } */
  const [hapusId, setHapusId] = useState(null);
  const [paying, setPaying] = useState(null); /* { key, nama, bulanTeks } */

  /* cek sesi lalu muat data dari server */
  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const me = await api("/auth/me");
        const [d, i] = await Promise.all([api("/umkm"), api("/iuran")]);
        if (batal) return;
        setUser(me.user);
        setData(d.slice().reverse()); /* terbaru di atas */
        setIuran(i);
        setSiap(true);
      } catch (err) {
        if (batal) return;
        if (err.status === 401) router.replace("/loginadmin");
        else { setGalat(err.message); setGagalMuat(true); setSiap(true); }
      }
    })();
    return () => { batal = true; };
  }, [router]);

  /* posisi scroll diingat per tab: dipulihkan saat panel siap atau tab berganti */
  useEffect(() => {
    if (!siap) return;
    const kunci = "scroll:" + tab;
    const y = bacaIngat(kunci, 0, (v) => typeof v === "number" && v >= 0);
    /* setTimeout, bukan requestAnimationFrame: rAF berhenti saat tab tidak terlihat */
    /* "instant": html di globals.css memakai scroll-behavior smooth, pemulihan tidak perlu animasi */
    const pulih = setTimeout(() => window.scrollTo({ top: y, behavior: "instant" }), 0);
    let tunda = 0;
    const onScroll = () => {
      clearTimeout(tunda);
      tunda = setTimeout(() => simpanIngat(kunci, Math.round(window.scrollY)), 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(pulih);
      clearTimeout(tunda);
      window.removeEventListener("scroll", onScroll);
    };
  }, [siap, tab]);

  /* pesan berhasil hilang sendiri setelah 4 detik */
  useEffect(() => {
    if (!pesan) return;
    const t = setTimeout(() => setPesan(""), 4000);
    return () => clearTimeout(t);
  }, [pesan]);

  /* jalankan aksi ke server; tampilkan pesan bila gagal (sesi habis → ke login) */
  async function aksi(fn) {
    setGalat("");
    setPesan("");
    try {
      return await fn();
    } catch (err) {
      if (err.status === 401) router.replace("/loginadmin");
      else setGalat(err.message || "Gagal terhubung ke server. Periksa koneksi lalu coba lagi.");
      return undefined;
    }
  }

  if (!siap) {
    return (
      <div className="pwrap pmuat" role="status" aria-live="polite">
        <span className="pmuat-spin" aria-hidden="true" />
        <span>Memuat data panel...</span>
      </div>
    );
  }

  if (gagalMuat) {
    return (
      <div className="pwrap pmuat">
        <div className="pgagal" role="alert">
          <h1>Data panel gagal dimuat</h1>
          <p>{galat}</p>
          <p>Periksa koneksi internet, lalu muat ulang halaman.</p>
          <button type="button" className="pbtn-primary" onClick={() => window.location.reload()}>Muat ulang</button>
        </div>
      </div>
    );
  }

  const cari = (id) => data.find((x) => x.id === id);

  async function keluar() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    hapusSemuaIngat(); /* admin berikutnya di perangkat ini mulai dari awal */
    router.replace("/");
  }

  /* setiap handler mengembalikan true bila berhasil, agar modal tahu kapan berhenti "menyimpan" */
  async function simpanUmkm(isi) {
    const id = form.id;
    const row = await aksi(() =>
      id === null ? api("/umkm", { method: "POST", body: isi }) : api("/umkm/" + id, { method: "PUT", body: isi })
    );
    if (!row) return false;
    setData((prev) => (id === null ? [row, ...prev] : prev.map((d) => (d.id === id ? row : d))));
    setForm(null);
    setPesan(id === null ? row.nama + " ditambahkan." : "Perubahan " + row.nama + " disimpan.");
    return true;
  }

  async function hapusUmkm(id) {
    const nama = cari(id)?.nama || "UMKM";
    const ok = await aksi(() => api("/umkm/" + id, { method: "DELETE" }));
    if (!ok) return false;
    setData((prev) => prev.filter((x) => x.id !== id));
    setIuran((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k.split("|")[0] !== String(id))));
    setHapusId(null);
    setPesan(nama + " dihapus.");
    return true;
  }

  async function setNilaiIuran(key, v) {
    const [umkmId, bulan] = key.split("|");
    const ok = await aksi(() => api("/iuran", { method: "PUT", body: { umkmId: Number(umkmId), bulan, nominal: v > 0 ? v : 0 } }));
    if (!ok) return false;
    setIuran((prev) => {
      const nxt = { ...prev };
      if (v > 0) nxt[key] = v; else delete nxt[key];
      return nxt;
    });
    setPesan(v > 0 ? "Iuran " + paying.nama + " (" + paying.bulanTeks + ") disimpan." : "Catatan iuran dihapus.");
    setPaying(null);
    return true;
  }

  const jmlIuranOf = (id) => Object.keys(iuran).filter((k) => k.split("|")[0] === String(id)).length;

  return (
    <div className="pwrap">
      <a className="pskip" href="#konten">Lewati ke konten</a>
      <PanelNav tab={tab} setTab={setTab} user={user} onKeluar={keluar} />

      <main className="pmain" id="konten" tabIndex={-1}>
        {tab === "kelola" ? (
          <KelolaTab
            data={data}
            rtKelola={rtKelola}
            setRtKelola={setRtKelola}
            onTambah={() => setForm({ id: null })}
            onDetail={setDetailId}
            onUbah={(id) => setForm({ id })}
            onHapus={setHapusId}
          />
        ) : (
          <IuranTab
            data={data}
            iuran={iuran}
            onBukaIuran={(key, nama, bulanTeks) => setPaying({ key, nama, bulanTeks })}
          />
        )}
      </main>

      {detailId !== null && cari(detailId) && (
        <DetailModal
          umkm={cari(detailId)}
          onClose={() => setDetailId(null)}
          onUbah={() => { setForm({ id: detailId }); setDetailId(null); }}
        />
      )}

      {form && (
        <UmkmFormModal
          awal={form.id === null ? null : cari(form.id)}
          rtDefault={rtKelola === "Semua" ? RTS[0] : rtKelola}
          onSimpan={simpanUmkm}
          onClose={() => setForm(null)}
        />
      )}

      {hapusId !== null && cari(hapusId) && (
        <HapusModal
          umkm={cari(hapusId)}
          jmlIuran={jmlIuranOf(hapusId)}
          onHapus={() => hapusUmkm(hapusId)}
          onClose={() => setHapusId(null)}
        />
      )}

      {paying && (
        <IuranModal
          paying={paying}
          nilaiAwal={iuran[paying.key] || 0}
          onSimpan={(v) => setNilaiIuran(paying.key, v)}
          onHapus={() => setNilaiIuran(paying.key, 0)}
          onClose={() => setPaying(null)}
        />
      )}

      {/* notifikasi di atas modal, supaya galat saat menyimpan tetap terlihat */}
      <div className="pnotif">
        <div role="status" aria-live="polite">
          {pesan && <div className="pnotif-item ok">{pesan}</div>}
        </div>
        {galat && (
          <div className="pnotif-item gagal" role="alert">
            <span>{galat}</span>
            <button type="button" className="pnotif-x" onClick={() => setGalat("")}>Tutup</button>
          </div>
        )}
      </div>
    </div>
  );
}
