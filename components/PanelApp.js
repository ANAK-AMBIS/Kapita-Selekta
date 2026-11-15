"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RTS } from "@/lib/umkm";
import { api } from "@/lib/api";
import PanelNav from "./panel/PanelNav";
import KelolaTab from "./panel/KelolaTab";
import IuranTab from "./panel/IuranTab";
import AkunTab from "./panel/AkunTab";
import UmkmSaya from "./panel/UmkmSaya";
import IuranSaya from "./panel/IuranSaya";
import { DetailModal, UmkmFormModal, HapusModal, IuranModal } from "./panel/Modals";
import { AkunBuatModal, AkunResetModal, AkunHapusModal } from "./panel/AkunModals";
import { useIngat, bacaIngat, simpanIngat, hapusSemuaIngat } from "./panel/ingat";

/* ============================================================
   Panel UMKM - dua role:
   - admin : Data UMKM + Iuran Bulanan + Akun UMKM
   - umkm  : UMKM Saya + Iuran Saya (hanya data miliknya sendiri)
   Data dari API (/api/umkm, /api/iuran, /api/akun), sesi via cookie.
   ============================================================ */

const TAB_ADMIN = ["kelola", "iuran", "akun"];
const TAB_UMKM = ["saya", "iuran-saya"];
const SEMUA_TAB = TAB_ADMIN.concat(TAB_UMKM);

const urutNama = (a, b) => (a.nama_umkm || "").localeCompare(b.nama_umkm || "", "id");

