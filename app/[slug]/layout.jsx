// app/[slug]/layout.jsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const base = 'https://www.tradepage.link';

  // Read profile from your server API (which already builds a public avatar URL)
  const res = await fetch(`${base}/api/profiles/${encodeURIComponent(params.slug)}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  const data = res.ok ? await res.json() : null;

  const business = (data?.name || 'Trade Page').trim();
  const ogTitle = business; // append city later if/when you add that column

  // ✅ Browser tab + meta description (fixed)
  const metaDescription = 'Trade Page Link — Your business in a link.';

  // ✅ OG/Twitter description (first lines of About, or fallback)
  const ogDescription =
    ((data?.about || '').replace(/\s+/g, ' ').slice(0, 200)) ||
    'Your business in a link.';

  // ✅ OG/Twitter image (avatar or fallback)
  const image = data?.image || `${base}/og-default.png`;
  const url = `${base}/${params.slug}`;

  return {
    // Tab text
    title: { absolute: 'Trade Page Link' },

    // <meta name="description">
    description: metaDescription,

    // Open Graph
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
      url,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
  };
}

export default function SlugLayout({ children }) {
  return children;
}
