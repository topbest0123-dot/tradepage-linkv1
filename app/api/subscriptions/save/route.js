// app/api/subscriptions/save/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');

    // Require a logged-in user (same pattern as your /api/profile/save)
    if (!token) {
      return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, subscription_id, plan_id, status, raw } = body || {};

    if (!provider || !subscription_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
          // Important: pass the user's access token so RLS allows row writes
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
    }

    // Assumes you already have a "subscriptions" table with RLS that allows
    // authenticated users to insert rows where user_id = auth.uid()
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        provider,
        subscription_id,
        plan_id: plan_id || null,
        status: status || 'approved',
        raw: raw || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
