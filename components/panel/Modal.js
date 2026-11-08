"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

/* Kerangka modal: tutup lewat klik latar, tombol ✕, atau Esc */
export default function Modal({ title, onClose, className = "", children, hideHead = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="pmodal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"pmodal-card " + className} role="dialog" aria-modal="true" aria-label={title}>
        {!hideHead && (
          <div className="pmodal-head">
            <h2 className="pmodal-title">{title}</h2>
            <button className="pico-btn" aria-label="Tutup" onClick={onClose}><HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