export default function PanelApp() {
  const router = useRouter();
  const [siap, setSiap] = useState(false);
  const [sesi, setSesi] = useState(null);
  const [galat, setGalat] = useState("");
  const [gagalMuat, setGagalMuat] = useState(false);
  const [pesan, setPesan] = useState(""); /* konfirmasi singkat setelah aksi berhasil */

  const [data, setData] = useState([]);
  const [iuran, setIuran] = useState({});
  const [akun, setAkun] = useState([]);

  /* posisi terakhir diingat di perangkat ini (lihat panel/ingat.js) */
  const [tab, setTab] = useIngat("tab", "kelola", (v) => SEMUA_TAB.includes(v));
  const [rtKelola, setRtKelola] = useIngat("kelola:rt", "Semua", (v) => v === "Semua" || RTS.includes(v));

  /* modal yang sedang terbuka */
  const [detailId, setDetailId] = useState(null);
  const [form, setForm] = useState(null); /* { id: null | number } */
  const [hapusId, setHapusId] = useState(null);
  const [paying, setPaying] = useState(null); /* { key, nama, bulanTeks } */
  const [akunBuat, setAkunBuat] = useState(null); /* { umkmId } | null */
  const [akunReset, setAkunReset] = useState(null); /* baris akun */
  const [akunHapus, setAkunHapus] = useState(null); /* baris akun */

  const admin = sesi?.role === "admin";
  const daftarTab = sesi?.role === "umkm" ? TAB_UMKM : TAB_ADMIN;
  const tabAktif = daftarTab.includes(tab) ? tab : daftarTab[0];

  /* cek sesi lalu muat data dari server */
  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const me = await api("/auth/me");
        let d, i, a = [];
        if (me.role === "admin") {
          const [du, di, da] = await Promise.all([api("/umkm"), api("/iuran"), api("/akun")]);
          d = du.slice().reverse(); /* terbaru di atas */
          i = di;
          a = da;
        } else {
          const [row, iur] = await Promise.all([api("/umkm/" + me.umkmId), api("/iuran/saya")]);
          d = [row];
          /* samakan bentuk kunci dengan admin: "<id>|<YYYY-MM>" */
          i = Object.fromEntries(Object.entries(iur).map(([bulan, nominal]) => [row.id + "|" + bulan, nominal]));
        }
        if (batal) return;
        setSesi(me);
        setData(d);
        setIuran(i);
        setAkun(a);
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
    const kunci = "scroll:" + tabAktif;
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
  }, [siap, tabAktif]);

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

  if (gagalMuat || !sesi) {
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

  /* akun UMKM yang data usahanya sudah dihapus admin */
  if (!admin && !data[0]) {
    return (
      <div className="pwrap pmuat">
        <div className="pgagal" role="alert">
          <h1>Data usaha tidak ditemukan</h1>
          <p>Data UMKM untuk akun ini sudah tidak ada. Hubungi admin desa untuk mendaftarkannya kembali.</p>
          <button type="button" className="pbtn-primary" onClick={keluar}>Keluar</button>
        </div>
      </div>
    );
  }

  const cari = (id) => data.find((x) => x.id === id);
  const akunByUmkm = new Map(akun.map((a) => [a.umkm_id, a]));
  const daftarUmkmTanpaAkun = data
    .filter((d) => !akunByUmkm.has(d.id))
    .map((d) => ({ id: d.id, nama: d.nama }))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  async function keluar() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    hapusSemuaIngat(); /* pengguna berikutnya di perangkat ini mulai dari awal */
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
    setAkun((prev) => prev.filter((a) => a.umkm_id !== id)); /* akun ikut terhapus di database (cascade) */
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

  /* ---------- aksi akun UMKM (admin) ---------- */
  async function buatAkun(isi) {
    const row = await aksi(() => api("/akun", { method: "POST", body: isi }));
    if (!row) return false;
    setAkun((prev) => [...prev, row].sort(urutNama));
    setPesan("Akun untuk " + row.nama_umkm + " dibuat.");
    return true;
  }

  async function resetSandiAkun(id, password) {
    const row = await aksi(() => api("/akun/" + id, { method: "PUT", body: { password } }));
    if (!row) return false;
    setAkun((prev) => prev.map((a) => (a.id === row.id ? row : a)));
    setPesan("Kata sandi " + row.username + " direset.");
    return true;
  }

  async function toggleAkun(a) {
    const row = await aksi(() => api("/akun/" + a.id, { method: "PUT", body: { aktif: !a.aktif } }));
    if (!row) return false;
    setAkun((prev) => prev.map((x) => (x.id === row.id ? row : x)));
    setPesan("Akun " + row.username + (row.aktif ? " diaktifkan." : " dinonaktifkan."));
    return true;
  }

  async function hapusAkun(id) {
    const nama = akun.find((a) => a.id === id)?.username || "";
    const ok = await aksi(() => api("/akun/" + id, { method: "DELETE" }));
    if (!ok) return false;
    setAkun((prev) => prev.filter((a) => a.id !== id));
    setAkunHapus(null);
    setPesan("Akun " + nama + " dihapus.");
    return true;
  }

  /* ---------- ganti sandi sendiri (role umkm) ---------- */
  async function gantiSandi(lama, baru) {
    const ok = await aksi(() =>
      api("/auth/password", { method: "PATCH", body: { passwordLama: lama, passwordBaru: baru } })
    );
    if (!ok) return false;
    setPesan("Kata sandi diperbarui.");
    return true;
  }

  const jmlIuranOf = (id) => Object.keys(iuran).filter((k) => k.split("|")[0] === String(id)).length;
  const akunSaya = admin ? null : { username: sesi.user };

  return (
    <div className="pwrap">
      <a className="pskip" href="#konten">Lewati ke konten</a>
      <PanelNav tab={tabAktif} setTab={setTab} user={sesi.user} role={sesi.role} onKeluar={keluar} />

      <main className="pmain" id="konten" tabIndex={-1}>
        {admin ? (
          tabAktif === "kelola" ? (
            <KelolaTab
              data={data}
              rtKelola={rtKelola}
              setRtKelola={setRtKelola}
              akunByUmkm={akunByUmkm}
              onTambah={() => setForm({ id: null })}
              onDetail={setDetailId}
              onUbah={(id) => setForm({ id })}
              onHapus={setHapusId}
              onBuatAkun={(id) => setAkunBuat({ umkmId: id })}
            />
          ) : tabAktif === "iuran" ? (
            <IuranTab
              data={data}
              iuran={iuran}
              onBukaIuran={(key, nama, bulanTeks) => setPaying({ key, nama, bulanTeks })}
            />
          ) : (
            <AkunTab
              akun={akun}
              data={data}
              onBuat={(id) => setAkunBuat({ umkmId: id })}
              onReset={setAkunReset}
              onToggle={toggleAkun}
              onHapus={setAkunHapus}
            />
          )
        ) : tabAktif === "saya" ? (
          <UmkmSaya
            umkm={data[0]}
            akun={akunSaya}
            onUbah={() => setForm({ id: data[0].id })}
            onGantiSandi={gantiSandi}
          />
        ) : (
          <IuranSaya umkm={data[0]} iuran={iuran} />
        )}
      </main>

      {admin && detailId !== null && cari(detailId) && (
        <DetailModal
          umkm={cari(detailId)}
          akun={akunByUmkm.get(detailId) || null}
          onClose={() => setDetailId(null)}
          onUbah={() => { setForm({ id: detailId }); setDetailId(null); }}
          onBuatAkun={() => { setAkunBuat({ umkmId: detailId }); setDetailId(null); }}
        />
      )}

      {admin && form && (
        <UmkmFormModal
          awal={form.id === null ? null : cari(form.id)}
          rtDefault={rtKelola === "Semua" ? RTS[0] : rtKelola}
          onSimpan={simpanUmkm}
          onClose={() => setForm(null)}
        />
      )}

      {/* role umkm hanya bisa mengubah data usahanya sendiri, tanpa tombol tambah/hapus */}
      {!admin && form && data[0] && (
        <UmkmFormModal
          awal={data[0]}
          rtDefault={data[0].rt || RTS[0]}
          kunciRt
          onSimpan={simpanUmkm}
          onClose={() => setForm(null)}
        />
      )}

      {admin && hapusId !== null && cari(hapusId) && (
        <HapusModal
          umkm={cari(hapusId)}
          jmlIuran={jmlIuranOf(hapusId)}
          onHapus={() => hapusUmkm(hapusId)}
          onClose={() => setHapusId(null)}
        />
      )}

      {admin && paying && (
        <IuranModal
          paying={paying}
          nilaiAwal={iuran[paying.key] || 0}
          onSimpan={(v) => setNilaiIuran(paying.key, v)}
          onHapus={() => setNilaiIuran(paying.key, 0)}
          onClose={() => setPaying(null)}
        />
      )}

      {admin && akunBuat && (
        <AkunBuatModal
          daftarUmkm={daftarUmkmTanpaAkun}
          awalUmkmId={akunBuat.umkmId}
          onSimpan={buatAkun}
          onClose={() => setAkunBuat(null)}
        />
      )}

      {admin && akunReset && (
        <AkunResetModal akun={akunReset} onSimpan={resetSandiAkun} onClose={() => setAkunReset(null)} />
      )}

      {admin && akunHapus && (
        <AkunHapusModal akun={akunHapus} onHapus={hapusAkun} onClose={() => setAkunHapus(null)} />
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
