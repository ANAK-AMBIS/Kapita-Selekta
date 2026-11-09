"use client";

import { useEffect, useState } from "react";

/* Mengingat posisi terakhir admin di panel (tab, filter, halaman, scroll)
   di localStorage perangkat ini, supaya refresh atau buka ulang kembali ke tempat yang sama.
   Semua kunci diawali "panel:" dan dihapus saat admin keluar. */

const AWALAN = "panel:";

export function bacaIngat(kunci, awal, cek) {
  try {
    const s = window.localStorage.getItem(AWALAN + kunci);
    if (s === null) return awal;
    const v = JSON.parse(s);
    return !cek || cek(v) ? v : awal;
  } catch {
    return awal; /* mode privat / penyimpanan diblokir: pakai nilai awal */
  }
}

export function simpanIngat(kunci, v) {
  try {
    window.localStorage.setItem(AWALAN + kunci, JSON.stringify(v));
  } catch {
    /* abaikan: panel tetap jalan tanpa ingatan */
  }
}

export function hapusSemuaIngat() {
  try {
    const ls = window.localStorage;
    for (let i = ls.length - 1; i >= 0; i--) {
      const k = ls.key(i);
      if (k && k.startsWith(AWALAN)) ls.removeItem(k);
    }
  } catch {
    /* abaikan */
  }
}

/* seperti useState, tapi nilainya diingat. `cek` menolak nilai lama yang sudah tidak valid
   (misalnya RT yang sudah tidak ada). Hanya dipakai di komponen yang tampil setelah data
   dimuat di browser, jadi tidak bentrok dengan render server. */
export function useIngat(kunci, awal, cek) {
  const [v, setV] = useState(() => (typeof window === "undefined" ? awal : bacaIngat(kunci, awal, cek)));
  useEffect(() => { simpanIngat(kunci, v); }, [kunci, v]);
  return [v, setV];
}
