/* ============================================================
   Ambil koordinat (lat, lng) dari link Google Maps.
   - Link panjang: dibaca dari "!3d<lat>!4d<lng>" atau "@<lat>,<lng>"
   - Link pendek maps.app.goo.gl: diikuti satu kali redirect-nya
     (host tetap, jadi tidak bisa dipakai menembak alamat lain)
   Gagal → null (peta lalu memakai pencarian nama + alamat).
   ============================================================ */

function bacaKoordinat(url) {
  const pin = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const at = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const q = url.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const m = pin || q || at;
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}

export async function koordinatDari(mapsUrl) {
  if (!mapsUrl) return null;
  const langsung = bacaKoordinat(mapsUrl);
  if (langsung) return langsung;

  let u;
  try { u = new URL(mapsUrl); } catch { return null; }
  if (u.protocol !== "https:" || u.hostname !== "maps.app.goo.gl") return null;

  try {
    const res = await fetch(u.toString(), { redirect: "manual", signal: AbortSignal.timeout(5000) });
    const lokasi = res.headers.get("location");
    return lokasi ? bacaKoordinat(lokasi) : null;
  } catch {
    return null;
  }
}
