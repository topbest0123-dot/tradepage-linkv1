// app/[slug]/head.jsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link';

export default async function Head({ params }) {
  // Fetch minimal data for OG
  const { data } = await supabase
    .from('profiles')
    .select('slug,name,trade,city,avatar_url')
    .ilike('slug', params.slug)
    .maybeSingle();

  // Title
  const title = data
    ? `${data.name || data.slug} — ${[data.trade, data.city].filter(Boolean).join(' • ')}`
    : 'TradePage';

  // Description (short and safe)
  const desc = data
    ? [data.trade, data.city].filter(Boolean).join(' • ') || 'Your business in a link'
    : 'Your business in a link';

  // Absolute URL to the page
  const url = `${SITE}/${params.slug}`;

  // Absolute image URL (avatar or fallback)
  const image =
    data?.avatar_url && data.avatar_url.startsWith('http')
      ? data.avatar_url
      : data?.avatar_url
      ? `${data.avatar_url}` // already absolute from Supabase public bucket
      : `${SITE}/og-default.png`;

  return (
    <>
      <title>{title}</title>

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      <link rel="canonical" href={url} />
    </>
  );
}
