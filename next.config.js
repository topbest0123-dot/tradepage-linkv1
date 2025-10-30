/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: true,

  // ⬇️ REPLACE ONLY THIS PART
  async headers() {
    const csp = [
      "default-src 'self'",
      // PayPal JS + dynamic imports
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com",
      "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com",
      // XHR/fetch to PayPal
      "connect-src 'self' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com",
      // Buttons render inside an iframe from PayPal
      "frame-src https://www.paypal.com https://*.paypal.com",
      // Images/assets (logos, sprites)
      "img-src 'self' data: https: https://*.paypal.com https://*.paypalobjects.com",
      // Inline styles are used inside the button iframe
      "style-src 'self' 'unsafe-inline'",
      // Fonts/images may be inlined as data:
      "font-src 'self' data:"
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ],
      },
    ];
  },
  // ⬆️ REPLACE ONLY THIS PART

  async redirects() { return []; },
  async rewrites()  { return []; },
};

module.exports = nextConfig;
// Test rebuild
