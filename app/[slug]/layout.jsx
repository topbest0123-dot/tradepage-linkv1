// app/[slug]/layout.jsx
export const runtime = 'nodejs';

// app/[slug]/layout.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // Pull profile (server API already uses service key)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  const business = (data?.name || 'Trade Page').trim();
  const ogTitle = business; // (add city later if you add that column back)

  // Fixed tagline (no about/ debug prefixes)
  const description = 'Trade Page Link — Your business in a link.';

  const image = data?.image || `${base}/og-default.png`;
  const url = `${base}/${params.slug}`;

  return {
    title: { absolute: 'Trade Page Link' },
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  };
}

export default function SlugLayout({ children }) {
  return children; // keeps your current UI exactly as is
}
