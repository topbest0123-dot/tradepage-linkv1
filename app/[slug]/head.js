// app/[slug]/head.js  (Server file; adds OG/Twitter tags for a profile)
import { createClient } from '@supabase/supabase-js';

export default async function Head({ params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // Get the profile just by slug
  const { data: p } = await supabase
    .from('profiles')
    .select('slug,name,trade,city,avatar_path')
    .ilike('slug', params.slug)
    .maybeSingle();

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link';
  const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const title = p?.name || params.slug;
  const description =
    [p?.trade, p?.city].filter(Boolean).join(' • ') || 'Your business in a link';

  // Dynamic image: profile avatar if present, otherwise your default
  const ogImage = p?.avatar_path
    ? `${supabaseBase}/storage/v1/object/public/avatars/${encodeURIComponent(
        p.avatar_path
      )}`
    : `${site}/og-default.png`;

  const url = `${site}/${params.slug}`;

  return (
    <>
      {/* You can keep your global tags in app/layout.jsx; these here override per-page */}
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TradePage" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
