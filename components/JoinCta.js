// Kotak ajakan menghubungi pengurus (landing & halaman detail). Ganti nomor WA di sini.
const WA = "6281234567890";

export default function JoinCta({ title, desc, pesan }) {
  return (
    <section className="pub-join">
      <div className="container">
        <div className="pub-join-box">
          <div>
            <h2 className="pub-join-title">{title}</h2>
            <p className="pub-join-desc">{desc}</p>
          </div>
          <a
            className="btn btn-lg pub-join-btn"
            href={`https://wa.me/${WA}?text=${encodeURIComponent(pesan)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
