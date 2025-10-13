// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { headers } from 'next/headers';

export async function generateMetadata({ params }) {
  // Use the current request host (works for preview + production)
  const h = headers();
  const host = h.get('host') || 'www.tradepage.link';
  const scheme = host.includes('localhost') ? 'http' : 'https';
  const base = `${scheme}://${host}`;

  // 1) Pull everything we need from our own API (no SDK here)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  // 2) Build title/lines
  const business = (data?.name || 'Trade Page').trim();
  const line2 = [data?.trade || '', data?.city || ''].filter(Boolean).join(' • ');
  const ogDescription = line2 || 'Your business in a link.';                 // shown under bold title
  const metaDescription = 'Trade Page Link — Your business in a link.';      // <meta name="description">

  // 3) OG image — avatar (if present) + strong cache-buster so scrapers refresh
  let image = data?.image || `${base}/og-default.png`;
  const seed = (image || '') + (data?.updated_at || '') + (process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || '');
  const version = encodeURIComponent(Buffer.from(seed).toString('base64').slice(0, 12));
  const img = `${image}${image.includes('?') ? '&' : '?'}v=${version}`;

  const url = `${base}/${params.slug}`;

  return {
    // Browser tab text
    title: { absolute: 'Trade Page Link' },

    // <meta name="description">
    description: metaDescription,

    // Open Graph
    openGraph: {
      title: business,                           // bold line
      description: ogDescription,                // "trade • city"
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
