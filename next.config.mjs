/** @type {import('next').NextConfig} */
const nextConfig = {
  /* paket database berjalan di Node, jangan di-bundle */
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
