// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // Read directly with service key (bypasses RLS)
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

  // Title + lines
  const business = (data?.name || 'Trade Page').trim();
  const trade    = (data?.trade || '').trim();
  const city     = (data?.city || data?.coty || '').trim();
  const ogDescription = [trade, city].filter(Boolean).join(' • ') || 'Your business in a link.';
  const metaDescription = 'Trade Page Link — Your business in a link.'; // <meta name="description">

  // Build OG image directly from avatar (no proxy)
  let image;

  if (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url)) {
    // Full URL stored → append a small version param so scrapers bust cache
    const seed =
      (data.avatar_url || '') +
      (data.updated_at || '') +
      (process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || '');
    const v = encodeURIComponent(Buffer.from(seed).toString('base64').slice(0,12));
    image = `${data.avatar_url}${data.avatar_url.includes('?') ? '&' : '?'}v=${v}`;
  } else if (data?.avatar_path) {
    // Storage path stored → make a signed URL (unique token = new URL for scrapers)
    const { data: signed } = await sb
      .storage
      .from('avatars') // your bucket name
      .createSignedUrl(data.avatar_path, 60 * 60 * 24); // 24h
    image = signed?.signedUrl || `${base}/og-default.png`;
  } else {
    image = `${base}/og-default.png`;
  }

  const url = `${base}/${params.slug}`;

  return {
    title: { absolute: 'Trade Page Link' }, // tab text fixed
    description: metaDescription,           // meta name="description"

    openGraph: {
      title: business,                      // bold line
      description: ogDescription,           // "trade • city"
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: business,
      description: ogDescription,
      images: [image],
    },
  };
}

export default function SlugLayout({ children }) {
  return children;
}
