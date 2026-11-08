"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Share08Icon,
  Copy01Icon,
  Tick02Icon,
  WhatsappIcon,
  Facebook01Icon,
  NewTwitterIcon,
  TelegramIcon,
} from "@hugeicons/core-free-icons";

const Ico = ({ icon, size = 18 }) => <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} aria-hidden="true" />;

/* Tombol "Bagikan": pakai menu share bawaan HP bila ada, selain itu tampilkan pilihan */
export default function ShareButton({ title, text }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  async function klik() {
    const url = window.location.href;
    /* HP: menu share sistem */
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title, text, url }); return; } catch { /* dibatalkan → buka menu */ }
    }
    setOpen((o) => !o);
  }

  async function salin() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      window.prompt("Salin tautan ini:", window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const link = (base) => () => {
    const url = encodeURIComponent(window.location.href);
    const msg = encodeURIComponent(text + " ");
    window.open(base(url, msg), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="share" ref={ref}>
      <button className="share-btn" onClick={klik} aria-label="Bagikan" title="Bagikan" aria-expanded={open} aria-haspopup="true">
        <Ico icon={Share08Icon} size={20} />
      </button>
      {open && (
        <div className="share-pop" role="menu">
          <button role="menuitem" onClick={salin}>
            <Ico icon={copied ? Tick02Icon : Copy01Icon} /> {copied ? "Tautan disalin" : "Salin tautan"}
          </button>
          <button role="menuitem" onClick={link((u, m) => "https://wa.me/?text=" + m + u)}>
            <Ico icon={WhatsappIcon} /> WhatsApp
          </button>
          <button role="menuitem" onClick={link((u) => "https://www.facebook.com/sharer/sharer.php?u=" + u)}>
            <Ico icon={Facebook01Icon} /> Facebook
          </button>
          <button role="menuitem" onClick={link((u, m) => "https://twitter.com/intent/tweet?text=" + m + "&url=" + u)}>
            <Ico icon={NewTwitterIcon} /> X (Twitter)
          </button>
          <button role="menuitem" onClick={link((u, m) => "https://t.me/share/url?url=" + u + "&text=" + m)}>
            <Ico icon={TelegramIcon} /> Telegram
          </button>
        </div>
      )}
    </div>
  );
}
