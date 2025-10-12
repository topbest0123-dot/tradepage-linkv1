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
    .select('name, coty, about, avatar_url')
    .eq('slug', params.slug)
    .maybeSingle();

  // Page <title>
  const title = { absolute: 'Trade Page Link' };

  // OG/Twitter
  const business = (data?.name || '').trim() || 'Trade Page';
  const city = (data?.coty || '').trim();
  const ogTitle = city ? `${business} — ${city}` : business;

  const description =
    ((data?.about || '').replace(/\s+/g, ' ').slice(0, 200)) ||
    'Your business in a link.';

  const images = data?.avatar_url ? [{ url: data.avatar_url }] : undefined;

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
      images,
    },
  };
}

export default function SlugLayout({ children }) {
  return children; // keeps your current UI exactly as is
}
