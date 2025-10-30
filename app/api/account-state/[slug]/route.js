// app/api/account-state/[slug]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deriveAccountState } from '@/lib/accountState';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only
    { auth: { persistSession: false } }
  );

  // Does profile exist?
  const { data: p } = await sb
    .from('profiles')
    .select('slug')
    .ilike('slug', params.slug)
    .maybeSingle();

  if (!p) {
    return NextResponse.json({ state: 'not_found' }, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  // state: 'active' | 'trial' | 'expired'
  const out = await deriveAccountState(sb, params.slug);

  return NextResponse.json(out, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
