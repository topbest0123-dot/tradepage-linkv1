// ➜ add these at the very top of app/[slug]/page.jsx
import { createClient } from '@supabase/supabase-js';

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const avatarPublicUrl = (p) =>
  p
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${p}`
    : '/og-default.png';

export async function generateMetadata({ params }) {
  const { slug } = params || {};

  // read only public fields; no auth needed
  const { data } = await supa
    .from('profiles')
    .select('name, trade, city, avatar_path')
    .eq('slug', slug)
    .maybeSingle();

  const title = data?.name || 'TradePage';
  const description =
    [data?.trade, data?.city].filter(Boolean).join(' • ') ||
    'Your business in a link';

  const image = avatarPublicUrl(data?.avatar_path);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: `/${slug}`,
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


// app/[slug]/page.jsx  (SERVER COMPONENT)
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PublicPage from '@/components/PublicPage'; // client component below

export const dynamic = 'force-dynamic';  // always fetch fresh
export const revalidate = 0;

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
