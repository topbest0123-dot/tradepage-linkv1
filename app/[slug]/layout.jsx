// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // Pull everything from our own API (no SDK in metadata)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  // Title & lines
  const business = (data?.name || 'Trade Page').trim();
  const line2 = [data?.trade || '', data?.city || ''].filter(Boolean).join(' • ');
  const ogDescription = line2 || 'Your business in a link.';
  const metaDescription = 'Trade Page Link — Your business in a link.'; // <meta name="description">

  // OG image: use avatar if present; otherwise fallback to default
  let image = data?.image || `${base}/og-default.png`;

  // Strong cache-buster: change URL whenever avatar or build changes
  const seed = (image || '') + (data?.updated_at || '') + (process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || '');
  const version = encodeURIComponent(Buffer.from(seed).toString('base64').slice(0, 12));
  const img = `${image}${image.includes('?') ? '&' : '?'}v=${version}`;

  const url = `${base}/${params.slug}`;

  return {
    // Tab text
    title: { absolute: 'Trade Page Link' },

    // <meta name="description">
    description: metaDescription,

    // Open Graph
    openGraph: {
      title: business,                         // bold line
      description: ogDescription,              // "trade • city"
      images: [{ url: img, secure_url: img, width: 1200, height: 630 }],
      type: 'website',
      url,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: business,
      description: ogDescription,
      images: [img],
    },
  };
}

export default function SlugLayout({ children }) {
  return children;
}
