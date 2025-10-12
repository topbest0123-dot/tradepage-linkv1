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
    .select('name, coty, about, avatar_url, avatar_path')
    .eq('slug', params.slug)
    .maybeSingle();

  // Tab text stays fixed
  const title = { absolute: 'Trade Page Link' };

  // OG title/description
  const business = (data?.name || '').trim() || 'Trade Page';
  const city = (data?.coty || '').trim();
  const ogTitle = city ? `${business} — ${city}` : business;
  const description =
    ((data?.about || '').replace(/\s+/g, ' ').slice(0, 200)) ||
    'Your business in a link.';

  // --- Avatar → OG image ---
  // 1) prefer full URL in `avatar_url`
  // 2) else build a public URL from Storage bucket `avatars` + `avatar_path`
  let imageUrl;
  if (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url)) {
    imageUrl = data.avatar_url;
  } else if (data?.avatar_path) {
    const { data: pub } = sb.storage.from('avatars').getPublicUrl(data.avatar_path);
    imageUrl = pub?.publicUrl;
  }
  const images = imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images,
      type: 'website',
      url: `https://www.tradepage.link/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default function SlugLayout({ children }) {
  return children; // keeps your current UI exactly as is
}
