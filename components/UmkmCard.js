import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { KATEGORI_META } from "@/data/umkm";
import KategoriIcon from "@/components/KategoriIcon";

/* Kartu satu UMKM → /umkm/<id> (dipakai di direktori & "UMKM lainnya") */
export default function UmkmCard({ umkm: d }) {
  const meta = KATEGORI_META[d.kategori] || KATEGORI_META["Lainnya"];
  return (
    <Link href={"/umkm/" + d.id} className="umkm-card pub-card">
      {d.foto ? (
        <img className="card-img pub-img" src={d.foto} alt={d.nama} />
      ) : (
        <div className={"card-img " + meta.img}>
          <KategoriIcon kategori={d.kategori} size={56} className="img-ico" />
        </div>
      )}
      <div className="card-body">
        <span className="card-title">{d.nama}</span>
        {d.pemilik && <span className="card-loc">{d.pemilik}</span>}
        <div className="card-foot">
          <span className="card-loc">
            <HugeiconsIcon icon={Location01Icon} size={15} strokeWidth={1.8} className="loc-ico" aria-hidden="true" />
            {d.lokasi || d.rt || "Dusun 6"}
          </span>
          <span className="card-link" aria-label="Lihat detail">
            <span className="card-link-ico">
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
