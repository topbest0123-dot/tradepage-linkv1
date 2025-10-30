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
  if (!res.ok) throw new Error(`PayPal token fetch failed (${res.status})`);
  return res.json();
}

async function fetchSubscriptionFromPayPal(subId) {
  const access = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}`, {
    headers: { Authorization: `Bearer ${access.access_token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch subscription ${subId} failed (${res.status})`);
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

  if (!res.ok) throw new Error(`Verify call failed ${res.status}`);
  const json = await res.json();
  return json.verification_status === 'SUCCESS';
}

/* ---------- DB writer ---------- */
async function handleEvent(evt) {
  if (!supabaseAdmin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.');
    return;
  }

  const type = evt?.event_type || '';
  const resource = evt?.resource || {};

  // Try to determine subscription id from different event shapes
  let subId =
    resource?.id || // for many SUBSCRIPTION.* events this is the subscription id
    resource?.billing_agreement_id || // present on PAYMENT.SALE.COMPLETED
    resource?.supplementary_data?.related_ids?.subscription_id ||
    null;

  // Try to get user id from the event, or we will fetch it
  let userId =
    resource?.custom_id ||            // what we set in createSubscription
    resource?.subscriber?.payer_id || // sometimes present
    null;

  // Best-effort metadata
  let planId = resource?.plan_id || null;
  let payerEmail =
    resource?.subscriber?.email_address ||
    resource?.payer?.email_address ||
    null;

  // If we have no user id, try to look up an existing row by subscription
  if (!userId && subId) {
    const { data: existing, error: exErr } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('subscription_id', subId)
      .maybeSingle();

    if (!exErr && existing?.user_id) {
      userId = existing.user_id;
      console.log('[webhook] Resolved user from DB by subscription:', { subId, userId });
    }
  }

  // If still no user id, fetch the subscription from PayPal (gives custom_id, plan, subscriber)
  if (!userId && subId) {
    try {
      const ppSub = await fetchSubscriptionFromPayPal(subId);
      userId = ppSub?.custom_id || ppSub?.subscriber?.payer_id || null;
      planId = planId || ppSub?.plan_id || null;
      payerEmail = payerEmail || ppSub?.subscriber?.email_address || null;
      console.log('[webhook] Resolved user from PayPal subscription:', { subId, userId });
    } catch (e) {
      console.warn('[webhook] PayPal subscription fetch failed:', e?.message || e);
    }
  }

  // Decide a reasonable status
  let status = (resource?.status || '').toLowerCase();
  if (/BILLING\.SUBSCRIPTION\.ACTIVATED/.test(type) || /PAYMENT\.SALE\.COMPLETED/.test(type)) {
    status = 'active';
  }
  if (
    /BILLING\.SUBSCRIPTION\.CANCELLED/.test(type) ||
    /BILLING\.SUBSCRIPTION\.SUSPENDED/.test(type) ||
    /BILLING\.SUBSCRIPTION\.EXPIRED/.test(type)
  ) {
    status = 'inactive';
  }

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

    // Upsert by user_id (your current schema). If you later add a unique index on subscription_id,
    // you can change onConflict to 'subscription_id'.
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(row, { onConflict: 'user_id' });

    if (error) {
      console.error('[webhook] Supabase upsert error:', error.message);
    } else {
      console.log('[webhook] Upserted subscription row:', { subId, userId, status });
    }
  } else {
    console.warn('[webhook] Missing userId or subId → skipping write', { type, subId, userId });
  }
}

/* ---------- Debug (GET) ---------- */
export async function GET() {
  return NextResponse.json({ ok: true, path: '/api/paypal/webhook', expects: 'POST' });
}

/* ---------- Main (POST) ---------- */
export async function POST(req) {
  try {
    const raw = await req.text();

    const ok = await verifySignature(req.headers, raw);
    if (!ok) {
      console.warn('[webhook] PayPal signature verification FAILED');
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    await handleEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[webhook] error:', err?.message || err);
    // Always 200 to prevent PayPal retry storms
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
