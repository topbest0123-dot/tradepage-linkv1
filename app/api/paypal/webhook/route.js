// app/api/paypal/webhook/route.js  — v5
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

const VERSION = 'v5.0';

const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

/* ---------- PayPal helpers ---------- */
async function getPayPalAccessToken() {
  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`[webhook ${VERSION}] PayPal token fetch failed (${res.status})`);
  return res.json();
}

async function fetchSubscriptionFromPayPal(subId) {
  const access = await getPayPalAccessToken();
  const url = `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${access.access_token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`[webhook ${VERSION}] Fetch subscription ${subId} failed (${res.status})`);
  return res.json(); // contains custom_id, plan_id, subscriber, status, etc.
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

  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`[webhook ${VERSION}] Verify call failed ${res.status}`);
  const json = await res.json();
  return json.verification_status === 'SUCCESS';
}

/* ---------- DB writer ---------- */
async function handleEvent(evt) {
  if (!supabaseAdmin) {
    console.warn(`[webhook ${VERSION}] No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.`);
    return;
  }

  const type = evt?.event_type || '';
  const resource = evt?.resource || {};
  console.log(`[webhook ${VERSION}] incoming type=${type}`);

  // Try to detect subscription id from all known places
  let subId =
    resource?.id || // most SUBSCRIPTION.* events use this
    resource?.billing_agreement_id || // present on PAYMENT.SALE.COMPLETED
    resource?.supplementary_data?.related_ids?.subscription_id ||
    null;

  // Pull userId directly if present
  let userId =
    resource?.custom_id ||            // we set this when creating subscription
    resource?.subscriber?.payer_id || // sometimes present
    null;

  let planId = resource?.plan_id || null;
  let payerEmail =
    resource?.subscriber?.email_address ||
    resource?.payer?.email_address ||
    null;

  console.log(`[webhook ${VERSION}] initial parse → subId=${subId} userId=${userId} planId=${planId} email=${payerEmail}`);

  // If we have no user id but do have a subscription id, try DB first
  if (!userId && subId) {
    const { data: existing, error: exErr } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('subscription_id', subId)
      .maybeSingle();

    if (exErr) {
      console.warn(`[webhook ${VERSION}] DB lookup by subscription failed:`, exErr.message);
    }
    if (existing?.user_id) {
      userId = existing.user_id;
      console.log(`[webhook ${VERSION}] Resolved user from DB by subscription: ${userId}`);
    }
  }

  // If still no user id and we have a subId → fetch from PayPal
  if (!userId && subId) {
    try {
      const ppSub = await fetchSubscriptionFromPayPal(subId);
      userId = ppSub?.custom_id || ppSub?.subscriber?.payer_id || null;
      planId = planId || ppSub?.plan_id || null;
      payerEmail = payerEmail || ppSub?.subscriber?.email_address || null;
      console.log(`[webhook ${VERSION}] Resolved user from PayPal subscription: ${userId}`);
    } catch (e) {
      console.warn(`[webhook ${VERSION}] PayPal subscription fetch failed:`, e?.message || e);
    }
  }

  // Decide a status
  let status = (resource?.status || '').toLowerCase();
  if (/BILLING\.SUBSCRIPTION\.ACTIVATED/.test(type) || /PAYMENT\.SALE\.COMPLETED/.test(type)) status = 'active';
  if (/BILLING\.SUBSCRIPTION\.(CANCELLED|SUSPENDED|EXPIRED)/.test(type)) status = 'inactive';

  if (userId && subId) {
    const row = {
      user_id: userId,
      provider: 'paypal',
      subscription_id: subId,
      plan_id: planId,
      status: status || null,
      payer_email: payerEmail || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(row, { onConflict: 'user_id' });

    if (error) {
      console.error(`[webhook ${VERSION}] Supabase upsert error:`, error.message);
    } else {
      console.log(`[webhook ${VERSION}] Upserted subscription row`, { subId, userId, status });
    }
  } else {
    console.warn(`[webhook ${VERSION}] Missing userId or subId → skipping write`, { type, subId, userId });
  }
}

/* ---------- Debug (GET) ---------- */
export async function GET() {
  return NextResponse.json({ ok: true, version: VERSION, path: '/api/paypal/webhook', expects: 'POST' });
}

/* ---------- Main (POST) ---------- */
export async function POST(req) {
  try {
    const raw = await req.text();
    console.log(`[webhook ${VERSION}] POST hit`); // banner

    const ok = await verifySignature(req.headers, raw);
    if (!ok) {
      console.warn(`[webhook ${VERSION}] PayPal signature verification FAILED`);
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    await handleEvent(event);

    return NextResponse.json({ received: true, version: VERSION }, { status: 200 });
  } catch (err) {
    console.error(`[webhook ${VERSION}] error:`, err?.message || err);
    // Always 200 to prevent retry storms
    return NextResponse.json({ ok: true, version: VERSION }, { status: 200 });
  }
}
