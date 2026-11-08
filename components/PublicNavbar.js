"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon, Login03Icon } from "@hugeicons/core-free-icons";

/* ============================================================
   Navbar publik. variant="overlay": transparan di atas hero,
   berubah putih setelah di-scroll. variant="solid": selalu putih.
   ============================================================ */

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#direktori", label: "Direktori" },
  { href: "/#tentang", label: "Tentang" },
];

export default function PublicNavbar({ variant = "overlay" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = variant === "solid" || scrolled || open;

  return (
    <header className={"nav" + (solid ? " nav-solid" : "")}>
      <div className="container nav-in">
        <Link href="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img className="nav-logo" src="/img/logo-wayhuwi.gif" alt="" width={40} height={40} />
          <span className="nav-brand-txt">
            <b>UMKM Way Huwi</b>
            <small>Dusun 6 - Desa Way Huwi</small>
          </span>
        </Link>

        <nav className={"nav-links" + (open ? " open" : "")} aria-label="Navigasi utama">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/loginadmin" className="nav-cta" onClick={() => setOpen(false)}>
            <HugeiconsIcon icon={Login03Icon} size={17} strokeWidth={2} aria-hidden="true" />
            Masuk
          </Link>
        </nav>

        <button
          className="nav-burger"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} size={22} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
