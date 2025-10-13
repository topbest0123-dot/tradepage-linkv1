// app/api/og/avatar/[slug]/route.js
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(_req, { params }) {
  const base = 'https://www.tradepage.link';

  // Get the public avatar URL from your existing API
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });

  if (!res.ok) {
    // Fallback to default OG
    return Response.redirect(`${base}/og-default.png`, 307);
  }
  const data = await res.json();
  const image = data?.image || `${base}/og-default.png`;

  // Fetch the image bytes so we control headers (scrapers obey these)
  const ires = await fetch(image, { cache: 'no-store' });
  if (!ires.ok) return Response.redirect(`${base}/og-default.png`, 307);

  const buf = await ires.arrayBuffer();
  const type = ires.headers.get('content-type') || 'image/png';

  return new Response(buf, {
    headers: {
      'content-type': type,
      // Long cache on this URL; we’ll bust via the ?v= param when avatar changes
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
