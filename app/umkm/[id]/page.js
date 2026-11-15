import { cache } from "react";
import { notFound } from "next/navigation";
import UmkmDetail from "@/components/UmkmDetail";
import { query } from "@/lib/server/db";
import { KOLOM_PUBLIK, idValid } from "@/lib/server/umkm";

export const dynamic = "force-dynamic";

/* Galeri (base64, bisa >1 MB) TIDAK ikut diambil di sini: cukup jumlah + sidik
   isinya, lalu tiap foto dimuat lewat /umkm/:id/foto/:i (bisa di-cache browser).
   cache() memastikan generateMetadata & Page berbagi satu query. */
const ambil = cache(async (id) => {
  const [row] = await query(
    `SELECT ${KOLOM_PUBLIK}, katalog,
            jsonb_array_length(galeri) AS galeri_n,
            left(md5(galeri::text), 10) AS galeri_v
       FROM umkm WHERE id = $1`,
    [id]
  );
  if (!row) return null;
  const { galeri_n, galeri_v, ...d } = row;
  if (d.foto) d.foto = d.foto.replace("w=480", "w=960"); /* foto utama di detail tampil besar */
  d.galeri = Array.from({ length: galeri_n }, (_, i) => `/umkm/${d.id}/foto/${i}?w=960&v=${galeri_v}`);
  return d;
});

const idDari = async (params) => idValid((await params).id);

export async function generateMetadata({ params }) {
  const id = await idDari(params);
  const d = id ? await ambil(id) : null;
  return { title: { absolute: (d ? d.nama : "UMKM tidak ditemukan") + " - UMKM Way Huwi" } };
}

export default async function Page({ params }) {
  const id = await idDari(params);
  const d = id ? await ambil(id) : null;
  if (!d) notFound();
  /* UMKM lain (kategori sama lebih dulu, maks 3) dan jumlah love: paralel */
  const [lainnya, [{ n: love }]] = await Promise.all([
    query(`SELECT ${KOLOM_PUBLIK} FROM umkm WHERE id <> $1 ORDER BY (kategori = $2) DESC, id LIMIT 3`, [d.id, d.kategori]),
    query("SELECT count(*)::int AS n FROM umkm_love WHERE umkm_id = $1", [d.id]),
  ]);
  return <UmkmDetail umkm={d} lainnya={lainnya} love={love} />;
}
