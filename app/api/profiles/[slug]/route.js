// app/api/profiles/[slug]/route.js
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(_req, { params }) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only key, bypasses RLS
      { auth: { persistSession: false } }
    );

    const { data, error } = await sb
      .from('profiles')
      .select('name, trade, city, coty, about, avatar_url, avatar_path, updated_at')
      .eq('slug', params.slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: { 'cache-control': 'no-store' } });
    }
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'cache-control': 'no-store' } });
    }

    // Normalize city (handles legacy "coty")
    const city = data.city || data.coty || '';

    // Build a public avatar URL:
    // 1) if avatar_url is already a full https URL, use it
    // 2) else build from storage: <SUPA_URL>/storage/v1/object/public/avatars/<avatar_path>
    let image =
      (data.avatar_url && /^https?:\/\//i.test(data.avatar_url))
        ? data.avatar_url
        : (data.avatar_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_path}`
            : null);

    return NextResponse.json(
      {
        name: data.name || '',
        trade: data.trade || '',
        city,
        about: data.about || '',
        image,                              // public URL (or null)
        updated_at: data.updated_at || null // useful for cache-busting
      },
      { headers: { 'cache-control': 'no-store' } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
