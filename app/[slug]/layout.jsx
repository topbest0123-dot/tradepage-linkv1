// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // Pull profile from your own API (returns: name, trade, city, image, updated_at)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  // Titles
  const business = (data?.name || 'Trade Page').trim();                   // OG title (bold)
  const line2    = [data?.trade || '', data?.city || ''].filter(Boolean).join(' • ');
  const ogDesc   = line2 || 'Your business in a link.';                   // OG description
  const metaDesc = 'Trade Page Link — Your business in a link.';          // <meta name="description">

  // OG image (avatar or fallback) + simple version so scrapers refresh
  let image = data?.image || `${base}/og-default.png`;
  const vseed = `${data?.updated_at || ''}${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || ''}`;
  const v = encodeURIComponent(vseed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12));
  const img = `${image}${image.includes('?') ? '&' : '?'}v=${v}`;

  const url = `${base}/${params.slug}`;

  return {
    // Browser tab text
    title: { absolute: 'Trade Page Link' },

    // <meta name="description">
    description: metaDesc,

    // Open Graph
    openGraph: {
      title: business,
      description: ogDesc,
      images: [{ url: img, width: 1200, height: 630 }],
      type: 'website',
      url,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: business,
      description: ogDesc,
      images: [img],
    },
  };
}

export default function SlugLayout({ children }) {
  return children;
}
