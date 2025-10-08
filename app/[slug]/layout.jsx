// app/[slug]/layout.jsx  (SERVER COMPONENT)
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;         // ISR
export const dynamic = 'force-static';

export async function generateMetadata({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data: p } = await sb
    .from('profiles')
    .select('slug,name,trade,city,avatar_path')
    .ilike('slug', params.slug)
    .maybeSingle();

  const title = p?.name || params.slug;
  const description =
    [p?.trade, p?.city].filter(Boolean).join(' • ') || 'Your business in a link';

  const avatarUrl = p?.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${encodeURIComponent(
        p.avatar_path
      )}`
    : '/og-default.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${params.slug}`,
      type: 'profile',
      siteName: 'TradePage',
      images: [avatarUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [avatarUrl],
    },
  };
}

export default function SlugLayout({ children }) {
  // pass-through wrapper
  return children;
}
