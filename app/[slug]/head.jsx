// app/[slug]/head.jsx
export default async function Head({ params }) {
  const base = 'https://www.tradepage.link';

  // Pull profile from your own API (already returns the public avatar URL)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  const business = (data?.name || 'Trade Page').trim(); // OG title (bold)
  const line2 = [data?.trade || '', data?.city || ''].filter(Boolean).join(' • ');
  const ogDesc = line2 || 'Your business in a link.';   // OG description
  const metaDesc = 'Trade Page Link — Your business in a link.'; // <meta name="description">

  // Avatar (fallback to default) + strong cache-buster so scrapers refresh
  const image = data?.image || `${base}/og-default.png`;
  const v = encodeURIComponent(`${data?.updated_at || ''}`.replace(/\W+/g, '').slice(0,12));
  const img = `${image}${image.includes('?') ? '&' : '?'}v=${v}`;

  const url = `${base}/${params.slug}`;

  return (
    <>
      {/* Browser tab text */}
      <title>Trade Page Link</title>
      <meta name="description" content={metaDesc} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={business} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={business} />
      <meta name="twitter:description" content={ogDesc} />
      <meta name="twitter:image" content={img} />

      {/* Proof meta so we can see it in View Source */}
      <meta name="x-proof" content="slug-head-v1" />
    </>
  );
}
