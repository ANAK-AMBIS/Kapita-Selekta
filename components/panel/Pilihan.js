"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

/* Dropdown panel (pengganti <select> bawaan browser).
   Keyboard: panah atas/bawah, Home/End, Enter/Spasi untuk memilih, Esc untuk menutup,
   ketik huruf awal untuk lompat ke pilihan. */
export default function Pilihan({ value, onChange, options, ariaLabel, labelId, id, className = "" }) {
  const [buka, setBuka] = useState(false);
  const [aktif, setAktif] = useState(0);
  const [keAtas, setKeAtas] = useState(false);
  const wadah = useRef(null);
  const tombol = useRef(null);
  const daftar = useRef(null);
  const listId = useId();

  const opsi = options.map((o) => (typeof o === "object" ? o : { value: o, label: String(o) }));
  const idxNilai = Math.max(0, opsi.findIndex((o) => o.value === value));
  const terpilih = opsi[idxNilai];

  useEffect(() => {
    if (!buka) return;
    const luar = (e) => { if (wadah.current && !wadah.current.contains(e.target)) setBuka(false); };
    document.addEventListener("mousedown", luar);
    return () => document.removeEventListener("mousedown", luar);
  }, [buka]);

  /* jaga opsi aktif tetap terlihat saat bergerak dengan keyboard */
  useEffect(() => {
    if (!buka || !daftar.current) return;
    const el = daftar.current.children[aktif];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [buka, aktif]);

  function bukaDaftar() {
    const r = tombol.current.getBoundingClientRect();
    setKeAtas(window.innerHeight - r.bottom < 280 && r.top > window.innerHeight - r.bottom);
    setAktif(idxNilai);
    setBuka(true);
  }

  function pilih(i) {
    onChange(opsi[i].value);
    setBuka(false);
    tombol.current.focus();
  }

  function onKey(e) {
    const k = e.key;
    if (!buka) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") {
        e.preventDefault();
        bukaDaftar();
      }
      return;
    }
    if (k === "Escape") { e.preventDefault(); e.stopPropagation(); setBuka(false); return; }
    if (k === "Tab") { setBuka(false); return; }
    if (k === "ArrowDown") { e.preventDefault(); setAktif((a) => Math.min(opsi.length - 1, a + 1)); return; }
    if (k === "ArrowUp") { e.preventDefault(); setAktif((a) => Math.max(0, a - 1)); return; }
    if (k === "Home") { e.preventDefault(); setAktif(0); return; }
    if (k === "End") { e.preventDefault(); setAktif(opsi.length - 1); return; }
    if (k === "Enter" || k === " ") { e.preventDefault(); pilih(aktif); return; }
    if (k.length === 1) {
      const huruf = k.toLowerCase();
      const mulai = (aktif + 1) % opsi.length;
      for (let n = 0; n < opsi.length; n++) {
        const i = (mulai + n) % opsi.length;
        if (opsi[i].label.toLowerCase().startsWith(huruf)) { setAktif(i); break; }
      }
    }
  }

  return (
    <div ref={wadah} className={"ppilih" + (buka ? " buka" : "") + (keAtas ? " ke-atas" : "") + " " + className}>
      <button
        ref={tombol}
        id={id}
        type="button"
        className="ppilih-btn"
        aria-haspopup="listbox"
        aria-expanded={buka}
        aria-controls={buka ? listId : undefined}
        aria-label={labelId ? undefined : ariaLabel}
        aria-labelledby={labelId ? labelId + " " + (id || "") : undefined}
        aria-activedescendant={buka ? listId + "-" + aktif : undefined}
        onClick={() => (buka ? setBuka(false) : bukaDaftar())}
        onKeyDown={onKey}
      >
        <span className="ppilih-nilai">{terpilih ? terpilih.label : ""}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={18} className="ppilih-panah" aria-hidden="true" />
      </button>
      {buka && (
        <ul ref={daftar} id={listId} role="listbox" className="ppilih-daftar" tabIndex={-1} aria-label={ariaLabel}>
          {opsi.map((o, i) => (
            <li
              key={String(o.value)}
              id={listId + "-" + i}
              role="option"
              aria-selected={i === idxNilai}
              className={"ppilih-opsi" + (i === aktif ? " aktif" : "") + (i === idxNilai ? " dipilih" : "")}
              onMouseEnter={() => setAktif(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pilih(i)}
            >
              <span>{o.label}</span>
              {i === idxNilai && <HugeiconsIcon icon={Tick02Icon} size={16} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
