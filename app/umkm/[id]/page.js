import { notFound } from "next/navigation";
import UmkmDetail from "@/components/UmkmDetail";
import { query } from "@/lib/server/db";
import { KOLOM, KOLOM_LIST, idValid } from "@/lib/server/umkm";

export const dynamic = "force-dynamic";

async function ambil(params) {
  const id = idValid((await params).id);
  if (!id) return null;
  const [row] = await query(`SELECT ${KOLOM} FROM umkm WHERE id = $1`, [id]);
  return row || null;
}

export async function generateMetadata({ params }) {
  const d = await ambil(params);
  return { title: { absolute: (d ? d.nama : "UMKM tidak ditemukan") + " - UMKM Way Huwi" } };
}

export default async function Page({ params }) {
  const d = await ambil(params);
  if (!d) notFound();
  /* UMKM lain: kategori sama lebih dulu, maksimal 3 */
  const lainnya = await query(
    `SELECT ${KOLOM_LIST} FROM umkm WHERE id <> $1 ORDER BY (kategori = $2) DESC, id LIMIT 3`,
    [d.id, d.kategori]
  );
  const [{ n: love }] = await query("SELECT count(*)::int AS n FROM umkm_love WHERE umkm_id = $1", [d.id]);
  return <UmkmDetail umkm={d} lainnya={lainnya} love={love} />;
}
