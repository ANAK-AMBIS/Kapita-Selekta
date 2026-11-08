/* Footer halaman publik (beranda & detail UMKM) */
export default function PublicFooter() {
  return (
    <footer id="tentang" className="pub-foot" style={{ "--hero-bg": "url(/img/hero-bg.jpg)" }}>
      <div className="container pub-foot-in">
        <div className="foot-brand">
          <img className="foot-logo" src="/img/logo-wayhuwi.gif" alt="" width={52} height={52} />
          <div>
            <span className="pub-brand">UMKM Way Huwi</span>
            <span className="pub-brand-sub">Dusun 6 - Desa Way Huwi</span>
          </div>
        </div>
        <p className="pub-foot-desc">
          Direktori usaha milik warga Dusun 6, Desa Way Huwi, Kecamatan Jati Agung, Kabupaten Lampung Selatan.
        </p>
      </div>
      <div className="container pub-foot-bottom">
        &copy; {new Date().getFullYear()} UMKM Way Huwi
      </div>
    </footer>
  );
}
