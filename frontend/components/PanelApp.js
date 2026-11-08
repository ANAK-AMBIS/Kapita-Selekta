"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PANEL_SEED, IURAN_SEED } from "@/data/umkm";
import { RTS, SESS_KEY, DATA_KEY, IURAN_KEY, ADMIN_USER, loadLS } from "@/lib/umkm";
import PanelNav from "./panel/PanelNav";
import KelolaTab from "./panel/KelolaTab";
import IuranTab from "./panel/IuranTab";
import { DetailModal, UmkmFormModal, HapusModal, IuranModal } from "./panel/Modals";

/* ============================================================
   Panel Admin — Kelola Data + Iuran Bulanan
   Frontend-only: state React + localStorage (backend menyusul)
   ============================================================ */

export default function PanelApp() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [user, setUser] = useState(ADMIN_USER);

  const [data, setData] = useState(PANEL_SEED);
  const [iuran, setIuran] = useState(IURAN_SEED);

  const [tab, setTab] = useState("kelola");
  const [rtKelola, setRtKelola] = useState("Semua");

  /* modal yang sedang terbuka */
  const [detailId, setDetailId] = useState(null);
  const [form, setForm] = useState(null); /* { id: null | number } */
  const [hapusId, setHapusId] = useState(null);
  const [paying, setPaying] = useState(null); /* { key, nama, bulanTeks } */

  /* cek sesi + muat data dari localStorage saat mount (hindari hydration mismatch) */
  useEffect(() => {
    const sesi = window.localStorage.getItem(SESS_KEY);
    if (!sesi) { router.replace("/loginadmin"); return; }
    setUser(sesi === "1" ? ADMIN_USER : sesi);

    const d = loadLS(DATA_KEY, null);
    if (Array.isArray(d) && d.length > 0) {
      /* migrasi nama kategori lama → baru */
      setData(d.map((x) => ({ ...x, kategori: x.kategori === "Perdagangan" ? "Sembako" : x.kategori })));
    }
    const i = loadLS(IURAN_KEY, null);
    if (i && typeof i === "object" && !Array.isArray(i)) setIuran(i);
    setSiap(true);
  }, [router]);

  /* simpan setiap perubahan */
  useEffect(() => {
    if (siap) window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data, siap]);
  useEffect(() => {
    if (siap) window.localStorage.setItem(IURAN_KEY, JSON.stringify(iuran));
  }, [iuran, siap]);

  if (!siap) return null;

  const cari = (id) => data.find((x) => x.id === id);

  function keluar() {
    window.localStorage.removeItem(SESS_KEY);
    router.replace("/");
  }

  function simpanUmkm(isi) {
    if (form.id === null) {
      const id = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1;
      setData([{ id, ...isi }, ...data]);
    } else {
      setData(data.map((d) => (d.id === form.id ? { ...d, ...isi } : d)));
    }
    setForm(null);
  }

  function hapusUmkm(id) {
    setData(data.filter((x) => x.id !== id));
    setIuran(Object.fromEntries(Object.entries(iuran).filter(([k]) => k.split("|")[0] !== String(id))));
    setHapusId(null);
  }

  function setNilaiIuran(key, v) {
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
