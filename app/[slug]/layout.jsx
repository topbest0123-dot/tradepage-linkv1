// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // 1) Get name + avatar (already built) from your API
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const apiData = res.ok ? await res.json() : null;

  // 2) Get trade + city (try both "city" and legacy "coty") via service key
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  let trade = '';
  let city = '';

  try {
    const { data } = await sb
      .from('profiles')
      .select('trade,city')
      .eq('slug', params.slug)
      .maybeSingle();
    if (data) {
      trade = data.trade || '';
      city = data.city || '';
    }
    if (!city) {
      const { data: d2 } = await sb
        .from('profiles')
        .select('trade,coty')
        .eq('slug', params.slug)
        .maybeSingle();
      if (d2) {
        trade = trade || d2.trade || '';
        city = d2.coty || city || '';
      }
    }
  } catch (_) {
    /* ignore; we’ll fall back */
  }

  // 3) Build OG pieces
  const business = (apiData?.name || 'Trade Page').trim();
  const line2 = [trade, city].filter(Boolean).join(' • ');
  const ogDescription = line2 || 'Your business in a link.'; // shown under the bold title
  const metaDescription = 'Trade Page Link — Your business in a link.'; // browser tab meta

  const image = apiData?.image || `${base}/og-default.png`;
  // Make scrapers fetch a fresh image each deploy
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '0';
  const img = image + (image.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(sha);

  const url = `${base}/${params.slug}`;

  return {
    // Tab text stays fixed
    title: { absolute: 'Trade Page Link' },

    // <meta name="description">
    description: metaDescription,

    // Open Graph (most sites render title in bold, description under it)
    openGraph: {
      title: business,
      description: ogDescription,
      images: [{ url: img, width: 1200, height: 630 }],
      type: 'website',
      url,
    },

    // Twitter card
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
