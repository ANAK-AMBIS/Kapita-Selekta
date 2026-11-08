import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Clock01Icon,
  Home01Icon,
  PackageIcon,
  MapsLocation01Icon,
  WhatsappIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { KATEGORI } from "@/data/umkm";
import { gradClass } from "@/lib/umkm";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import JoinCta from "@/components/JoinCta";
import KategoriIcon from "@/components/KategoriIcon";
import UmkmCard from "@/components/UmkmCard";
import ShareButton from "@/components/ShareButton";
import LoveButton from "@/components/LoveButton";
import GaleriCarousel from "@/components/GaleriCarousel";

/* nomor lokal "0857-..." → "62857..." untuk tautan WhatsApp */
const nomorWa = (tel) => tel.replace(/[^0-9]/g, "").replace(/^0/, "62");

/* link Google Maps tersimpan, atau pencarian dari alamat usaha + wilayah desa */
const linkMaps = (d) =>
  d.maps_url ||
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent([d.nama, d.lokasi, "Way Huwi, Jati Agung, Lampung Selatan"].filter(Boolean).join(", "));

/* alamat + wilayah desa tanpa mengulang "Way Huwi" */
const alamatLengkap = (lokasi) =>
  /way\s*hu?wi/i.test(lokasi) ? lokasi + ", Jati Agung, Lampung Selatan" : lokasi + ", Way Huwi, Jati Agung, Lampung Selatan";

/* peta embed resmi Google Maps (tanpa API key): titik koordinat bila ada, selain itu pencarian */
const embedMaps = (d) => {
  const q = d.lat != null && d.lng != null
    ? d.lat + "," + d.lng
    : [d.nama, d.lokasi, "Way Huwi, Jati Agung, Lampung Selatan"].filter(Boolean).join(", ");
  return "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&z=17&hl=id&output=embed";
};

const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const Ico = ({ icon, size = 20 }) => <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} aria-hidden="true" />;

