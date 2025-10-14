// app/[slug]/page.jsx  (SERVER COMPONENT)

import { createClient } from '@supabase/supabase-js';
import PublicPage from '@/components/PublicPage'; // client component below

export const dynamic = 'force-dynamic';  // always fetch fresh
export const revalidate = 0;

export default async function Page({ params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data: p, error } = await sb
    .from('profiles')
    .select(`
      slug,name,trade,city,
      phone,whatsapp,
      about,areas,services,prices,hours,
      facebook,instagram,tiktok,x,youtube,
      avatar_path,other_info,theme,location,location_url
    `)

    const mapsHref = useMemo(() => {
  if (p?.location_url && /^https?:\/\//i.test(p.location_url)) return p.location_url;

  // Fallback: build a Google Maps search from name + (location || city)
  const q = [p?.name, p?.location || p?.city].filter(Boolean).join(' ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}, [p]);

    
    .ilike('slug', params.slug)
    .maybeSingle();

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ opacity: .8 }}>This page doesn’t exist yet.</p>
        <pre style={{ opacity: .7 }}>{error.message}</pre>
      </div>
    );
  }
  if (!p) {
    return <div style={{ padding: 24 }}>This page doesn’t exist yet.</div>;
  }

  return <PublicPage profile={p} />;
}
