// app/api/profiles/[slug]/route.js
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(_req, { params }) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only key
      { auth: { persistSession: false } }
    );

    const { data, error } = await sb
      .from('profiles')
      .select('name,about,avatar_url,avatar_path')
      .eq('slug', params.slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: { 'cache-control': 'no-store' } });
    }

    // Build a public image URL for convenience
    let image =
      (data?.avatar_url && /^https?:\/\//i.test(data.avatar_url))
        ? data.avatar_url
        : (data?.avatar_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_path}`
            : null);

    return NextResponse.json(
      { ...data, image },
      { headers: { 'cache-control': 'no-store' } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
