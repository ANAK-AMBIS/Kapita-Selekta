/* Ditampilkan langsung saat pindah ke halaman detail, selagi data dimuat */
export default function Loading() {
  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <p style={{ opacity: 0.6 }}>Memuat UMKM…</p>
    </main>
  );
}
