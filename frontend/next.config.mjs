/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Static export untuk hosting GitHub Pages */
  output: "export",
  /* GitHub Pages project site -> https://<user>.github.io/<repo>/ */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
};

export default nextConfig;
