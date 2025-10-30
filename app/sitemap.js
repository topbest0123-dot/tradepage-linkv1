// app/sitemap.js
import { createClient } from '@supabase/supabase-js';

// always compute at request-time so re-activation gets picked up
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link').replace(/\/$/, '');

  // Always include the homepage
  const items = [
    { url: `${base}/`, lastModified: new Date().toISOString() },
  ];

  try {
    // Server-side Supabase (service role)
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    // This RPC returns only slugs that are ACTIVE or still in TRIAL
    const { data, error } = await sb.rpc('sitemap_profile_slugs');

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        items.push({
          url: `${base}/${row.slug}`,
          lastModified: row.updated_at || new Date().toISOString(),
        });
      }
    }
  } catch (_) {
    // If anything fails, we still return the homepage entry above.
  }

  return items;
}
