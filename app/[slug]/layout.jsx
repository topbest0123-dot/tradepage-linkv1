// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // Read everything we need directly with the service key (bypasses RLS)
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data } = await sb
    .from('profiles')
    .select('name,trade,city,coty,about,avatar_url,avatar_path,updated_at')
    .eq('slug', params.slug)
    .maybeSingle();

  // Title pieces
  const business = (data?.name || 'Trade Page').trim();
  const trade = (data?.trade || '').trim();
  const city  = (data?.city || data?.coty || '').trim();
  const line2 = [trade, city].filter(Boolean).join(' • ');

  // Meta descriptions
  const metaDescription = 'Trade Page Link — Your business in a link.'; // <meta name="description">
  const ogDescription   = line2 || 'Your business in a link.';          // OG/Twitter description

  // Build the avatar URL (full URL preferred, else public storage path)
  let avatar =
    (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url))
      ? data.avatar_url
      : (data?.avatar_path
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_path}`
          : `${base}/og-default.png`);

  // Version changes automatically when the avatar changes (new path/url or updated_at)
  const seed =
    (data?.avatar_url || '') +
    (data?.avatar_path || '') +
    (data?.updated_at || '') +
    (process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || '');
  const v = encodeURIComponent(Buffer.from(seed).toString('base64').slice(0, 12));

  // Proxy through our domain so we control caching; v= busts FB/WA cache on avatar change
  const img = `${base}/api/og/avatar/${encodeURIComponent(params.slug)}?v=${v}`;
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
