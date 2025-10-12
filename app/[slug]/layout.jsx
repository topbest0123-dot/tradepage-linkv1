// app/[slug]/layout.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  // Fixed browser tab text
  const title = { absolute: 'Trade Page Link' };

  let name = '', city = '', about = '', avatarUrl = '';

  try {
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

    if (data) {
      name = data.name || '';
      city = data.coty || '';
      about = data.about || '';

      if (data.avatar_url && /^https?:\/\//i.test(data.avatar_url)) {
        // full URL already stored
        avatarUrl = data.avatar_url;
      } else if (data.avatar_path) {
        // build public URL from Storage bucket "avatars"
        const { data: pub } = sb.storage.from('avatars').getPublicUrl(data.avatar_path);
        // supabase-js v2: public URL is at pub.publicUrl
        avatarUrl = pub?.publicUrl || pub?.public_url || '';
      }
    }
  } catch (_) {
    // swallow errors; we'll fall back below
  }

  const ogTitle = (name ? name : 'Trade Page') + (city ? ` — ${city}` : '');
  const description = (about || 'Your business in a link.')
    .replace(/\s+/g, ' ')
    .slice(0, 200);

  // Always emit an image: avatar if present, else fallback
  const image = avatarUrl || 'https://www.tradepage.link/og-default.png';
  const url = `https://www.tradepage.link/${params.slug}`;

  return {
    title,
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
  return children;
}
