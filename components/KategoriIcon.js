"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Restaurant01Icon,
  ShoppingBasket01Icon,
  PaintBrush01Icon,
  Wrench01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons";

/* ikon Hugeicons per kategori UMKM (pengganti emoji) */
const ICONS = {
  Kuliner: Restaurant01Icon,
  Sembako: ShoppingBasket01Icon,
  Kerajinan: PaintBrush01Icon,
  Jasa: Wrench01Icon,
  Lainnya: Store01Icon,
};

export default function KategoriIcon({ kategori, size = 24, strokeWidth = 1.6, className }) {
  return (
    <HugeiconsIcon
      icon={ICONS[kategori] || Store01Icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}
