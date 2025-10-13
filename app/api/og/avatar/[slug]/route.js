// app/api/og/avatar/[slug]/route.js
export const runtime = 'nodejs';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';

export async function GET(_req, { params }) {
  try {
    // 1) Read avatar fields directly from DB with service key (bypasses RLS for read)
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { data, error } = await sb
      .from('profiles')
      .select('avatar_url, avatar_path')
      .eq('slug', params.slug)
      .maybeSingle();

    if (error) throw error;

    // 2) Choose image URL: full URL in avatar_url OR public URL from the 'avatars' bucket + avatar_path
    let image =
      (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url))
        ? data.avatar_url
        : (data?.avatar_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_path}`
            : null);

    if (!image) {
      // No avatar set → redirect to your default OG image
      return Response.redirect('https://www.tradepage.link/og-default.png', 307);
    }

    // 3) Fetch bytes and return them with solid cache headers (scrapers respect these)
    const imgRes = await fetch(image, { cache: 'no-store' });
    if (!imgRes.ok) {
      return Response.redirect('https://www.tradepage.link/og-default.png', 307);
    }

    const buffer = await imgRes.arrayBuffer();
    const type = imgRes.headers.get('content-type') || 'image/png';

    return new Response(buffer, {
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return Response.redirect('https://www.tradepage.link/og-default.png', 307);
  }
}
