// app/[slug]/layout.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,   // server-only key
    { auth: { persistSession: false } }
  );

  // Fetch the profile row
  const { data, error } = await sb
    .from('profiles')
    .select('name,coty,about,avatar_url,avatar_path')
    .eq('slug', params.slug)
    .maybeSingle();

  // ⬇️ Debug string (added)
  const dbg =
    `sdk:${error ? 'err' : 'ok'};` +
    ` name:${!!data?.name};` +
    ` avatar_url:${!!data?.avatar_url};` +
    ` avatar_path:${!!data?.avatar_path};` +
    ` slug:${params.slug}`;

  // Tab title fixed
  const tabTitle = { absolute: 'Trade Page Link' };

  // OG title/description
  const business = (data?.name || '').trim() || 'Trade Page';
  const city = (data?.coty || '').trim();
  const ogTitle = city ? `${business} — ${city}` : business;

  // ⬇️ Description now prefixed with debug string (added)
  const description = (`[${dbg}] ` + (data?.about || 'Your business in a link.'))
    .replace(/\s+/g, ' ')
    .slice(0, 200);

  // Build image from avatar (prefer full URL, else public Storage URL)
  let image = 'https://www.tradepage.link/og-default.png';
  if (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url)) {
    image = data.avatar_url;
  } else if (data?.avatar_path) {
    const { data: pub } = sb.storage.from('avatars').getPublicUrl(data.avatar_path);
    if (pub?.publicUrl) image = pub.publicUrl;
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
