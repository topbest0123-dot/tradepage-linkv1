// app/[slug]/page.jsx  (SERVER COMPONENT)
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PublicPage from '@/components/PublicPage'; // client component below

export const dynamic = 'force-dynamic';  // always fetch fresh
export const revalidate = 0;

// ───────────────── helpers ─────────────────
function addDaysISO(iso, days) {
  const t = new Date(iso || Date.now()).getTime();
  return new Date(t + days * 86400000).toISOString();
}

function computeSuspended(profile, sub) {
  // active only if subscription row exists AND is 'active'
  const hasActiveSub = !!(sub && sub.status === 'active');

  // trial math
  const trialDays = Number.isFinite(profile?.trial_days) ? Number(profile.trial_days) : 14;
  const startISO = profile?.trial_start || profile?.created_at || new Date().toISOString();
  const trialEndISO = addDaysISO(startISO, trialDays);
  const now = new Date();

  const isExpired =
    !hasActiveSub && (trialDays <= 0 || now >= new Date(trialEndISO));

  return { isExpired, endsAt: trialEndISO, hasActiveSub };
}

// ───────────────── metadata ─────────────────
export async function generateMetadata({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data: p } = await sb
    .from('profiles')
    .select('id,slug,name,trade,city,avatar_path,created_at,trial_start,trial_days')
    .ilike('slug', params.slug)
    .maybeSingle();

  if (!p) {
    return {
      title: 'TradePage',
      description: 'Your business in a link',
      robots: { index: false, follow: false },
    };
  }

  const { data: sub } = await sb
    .from('subscriptions')
    .select('status')
    .eq('user_id', p.id)
    .maybeSingle();

  const { isExpired } = computeSuspended(p, sub);

  const title = p?.name || 'TradePage';
  const description = [p?.trade, p?.city].filter(Boolean).join(' • ') || 'Your business in a link';
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
    // Keep suspended profiles out of search while inactive
    robots: isExpired ? { index: false, follow: false } : undefined,
  };
}

// ───────────────── page ─────────────────
export default async function Page({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // Fetch full profile (now includes id + trial fields so we can gate correctly)
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
  if (!p) return notFound();

  // Lookup subscription for this profile
  const { data: sub } = await sb
    .from('subscriptions')
    .select('status')
    .eq('user_id', p.id)
    .maybeSingle();

  // Decide visibility
  const { isExpired, endsAt } = computeSuspended(p, sub);

  if (isExpired) {
    // Friendlier than 404: show a temporary hold page (200 + noindex via metadata).
    return (
      <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '48px' }}>
        <div style={{ maxWidth: 680, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 12 }}>Profile temporarily unavailable</h1>
          <p style={{ opacity: .8, marginBottom: 8 }}>
            This page is currently suspended (trial ended or subscription inactive).
          </p>
          {endsAt ? (
            <p style={{ opacity: .6, marginBottom: 20, fontSize: 14 }}>
              Last active: {new Date(endsAt).toLocaleString()}
            </p>
          ) : null}
          <a
            href="/signin"
            style={{
              padding: '10px 16px',
              border: '1px solid var(--chip-border)',
              background: 'var(--chip-bg)',
              color: 'var(--text)',
              borderRadius: 10,
              display: 'inline-flex',
              gap: 8
            }}
          >
            Sign in to reactivate
          </a>
        </div>
      </main>
    );
  }

  // Active or in-trial → render public profile
  return <PublicPage profile={p} />;
}
