// app/api/paypal/attach/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We verify the caller with their Supabase access token (Bearer).
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing bearer token' }, { status: 401 });
    }

    const { subscription_id } = await req.json();
    if (!subscription_id) {
      return NextResponse.json({ ok: false, error: 'Missing subscription_id' }, { status: 400 });
    }

    // Identify the user from the provided token
    const supaUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
    );
    const { data: { user } } = await supaUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthenticated' }, { status: 401 });
    }

    // Service key to update the DB
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    // Attach only if the row exists and is not already owned
    const { error } = await service
      .from('subscriptions')
      .update({ user_id: user.id })
      .eq('subscription_id', subscription_id)
      .is('user_id', null);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('attach-sub error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
