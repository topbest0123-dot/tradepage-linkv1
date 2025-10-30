// app/sitemap.ts
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
    { auth: { persistSession: false } }
  );

  // Pull minimal fields
  const { data: profiles } = await sb
    .from('profiles')
    .select('id, slug, trial_start, trial_days')
    .not('slug', 'is', null);

  if (!profiles?.length) return [];

  const now = Date.now();
  const visible: Array<{ slug: string }> = [];

  // We’ll include a profile if: still in trial OR has an active subscription
  for (const p of profiles) {
    const trialDays = Number(p.trial_days ?? 0);
    const trialEnd = p.trial_start
      ? new Date(p.trial_start).getTime() + trialDays * 86400_000
      : 0;

    if (trialEnd > now) {
      visible.push({ slug: p.slug as string });
      continue;
    }

    const { data: sub } = await sb
      .from('subscriptions')
      .select('status')
      .eq('user_id', p.id)
      .maybeSingle();

    if (sub?.status === 'active') {
      visible.push({ slug: p.slug as string });
    }
  }

  // Return only active/trial pages – suspended are omitted automatically.
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link';
  return visible.map(({ slug }) => ({
    url: `${base}/${slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }));
}
