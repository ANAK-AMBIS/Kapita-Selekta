"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RTS } from "@/lib/umkm";
import { api } from "@/lib/api";
import PanelNav from "./panel/PanelNav";
import KelolaTab from "./panel/KelolaTab";
import IuranTab from "./panel/IuranTab";
import { DetailModal, UmkmFormModal, HapusModal, IuranModal } from "./panel/Modals";

/* ============================================================
   Panel Admin - Kelola Data + Iuran Bulanan
   Data dari API (/api/umkm, /api/iuran), sesi via cookie (/api/auth)
   ============================================================ */

export default function PanelApp() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [user, setUser] = useState("");
  const [galat, setGalat] = useState("");

  const [data, setData] = useState([]);
  const [iuran, setIuran] = useState({});

  const [tab, setTab] = useState("kelola");
  const [rtKelola, setRtKelola] = useState("Semua");

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
        else { setGalat(err.message); setSiap(true); }
      }
    })();
    return () => { batal = true; };
  }, [router]);

  /* jalankan aksi ke server; tampilkan pesan bila gagal (sesi habis → ke login) */
  async function aksi(fn) {
    setGalat("");
    try {
      return await fn();
    } catch (err) {
      if (err.status === 401) router.replace("/loginadmin");
      else setGalat(err.message);
      return undefined;
    }
  }

  if (!siap) return null;

  const cari = (id) => data.find((x) => x.id === id);

  async function keluar() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/");
  }

  async function simpanUmkm(isi) {
    const id = form.id;
    const row = await aksi(() =>
      id === null ? api("/umkm", { method: "POST", body: isi }) : api("/umkm/" + id, { method: "PUT", body: isi })
    );
    if (!row) return;
    setData((prev) => (id === null ? [row, ...prev] : prev.map((d) => (d.id === id ? row : d))));
    setForm(null);
  }

  async function hapusUmkm(id) {
    const ok = await aksi(() => api("/umkm/" + id, { method: "DELETE" }));
    if (!ok) return;
    setData((prev) => prev.filter((x) => x.id !== id));
    setIuran((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k.split("|")[0] !== String(id))));
    setHapusId(null);
  }

  async function setNilaiIuran(key, v) {
    const [umkmId, bulan] = key.split("|");
    const ok = await aksi(() => api("/iuran", { method: "PUT", body: { umkmId: Number(umkmId), bulan, nominal: v > 0 ? v : 0 } }));
    if (!ok) return;
    setIuran((prev) => {
      const nxt = { ...prev };
      if (v > 0) nxt[key] = v; else delete nxt[key];
      return nxt;
    });
    setPaying(null);
  }

  const jmlIuranOf = (id) => Object.keys(iuran).filter((k) => k.split("|")[0] === String(id)).length;

  return (
    <div className="pwrap">
      <PanelNav tab={tab} setTab={setTab} user={user} onKeluar={keluar} />

      <main className="pmain">
        {galat && <div className="auth-error panel-galat" role="alert">{galat}</div>}
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
    </div>
  );
}
