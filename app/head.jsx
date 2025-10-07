// app/head.jsx
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link';

export default function Head() {
  const title = 'TradePage — Your business in a link';
  const desc =
    'Create a simple public page with your name, trade, city, services, and tap-to-call/WhatsApp.';

  return (
    <>
      <title>{title}</title>

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={`${SITE}/og-default.png`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={`${SITE}/og-default.png`} />

      <link rel="canonical" href={SITE} />
    </>
  );
}