/* Halaman detail satu UMKM: /umkm/<id> (data diambil di server) */
export default function UmkmDetail({ umkm: d, lainnya = [], love = 0 }) {
  const info = [
    { icon: Location01Icon, label: "Alamat", value: d.lokasi },
    { icon: Home01Icon, label: "Wilayah", value: d.rt ? d.rt + ", Dusun 6" : null },
    { icon: Clock01Icon, label: "Jam buka", value: d.jam },
  ].filter((x) => x.value);
  const katalog = d.produk_aktif && Array.isArray(d.katalog) ? d.katalog : [];
  const linkWa = (pesan) => "https://wa.me/" + nomorWa(d.telepon) + "?text=" + encodeURIComponent(pesan);

  return (
    <div className="pwrap pub-page umkm-page">
      <PublicNavbar variant="solid" />

      <main className="container umkm-main">
        <nav className="umkm-crumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <Ico icon={ArrowRight01Icon} size={14} />
          <Link href="/#direktori">Direktori</Link>
          <Ico icon={ArrowRight01Icon} size={14} />
          <span aria-current="page">{d.nama}</span>
        </nav>

        <article className="umkm-detail">
          <div className="umkm-share">
            <LoveButton umkmId={d.id} initialCount={love} />
            <ShareButton title={d.nama + " - UMKM Way Huwi"} text={"Cek " + d.nama + " di direktori UMKM Way Huwi:"} />
          </div>
          <div className="umkm-media">
            {d.foto ? (
              <img className="umkm-foto" src={d.foto} alt={d.nama} />
            ) : (
              <div className={"umkm-foto pdet-foto-grad " + gradClass(d.kategori, KATEGORI)}>
                <KategoriIcon kategori={d.kategori} size={110} strokeWidth={1.3} className="img-ico" />
              </div>
            )}
          </div>

          <div className="umkm-info">
            <h1 className="umkm-title">{d.nama}</h1>
            {d.pemilik && <p className="umkm-owner">Pemilik: <b>{d.pemilik}</b></p>}

            {d.deskripsi && (
              <div className="umkm-about">
                <h2 className="umkm-about-title">Tentang usaha</h2>
                <p className="umkm-desc">{d.deskripsi}</p>
              </div>
            )}

            <div className="umkm-actions">
              {d.telepon && (
                <a className="umkm-btn umkm-btn-wa" href={"https://wa.me/" + nomorWa(d.telepon)} target="_blank" rel="noopener noreferrer">
                  <Ico icon={WhatsappIcon} /> Chat WhatsApp
                </a>
              )}
              <a className="umkm-btn umkm-btn-ghost" href={linkMaps(d)} target="_blank" rel="noopener noreferrer">
                <Ico icon={MapsLocation01Icon} /> Lihat di Google Maps
              </a>
            </div>
          </div>
        </article>

        <section className="umkm-produk">
          <div className="umkm-more-head">
            <h2 className="umkm-more-title">Produk</h2>
            {katalog.length > 0 && <span className="umkm-gal-n">{katalog.length} produk</span>}
          </div>
          {katalog.length > 0 ? (
            <div className="umkm-produk-grid">
              {katalog.map((p, i) => (
                <div key={i} className="umkm-produk-card">
                  {p.foto ? (
                    <img className="umkm-produk-foto" src={p.foto} alt={p.nama} loading="lazy" />
                  ) : (
                    <div className={"umkm-produk-foto pdet-foto-grad " + gradClass(d.kategori, KATEGORI)}>
                      <KategoriIcon kategori={d.kategori} size={56} strokeWidth={1.3} className="img-ico" />
                    </div>
                  )}
                  <div className="umkm-produk-body">
                    <h3 className="umkm-produk-nama">{p.nama}</h3>
                    <p className="umkm-produk-harga">{p.harga != null ? rupiah(p.harga) : "Tanya harga"}</p>
                    {p.keterangan && <p className="umkm-produk-ket">{p.keterangan}</p>}
                    {d.telepon && (
                      <a className="umkm-produk-wa" href={linkWa(`Halo ${d.nama}, saya mau pesan "${p.nama}".`)} target="_blank" rel="noopener noreferrer">
                        <Ico icon={WhatsappIcon} size={16} /> Pesan
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="umkm-produk-off">
              <span className="umkm-fact-ico"><Ico icon={PackageIcon} /></span>
              <div>
                <p className="umkm-produk-off-title">Katalog produk belum diaktifkan oleh penjual.</p>
                {d.produk && <p className="umkm-produk-off-txt">Menjual: <b>{d.produk}</b></p>}
                {d.telepon && <p className="umkm-produk-off-txt">Tanyakan produk dan harga langsung lewat WhatsApp.</p>}
              </div>
            </div>
          )}
        </section>

        <section className="umkm-galeri">
          <div className="umkm-more-head">
            <h2 className="umkm-more-title">Galeri foto</h2>
            {d.galeri?.length > 0 && <span className="umkm-gal-n">{d.galeri.length} foto</span>}
          </div>
          <GaleriCarousel foto={d.galeri || []} nama={d.nama} />
        </section>

        {info.length > 0 && (
          <section className="umkm-facts" aria-label="Informasi usaha">
            {info.map((x) => (
              <div key={x.label} className="umkm-fact">
                <span className="umkm-fact-ico"><Ico icon={x.icon} /></span>
                <div>
                  <span className="umkm-fact-lbl">{x.label}</span>
                  <span className="umkm-fact-val">{x.value}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="umkm-peta">
          <div className="umkm-more-head">
            <h2 className="umkm-more-title">Lokasi</h2>
            <a href={linkMaps(d)} className="umkm-more-all" target="_blank" rel="noopener noreferrer">
              Buka di Google Maps <Ico icon={ArrowRight01Icon} size={16} />
            </a>
          </div>
          <div className="umkm-peta-box">
            <iframe
              title={"Peta lokasi " + d.nama}
              src={embedMaps(d)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          {d.lokasi && (
            <p className="umkm-peta-alamat"><Ico icon={Location01Icon} size={16} /> {alamatLengkap(d.lokasi)}</p>
          )}
        </section>

        {lainnya.length > 0 && (
          <section className="umkm-more">
            <div className="umkm-more-head">
              <h2 className="umkm-more-title">UMKM Serupa</h2>
              <Link href="/#direktori" className="umkm-more-all">
                Lihat semua <Ico icon={ArrowRight01Icon} size={16} />
              </Link>
            </div>
            <div className="dir-grid">
              {lainnya.map((u) => <UmkmCard key={u.id} umkm={u} />)}
            </div>
          </section>
        )}

        <Link href="/#direktori" className="umkm-back">
          <Ico icon={ArrowLeft01Icon} size={16} /> Kembali ke direktori
        </Link>
      </main>

      <JoinCta
        title="Apakah ini usahamu?"
        desc="Hubungi pengurus Dusun 6 untuk memperbarui atau melengkapi informasi usaha ini, seperti foto, jam buka, dan nomor kontak."
        pesan={`Halo, saya pemilik usaha "${d.nama}" di direktori UMKM Way Huwi`}
      />

      <PublicFooter />
    </div>
  );
}
