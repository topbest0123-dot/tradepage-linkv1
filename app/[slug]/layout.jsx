// app/[slug]/layout.jsx  (SERVER — no 'use client')
import { createClient } from '@supabase/supabase-js';

export async function generateMetadata() {
  return {
    title: { absolute: 'Trade Page Link' }, // tab text EXACTLY this
    openGraph: { title: 'Trade Page Link' },
    twitter:   { title: 'Trade Page Link' },
  };
}

  const { data } = await supabase
    .from('profiles')
    .select('name, about')
    .eq('slug', params.slug)
    .maybeSingle();

  const title = data?.name ? `${data.name} — TradePage` : 'TradePage';
  const description = data?.about?.slice(0, 160) || 'Professional TradePage profile';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.tradepage.link/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function SlugLayout({ children }) {
  return children; // keeps your current UI exactly as is
}
