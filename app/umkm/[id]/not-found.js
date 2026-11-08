import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function NotFound() {
  return (
    <div className="pwrap pub-page umkm-page">
      <PublicNavbar variant="solid" />
      <main className="container umkm-main">
        <div className="umkm-missing">
          <h1 className="section-title">UMKM tidak ditemukan</h1>
          <p className="section-sub">Data usaha ini mungkin sudah dihapus atau tautannya salah.</p>
          <Link href="/#direktori" className="pub-cta">Lihat Daftar UMKM</Link>
        </div>
      </main>
    </div>
  );
}
