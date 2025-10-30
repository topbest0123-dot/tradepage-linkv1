// app/[slug]/page.jsx  (SERVER COMPONENT)
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PublicPage from '@/components/PublicPage'; // client component below
import { deriveAccountState } from '@/lib/accountState';

export const dynamic = 'force-dynamic';  // always fetch fresh
export const revalidate = 0;

/* OG/Twitter metadata + robots control for expired pages */
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

  // If no profile at all, standard 404 metadata
  if (!p) {
    return {
      title: 'TradePage',
      description: 'Your business in a link',
      robots: { index: false, follow: false }
    };
  }

  // Check account state to decide indexing policy
  const { state } = await deriveAccountState(sb, p.slug);

  const title = p?.name || 'TradePage';
  const description =
    [p?.trade, p?.city].filter(Boolean).join(' • ') || 'Your business in a link';

  const image = p?.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${p.avatar_path}`
    : '/og-default.png';

  // If expired, keep the URL out of search results while suspended
  const robots =
    state === 'expired'
      ? { index: false, follow: false } // Next.js will output both meta + X-Robots-Tag
      : undefined;

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
    robots,
  };
}

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
      phone,phone2,whatsapp,email,
      about,areas,services,prices,hours,
      facebook,instagram,tiktok,x,youtube,website,
      location, location_url,
      avatar_path,other_info,theme,other_trades,
      gallery
    `)
    .ilike('slug', params.slug)
    .maybeSingle();

  if (error) return notFound();
  if (!p)   return notFound();

  // Check subscription/trial status
  const { state, endsAt } = await deriveAccountState(sb, p.slug);

  // Friendlier alternative to 404: show a temporary-hold page
  if (state === 'expired') {
    return (
      <main style={{minHeight:'70vh',display:'grid',placeItems:'center',padding:'48px'}}>
        <div style={{maxWidth:680,textAlign:'center'}}>
          <h1 style={{marginBottom:12}}>Profile temporarily unavailable</h1>
          <p style={{opacity:.8,marginBottom:8}}>
            This page is currently suspended (trial ended or subscription inactive).
          </p>
          {endsAt ? (
            <p style={{opacity:.6,marginBottom:20,fontSize:14}}>
              Last active: {new Date(endsAt).toLocaleString()}
            </p>
          ) : null}
          <a
            href="/signin"
            style={{
              padding:'10px 16px',
              border:'1px solid var(--chip-border)',
              background:'var(--chip-bg)',
              color:'var(--text)',
              borderRadius:10,
              display:'inline-flex',
              gap:8
            }}
          >
            Sign in to reactivate
          </a>
        </div>
      </main>
    );
  }

  // Active or in-trial → show public page
  return <PublicPage profile={p} />;
}
