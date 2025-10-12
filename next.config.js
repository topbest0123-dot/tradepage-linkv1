/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: true, // <— add this
  async headers() { return []; },
  async redirects() { return []; },
  async rewrites() { return []; },
};
module.exports = nextConfig;
// Test rebuild
