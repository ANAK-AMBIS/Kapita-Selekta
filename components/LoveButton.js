"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { api } from "@/lib/api";

/* Tombol love: satu kali per device (cookie), tanpa login */
export default function LoveButton({ umkmId, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [loved, setLoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    let batal = false;
    api("/umkm/" + umkmId + "/love")
      .then((r) => { if (!batal) { setCount(r.count); setLoved(r.loved); } })
      .catch(() => {});
    return () => { batal = true; };
  }, [umkmId]);

  async function toggle() {
    if (busy) return;
    const sebelum = { count, loved };
    const next = !loved;
    /* optimistis, dikembalikan bila gagal */
    setLoved(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    if (next) { setPop(true); setTimeout(() => setPop(false), 400); }
    setBusy(true);
    try {
      const r = await api("/umkm/" + umkmId + "/love", { method: next ? "POST" : "DELETE" });
      setCount(r.count);
      setLoved(r.loved);
    } catch {
      setCount(sebelum.count);
      setLoved(sebelum.loved);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={"love-btn" + (pop ? " pop" : "")}
      onClick={toggle}
      disabled={busy}
      aria-pressed={loved}
      aria-label={loved ? "Batalkan love" : "Beri love"}
      title={loved ? "Batalkan love" : "Beri love"}
    >
      <HugeiconsIcon icon={FavouriteIcon} size={20} strokeWidth={1.8} fill={loved ? "currentColor" : "none"} aria-hidden="true" />
      <span>{count}</span>
    </button>
  );
}
