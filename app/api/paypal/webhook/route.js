// app/api/paypal/webhook/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const {
  PAYPAL_ENV, // 'sandbox' | 'live'
  PAYPAL_API_BASE,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// Pick the correct base; allow explicit override by PAYPAL_API_BASE
const API_BASE =
  PAYPAL_API_BASE ||
  (PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com');

// Server-side Supabase (service role so we can update any user on webhook)
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

// ---- Helpers ----

// Get PayPal access token
async function getPayPalAccessToken() {
  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    'base64',
  );
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal token fetch failed: ${res.status}`);
  return res.json(); // { access_token, ... }
}

// Verify webhook signature with PayPal
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

  const res = await fetch(
    `${API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
  );

  if (!res.ok) throw new Error(`Verify call failed ${res.status}`);
  const json = await res.json();
  return json.verification_status === 'SUCCESS';
}

// Fetch subscription details (to obtain custom_id if missing on the event)
async function fetchSubscriptionDetails(subId) {
  const access = await getPayPalAccessToken();
  const res = await fetch(`${API_BASE}/v1/billing/subscriptions/${subId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${access.access_token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch subscription ${subId} failed: ${res.status}`);
  return res.json(); // includes custom_id if set during creation
}

// ---- Core: act on the event ----
async function handleEvent(evt) {
  if (!supabaseAdmin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.');
    return;
  }

  const type = evt?.event_type;
  const resource = evt?.resource || {};

  // Subscription id can live in a few places depending on event type
  let subId =
    resource?.id || // typical for subscription resource events
    resource?.billing_agreement_id || // common on SALE events
    resource?.supplementary_data?.related_ids?.billing_agreement_id ||
    null;

  // Your userId: ideally set as custom_id when creating the subscription
  let userId =
    resource?.custom_id || // best source
    resource?.subscriber?.payer_id || // fallback (not your app user id)
    null;

  // If we don't know userId yet but we know the subscription id, fetch it
  if (!userId && subId) {
    try {
      const sub = await fetchSubscriptionDetails(subId);
      userId = sub?.custom_id || userId;
    } catch (e) {
      console.warn('Could not fetch subscription details:', e?.message || e);
    }
  }

  // If either is missing, we can't upsert a user-bound subscription record
  if (!userId || !subId) {
    console.warn('Missing userId or subId; skipping upsert.', {
      type,
      subId,
      hasUserId: !!userId,
    });
    return;
  }

  const now = new Date().toISOString();

  if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        provider: 'paypal',
        subscription_id: subId,
        status: 'active',
        updated_at: now,
      },
      { onConflict: 'user_id' },
    );
  } else if (
    type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
    type === 'BILLING.SUBSCRIPTION.EXPIRED'
  ) {
    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        provider: 'paypal',
        subscription_id: subId,
        status: 'inactive',
        updated_at: now,
      },
      { onConflict: 'user_id' },
    );
  } else if (type === 'PAYMENT.SALE.COMPLETED') {
    // Mark active and note the last successful payment
    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        provider: 'paypal',
        subscription_id: subId,
        status: 'active',
        last_payment_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    );
  } else {
    // Generic catch-all update (keeps subscription_id and status in sync)
    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        provider: 'paypal',
        subscription_id: subId,
        status: (resource?.status || '').toLowerCase() || null,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    );
  }

  // Optional audit log
  // await supabaseAdmin.from('subscription_events').insert({
  //   user_id: userId,
  //   type,
  //   payload: evt,
  //   created_at: now
  // });
}

// ---- Routes ----

// Simple GET to confirm the endpoint is reachable
export async function GET() {
  return NextResponse.json({
    ok: true,
    path: '/api/paypal/webhook',
    expects: 'POST',
  });
}

export async function POST(req) {
  try {
    // Raw body is required for PayPal signature verification
    const raw = await req.text();

    const ok = await verifySignature(req.headers, raw);
    if (!ok) {
      console.warn('PayPal webhook verification FAILED');
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    await handleEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err?.message || err);
    // Avoid retry storms: return 200 but keep the error in logs
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
