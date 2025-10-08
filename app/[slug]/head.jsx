import { createClient } from '@supabase/supabase-js';

export default async function Head({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Load just what we need
  const { data: p } = await sb
    .from('profiles')
    .select('slug,name,trade,city,avatar_path')
    .ilike('slug', params.slug)
    .maybeSingle();

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link';

  // If there’s an avatar in the 'avatars' bucket, build a public URL; otherwise use the fallback image.
  const image =
    p?.avatar_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${encodeURIComponent(
          p.avatar_path
        )}`
      : `${site}/og-default.png`;

  const title = p?.name || params.slug;
  const description =
    [p?.trade, p?.city].filter(Boolean).join(' • ') || 'Your business in a link';

  return (
    <>
      {/* Title/description for the tab and crawlers */}
      <title>{title} — TradePage</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TradePage" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/${params.slug}`} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
