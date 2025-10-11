// server file (no "use client")
export default async function Head({ params }) {
  const slug = String(params?.slug || '').toLowerCase();

  // defaults
  let title = slug || 'TradePage';
  let description = 'Your business in a link';
  let image = '/og-default.png';

  // Try to enrich from Supabase; fall back silently if anything is missing
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && slug) {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(url, key);

      const { data } = await sb
        .from('profiles')
        .select('name, trade, city, about, avatar_path')
        .ilike('slug', slug)
        .maybeSingle();

      if (data) {
        title = data.name || slug;
        const about = (data.about || '').trim();
        description =
          about || [data.trade, data.city].filter(Boolean).join(' • ') || description;

        if (data.avatar_path) {
          image = `${url}/storage/v1/object/public/avatars/${encodeURIComponent(
            data.avatar_path
          )}`;
        }
      }
    }
  } catch {
    // keep defaults
  }

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
