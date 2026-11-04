import "./globals.css";

export const metadata = {
  title: {
    default: "UMKM Way Huwi — Dusun 6, Desa Way Huwi",
    template: "%s — Panel UMKM Way Huwi",
  },
  description:
    "Panel kelola data & iuran bulanan UMKM Dusun 6, Desa Way Huwi, Kecamatan Jati Agung, Kabupaten Lampung Selatan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
