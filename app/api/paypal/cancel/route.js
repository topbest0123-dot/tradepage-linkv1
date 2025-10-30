// app/api/paypal/cancel/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const base = process.env.PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function POST(req) {
  try {
    const { id } = await req.json();          // PayPal subscription id
    if (!id) return NextResponse.json({ ok:false, error:'Missing id' }, { status:400 });

    // verify caller (must be the owner)
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ ok:false, error:'Missing bearer token' }, { status:401 });

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:'Unauthenticated' }, { status:401 });

    // check DB ownership
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { data: sub } = await service.from('subscriptions')
      .select('subscription_id,user_id').eq('subscription_id', id).maybeSingle();
    if (!sub)  return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
    if (sub.user_id !== user.id) return NextResponse.json({ ok:false, error:'Forbidden' }, { status:403 });

    // cancel at PayPal
    const { access_token } = await getAccessToken();
    const r = await fetch(`${base}/v1/billing/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization:`Bearer ${access_token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ reason: 'User cancelled from dashboard' })
    });
    if (!r.ok) return NextResponse.json({ ok:false, error:await r.text() }, { status:400 });

    // update local DB
    await service.from('subscriptions')
      .update({ status:'CANCELLED', update_time:new Date().toISOString() })
      .eq('subscription_id', id);

    return NextResponse.json({ ok:true });
  } catch (e) {
    console.error('Cancel error', e);
    return NextResponse.json({ ok:false, error:String(e) }, { status:500 });
  }
}
