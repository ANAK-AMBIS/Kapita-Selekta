"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

const FOKUSABEL = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

/* Kerangka modal: tutup lewat klik latar, tombol ✕, atau Esc.
   Fokus dikunci di dalam modal (Tab tidak keluar ke halaman di belakang),
   halaman dikunci dari scroll, dan fokus dikembalikan saat modal ditutup. */
export default function Modal({ title, onClose, className = "", children, hideHead = false }) {
  const kartu = useRef(null);
  const tutup = useRef(onClose);
  tutup.current = onClose;
  /* dicatat saat render pertama, sebelum fokus pindah ke dalam modal */
  const pembuka = useRef(typeof document !== "undefined" ? document.activeElement : null);

  useEffect(() => {
    const asal = pembuka.current;
    const onKey = (e) => {
      if (e.key === "Escape") { tutup.current(); return; }
      if (e.key !== "Tab" || !kartu.current) return;
      const el = [...kartu.current.querySelectorAll(FOKUSABEL)].filter((x) => x.offsetParent !== null);
      if (el.length === 0) return;
      const pertama = el[0], terakhir = el[el.length - 1];
      if (e.shiftKey && (document.activeElement === pertama || document.activeElement === kartu.current)) {
        e.preventDefault(); terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault(); pertama.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /* fokus awal: elemen bertanda data-autofocus, atau kartu modal itu sendiri */
    if (kartu.current) (kartu.current.querySelector("[data-autofocus]") || kartu.current).focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (asal && asal.focus) asal.focus();
    };
  }, []);

  return (
    <div className="pmodal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={kartu} tabIndex={-1} className={"pmodal-card " + className} role="dialog" aria-modal="true" aria-label={title}>
        {!hideHead && (
          <div className="pmodal-head">
            <h2 className="pmodal-title">{title}</h2>
            <button type="button" className="pico-btn" aria-label="Tutup" onClick={onClose}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
