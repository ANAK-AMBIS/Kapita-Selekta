"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Image01Icon } from "@hugeicons/core-free-icons";

/* Carousel foto galeri UMKM: geser (scroll-snap), tombol panah, titik indikator */
export default function GaleriCarousel({ foto = [], nama }) {
  const track = useRef(null);
  const [aktif, setAktif] = useState(0);

  /* slide aktif dihitung dari posisi geser (ujung kanan = slide terakhir) */
  function onScroll() {
    const el = track.current;
    const first = el && el.querySelector("[data-i]");
    if (!first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0);
    const diUjung = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setAktif(diUjung ? foto.length - 1 : Math.round(el.scrollLeft / step));
  }

  const ke = (i) => {
    const el = track.current;
    const idx = (i + foto.length) % foto.length;
    const slide = el && el.querySelector(`[data-i="${idx}"]`);
    if (!slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
    setAktif(idx);
  };

  if (foto.length === 0) {
    return (
      <div className="gal-empty">
        <HugeiconsIcon icon={Image01Icon} size={32} strokeWidth={1.5} aria-hidden="true" />
        <p>Belum ada foto untuk usaha ini.</p>
      </div>
    );
  }

  return (
    <div
      className="gal"
      role="region"
      aria-roledescription="carousel"
      aria-label={"Foto " + nama}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") ke(aktif - 1);
        if (e.key === "ArrowRight") ke(aktif + 1);
      }}
    >
      <div className="gal-track" ref={track} tabIndex={0} onScroll={onScroll}>
        {foto.map((src, i) => (
          <figure key={i} className="gal-slide" data-i={i} aria-label={`Foto ${i + 1} dari ${foto.length}`}>
            <img src={src} alt={`${nama} - foto ${i + 1}`} loading="lazy" />
          </figure>
        ))}
      </div>

      {foto.length > 1 && (
        <>
          <button className="gal-nav gal-prev" aria-label="Foto sebelumnya" onClick={() => ke(aktif - 1)}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button className="gal-nav gal-next" aria-label="Foto berikutnya" onClick={() => ke(aktif + 1)}>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <div className="gal-dots">
            {foto.map((_, i) => (
              <button
                key={i}
                className={"gal-dot" + (i === aktif ? " aktif" : "")}
                aria-label={"Ke foto " + (i + 1)}
                aria-current={i === aktif}
                onClick={() => ke(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
