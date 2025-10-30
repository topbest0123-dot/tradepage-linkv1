import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PP_BASE =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalToken() {
  const res = await fetch(`${PP_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Failed to get PayPal token');
  const j = await res.json();
  return j.access_token;
}

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    // Verify the user from the Supabase bearer we sent from the client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: req.headers.get('authorization') || '' } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Call PayPal to cancel
    const token = await getPayPalToken();
    const res = await fetch(`${PP_BASE}/v1/billing/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'User requested cancellation' }),
    });

    if (!(res.status === 204 || res.ok)) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: t || 'Cancel failed' }, { status: 400 });
    }

    // Mark locally as cancelled (no-op if row not found)
    await supabase
      .from('subscriptions')
      .update({ status: 'CANCELLED', cancelled_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('subscription_id', id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || 'Server error' }, { status: 500 });
  }
}
