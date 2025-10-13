import { headers } from 'next/headers';

export async function generateMetadata({ params }) {
  // Works on preview + production
  const h = headers();
  const host  = h.get('x-forwarded-host') || h.get('host') || 'www.tradepage.link';
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const base  = `${proto}://${host}`;

  // Pull profile from our API (returns name, trade, city, image, updated_at)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  // Title / lines
  const business = (data?.name || 'Trade Page').trim();                 // OG title (bold)
  const line2    = [data?.trade || '', data?.city || ''].filter(Boolean).join(' • ');
  const ogDesc   = line2 || 'Your business in a link.';                 // OG description
  const metaDesc = 'Trade Page Link — Your business in a link.';        // <meta name="description">

  // OG image (avatar) with strong cache-buster so scrapers refresh
  let image = data?.image || `${base}/og-default.png`;
  const seed = `${image}|${data?.updated_at || ''}|${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || ''}`;
  const v    = encodeURIComponent(Buffer.from(seed).toString('base64').slice(0, 12));
  const img  = `${image}${image.includes('?') ? '&' : '?'}v=${v}`;

  const url = `${base}/${params.slug}`;

  return {
    title: { absolute: 'Trade Page Link' },   // tab text
    description: metaDesc,                    // <meta name="description">
    openGraph: {
      title: business,
      description: ogDesc,
      images: [{ url: img, width: 1200, height: 630 }],
      type: 'website',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: business,
      description: ogDesc,
      images: [img],
    },
  };
}
