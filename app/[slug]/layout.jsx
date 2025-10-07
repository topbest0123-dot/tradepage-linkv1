// app/[slug]/layout.jsx (SERVER component)
import { supabaseServer } from '@/lib/supabaseServer';

export async function generateMetadata({ params }) {
  const slug = params.slug;

  const { data } = await supabaseServer
    .from('profiles')
    .select('slug,name,trade,city,about,avatar_url')
    .ilike('slug', slug)
    .maybeSingle();

  if (!data) {
    return {
      title: 'TradePage',
      description: 'Public profile',
      openGraph: { images: ['/og-default.png'] },
      twitter: { images: ['/og-default.png'] },
    };
  }

  const titleBits = [data.name || data.slug, [data.trade, data.city].filter(Boolean).join(' • ')].filter(Boolean);
  const title = titleBits.join(' — ');
  const description =
    (data.about || '')
      .trim()
      .slice(0, 160) ||
    `Contact ${data.name || data.slug}${data.city ? ` in ${data.city}` : ''}${data.trade ? ` for ${data.trade}` : ''}.`;

  // Supabase avatar URLs are already absolute; fallback to default OG image
  const image = data.avatar_url || '/og-default.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/${data.slug}`,
      siteName: 'TradePage',
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

// This layout just renders the page content
export default function ProfileLayout({ children }) {
  return children;
}
