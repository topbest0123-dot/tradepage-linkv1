// app/api/paypal/webhook/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const {
  PAYPAL_API_BASE = 'https://api-m.paypal.com', // live
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// Server-side Supabase (service role)
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

// ---- Utils ---------------------------------------------------------------

async function getPayPalAccessToken() {
  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    'base64'
  );
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('PayPal token fetch failed');
  return res.json();
}

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
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  );
  if (!res.ok) throw new Error(`Verify call failed ${res.status}`);
  const json = await res.json();
  return json.verification_status === 'SUCCESS';
}

// Robust extractors: work for sale + subscription payloads
function extractUserId(resource = {}) {
  // PayPal SALE → "custom"
  // PayPal SUBSCRIPTION → sometimes "custom_id"
  return (
    resource.custom_id ||
    resource.custom || // <— this is what your live payload has
    resource?.subscriber?.payer_id ||
    null
  );
}

function extractSubscriptionId(resource = {}) {
  // Prefer explicit id, else billing agreement id, else related ids
  return (
    resource.id ||
    resource.billing_agreement_id ||
    resource?.supplementary_data?.related_ids?.billing_agreement_id ||
    null
  );
}

async function upsertSubscription({
  userId,
  subscriptionId,
  status,
  planId,
  payerEmail,
  lastPaymentAt,
}) {
  if (!supabaseAdmin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.');
    return;
  }

  const payload = {
    user_id: userId,
    provider: 'paypal',
    subscription_id: subscriptionId,
    status,
    plan_id: planId ?? null,
    payer_email: payerEmail ?? null,
    updated_at: new Date().toISOString(),
  };
  if (lastPaymentAt) payload.last_payment_at = lastPaymentAt;

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('Supabase upsert error:', error);
  } else {
    console.log('Supabase upsert ok:', {
      userId,
      subscriptionId,
      status,
      planId: planId ?? null,
    });
  }
}

// ---- Event handler -------------------------------------------------------

async function handleEvent(evt) {
  const type = evt?.event_type;
  const r = evt?.resource || {};

  const userId = extractUserId(r);
  const subscriptionId = extractSubscriptionId(r);
  const planId = r?.plan_id || r?.plan?.id || null;
  const payerEmail =
    r?.payer?.email || r?.payer?.email_address || r?.subscriber?.email || null;

  console.log('PP webhook:', {
    type,
    hasCustom: !!r.custom,
    hasCustomId: !!r.custom_id,
    userId,
    subscriptionId,
    planId,
  });

  if (!userId) {
    console.warn('No userId (custom/custom_id/subscriber) → skipping write');
    return;
  }

  // Default status resolution
  let status = (r?.status || '').toLowerCase() || null;
  if (
    type === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
    type === 'PAYMENT.SALE.COMPLETED'
  ) {
    status = 'active';
  }
  if (
    type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
    type === 'BILLING.SUBSCRIPTION.EXPIRED'
  ) {
    status = 'inactive';
  }

  // last payment timestamp for SALES
  const lastPaymentAt =
    type === 'PAYMENT.SALE.COMPLETED'
      ? new Date().toISOString()
      : null;

  await upsertSubscription({
    userId,
    subscriptionId,
    status,
    planId,
    payerEmail,
    lastPaymentAt,
  });

  // Optional event audit
  // await supabaseAdmin.from('subscription_events').insert({
  //   user_id: userId,
  //   type,
  //   payload: evt,
  // });
}

// ---- Routes --------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    ok: true,
    path: '/api/paypal/webhook',
    expects: 'POST',
  });
}

export async function POST(req) {
  try {
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
    // Always 200 to avoid PayPal storm retries
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
