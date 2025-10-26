// app/[slug]/page.jsx  (SERVER COMPONENT)
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PublicPage from '@/components/PublicPage'; // client component below

export const dynamic = 'force-dynamic';  // always fetch fresh
export const revalidate = 0;

/* ▼ Added: OG/Twitter metadata so description shows "Trade • City" */
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

  const title = p?.name || 'TradePage';
  const description =
    [p?.trade, p?.city].filter(Boolean).join(' • ') || 'Your business in a link';

  const image = p?.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${p.avatar_path}`
    : '/og-default.png';

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: `/${params.slug}`,
      siteName: 'TradePage',
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
/* ▲ End of addition */

export default async function Page({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data: p, error } = await sb
    .from('profiles')
    .select(`
      slug,name,trade,city,
      phone,whatsapp,email,
      about,areas,services,prices,hours,
      facebook,instagram,tiktok,x,youtube,
      location, location_url,
      avatar_path,other_info,theme,other_trades,
      gallery
    `)
    .ilike('slug', params.slug)
    .maybeSingle();

  if (error) return notFound();
  if (!p)   return notFound();

  return <PublicPage profile={p} />;
}
