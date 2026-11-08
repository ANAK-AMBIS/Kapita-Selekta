import PublicDirectory from "@/components/PublicDirectory";
import { query } from "@/lib/server/db";
import { KOLOM_LIST } from "@/lib/server/umkm";

export const metadata = { title: { absolute: "UMKM Way Huwi - Dusun 6, Desa Way Huwi" } };
export const dynamic = "force-dynamic";

export default async function Beranda() {
  const data = await query(`SELECT ${KOLOM_LIST} FROM umkm ORDER BY id`);
  return <PublicDirectory data={data} />;
}
