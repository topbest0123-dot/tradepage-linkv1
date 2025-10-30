// app/[slug]/page.jsx  (SERVER COMPONENT)
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PublicPage from '@/components/PublicPage'; // client component below
import { deriveAccountState } from '@/lib/accountState';

export const dynamic = 'force-dynamic';  // always fetch fresh
export const revalidate = 0;

/* ▼ OG/Twitter metadata so description shows "Trade • City" */
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
/* ▲ End of metadata */

export default async function Page({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // ⬇️ Include fields needed for trial/billing logic (id + trial fields)
  const { data: p, error } = await sb
    .from('profiles')
    .select(`
      id, created_at, trial_start, trial_days,
      slug, name, trade, city,
      phone, phone2, whatsapp, email,
      about, areas, services, prices, hours,
      facebook, instagram, tiktok, x, youtube, website,
      location, location_url,
      avatar_path, other_info, theme, other_trades,
      gallery
    `)
    .ilike('slug', params.slug)
    .maybeSingle();

  if (error) return notFound();
  if (!p)   return notFound();

  // ⬇️ Read subscription for the page owner
  const { data: sub } = await sb
    .from('subscriptions')
    .select('*')
    .eq('user_id', p.id)
    .maybeSingle();

  // ⬇️ Derive account state (trial/active/past_due/expired)
  const acct = deriveAccountState({ profile: p, sub });

  // ⬇️ Suspend public page if trial ended or payment is past due
  if (acct.state === 'expired' || acct.state === 'past_due') {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-red-800">
          <h2 className="text-lg font-semibold mb-1">This page is suspended</h2>
          <p className="text-sm opacity-90">
            Ask the owner to renew their subscription to reactivate it.
          </p>
        </div>
      </main>
    );
  }

  // Active or still in trial → render normally
  return <PublicPage profile={p} />;
}
