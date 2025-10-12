// app/[slug]/layout.jsx  (SERVER — no 'use client')
import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data } = await sb
    .from('profiles')
    .select('name, coty, about, avatar_url, avatar_path') // ⬅️ includes avatar_path
    .eq('slug', params.slug)
    .maybeSingle();

  // Build OG/Twitter image from Supabase Storage avatar
  const BUCKET = 'avatars'; // ← your bucket name
  let imageUrl;

  if (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url)) {
    // full URL already stored
    imageUrl = data.avatar_url;
  } else if (data?.avatar_path) {
    // avatar_path must be the file key inside the bucket, e.g. "83c8de26.../avatar.jpg"
    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(data.avatar_path);
    imageUrl = pub?.publicUrl;
  }

  const images = imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined;

  // Page <title>
  const title = { absolute: 'Trade Page Link' };

  // OG/Twitter
  const business = (data?.name || '').trim() || 'Trade Page';
  const city = (data?.coty || '').trim();
  const ogTitle = city ? `${business} — ${city}` : business;

  const description =
    ((data?.about || '').replace(/\s+/g, ' ').slice(0, 200)) ||
    'Your business in a link.';

  // ⬇️ CHANGED: hardcoded OG/Twitter image from /public
  return {
    title: { absolute: 'Trade Page Link' },
    description,
    openGraph: {
      title: ogTitle,
      description,
      // TEMP: hardcoded image that exists in /public
      images: [{ url: 'https://www.tradepage.link/og-default.png', width: 1200, height: 630 }],
      type: 'website',
      url: `https://www.tradepage.link/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      // TEMP too
      images: ['https://www.tradepage.link/og-default.png'],
    },
  };
}

export default function SlugLayout({ children }) {
  return children; // keeps your current UI exactly as is
}
