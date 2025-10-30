// app/api/paypal/webhook/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const {
  PAYPAL_ENV,
  PAYPAL_API_BASE = 'https://api-m.paypal.com',
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// Server-side Supabase (service role so we can update any user on webhook)
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

// Helper: PayPal access token
async function getPayPalAccessToken() {
  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    // No caching
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('PayPal token fetch failed');
  return res.json();
}

// Verify webhook with PayPal
async function verifySignature(headers, rawBody) {
  const access = await getPayPalAccessToken();

  const payload = {
    auth_algo: headers.get('paypal-auth-algo'),
    cert_url: headers.get('paypal-cert-url'),
    transmission_id: headers.get('paypal-transmission-id'),
    transmission_sig: headers.get('paypal-transmission-sig'),
    transmission_time: headers.get('paypal-transmission-time'),
    webhook_id: PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(rawBody),
  };

  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Verify call failed ${res.status}`);
  const json = await res.json();
  return json.verification_status === 'SUCCESS';
}

// Update your DB based on event
async function handleEvent(evt) {
  if (!supabaseAdmin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.');
    return;
  }

  // Common fields
  const type = evt?.event_type;
  const resource = evt?.resource || {};
  const subId = resource?.id || resource?.billing_agreement_id || null;

  // YOU set custom_id = userId when creating the subscription on the client
  const userId = resource?.custom_id || resource?.subscriber?.payer_id || null;

  // Upsert into your subscriptions table (adjust to your schema)
  if (userId && subId) {
    if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          provider: 'paypal',
          subscription_id: subId,
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } else if (type === 'BILLING.SUBSCRIPTION.CANCELLED' || type === 'BILLING.SUBSCRIPTION.SUSPENDED' || type === 'BILLING.SUBSCRIPTION.EXPIRED') {
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          provider: 'paypal',
          subscription_id: subId,
          status: 'inactive',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } else if (type === 'PAYMENT.SALE.COMPLETED') {
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          provider: 'paypal',
          subscription_id: subId,
          status: 'active',
          last_payment_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } else {
      // For any other events, just store/update status lightly
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          provider: 'paypal',
          subscription_id: subId,
          status: (resource?.status || '').toLowerCase() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }
  }

  // Optional: log the raw events in an audit table
  // await supabaseAdmin.from('subscription_events').insert({ user_id: userId, type, payload: evt });
}

export async function POST(req) {
  try {
    // Raw body is required for signature verification
    const raw = await req.text();

    // Verify signature
    const ok = await verifySignature(req.headers, raw);
    if (!ok) {
      console.warn('PayPal webhook verification FAILED');
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const event = JSON.parse(raw);

    // Act on the event
    await handleEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err?.message || err);
    // Always 200 to avoid PayPal retry storms; but log the error.
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
