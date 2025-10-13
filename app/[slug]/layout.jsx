// app/[slug]/layout.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;          // e.g. https://...supabase.co
  const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;     // anon key

  // 1) Fetch the row via REST (no SDK)
  const url =
    `${SUPA_URL}/rest/v1/profiles` +
    `?select=name,coty,about,avatar_url,avatar_path` +
    `&slug=eq.${encodeURIComponent(params.slug)}` +
    `&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      Prefer: 'return=representation',
      'Cache-Control': 'no-store',
    },
    cache: 'no-store',
  });

  const rows = (res.ok ? await res.json() : []) || [];
  const data = rows[0];

  // 2) Build title/description
  const tabTitle = { absolute: 'Trade Page Link' };
  const business = (data?.name || '').trim() || 'Trade Page';
  const city = (data?.coty || '').trim();
  const ogTitle = city ? `${business} — ${city}` : business;
  const description =
    ((data?.about || '').replace(/\s+/g, ' ').slice(0, 200)) ||
    'Your business in a link.';

  // 3) Avatar → OG image (prefer full URL in avatar_url; else use bucket `avatars` + avatar_path)
  let image = 'https://www.tradepage.link/og-default.png';
  if (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url)) {
    image = data.avatar_url;
  } else if (data?.avatar_path) {
    image = `${SUPA_URL}/storage/v1/object/public/avatars/${data.avatar_path}`;
  }

  const pageUrl = `https://www.tradepage.link/${params.slug}`;

  return {
    title: tabTitle,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
      url: pageUrl,
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
