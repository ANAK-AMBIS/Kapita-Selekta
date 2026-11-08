/* ============================================================
   Konstanta & helper bersama (panel admin, login, halaman publik)
   ============================================================ */

export const RTS = ["RT 05", "RT 05A", "RT 06", "RT 06A"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export const PER_PAGE = 8;

/* format angka rupiah tanpa "Rp" */
export const rp = (n) => (n || 0).toLocaleString("id-ID");

/* kunci bulan "2026-03" untuk tahun y & bulan m (0–11) */
export const monthKey = (y, m) => y + "-" + String(m + 1).padStart(2, "0");

/* kunci catatan iuran: "<idUmkm>|<YYYY-MM>" */
export const iuranKey = (id, y, m) => id + "|" + monthKey(y, m);

/* RT sebuah UMKM (data lama mungkin belum punya RT) */
export const rtOf = (d) => d.rt || RTS[0];

/* total iuran satu UMKM dalam satu tahun */
export function totalTahun(iuran, id, y) {
  let sum = 0;
  for (let m = 0; m < 12; m++) sum += iuran[iuranKey(id, y, m)] || 0;
  return sum;
}

/* kelas gradien avatar per kategori */
export const gradClass = (kategori, kategoriList) =>
  "grad-" + (kategoriList.includes(kategori) ? kategori : "Lainnya");
