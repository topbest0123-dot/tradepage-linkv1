// app/api/paypal/webhook/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

const {
  PAYPAL_ENV = 'sandbox',
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env;

const PP_BASE = PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const supabaseAdmin = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Get a PayPal API bearer token
async function getPayPalToken() {
  const body = new URLSearchParams({ grant_type: 'client_credentials' }).toString();
  const res = await fetch(`${PP_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });
  if (!res.ok) throw new Error('paypal_oauth_failed');
  const json = await res.json();
  return json.access_token;
}

// Ask PayPal to verify the webhook signature
async function verifyWithPayPal(headers, eventObj, rawBody) {
  const token = await getPayPalToken();
  const payload = {
    transmission_id: headers.get('paypal-transmission-id'),
    transmission_time: headers.get('paypal-transmission-time'),
    cert_url: headers.get('paypal-cert-url'),
    auth_algo: headers.get('paypal-auth-algo'),
    transmission_sig: headers.get('paypal-transmission-sig'),
    webhook_id: PAYPAL_WEBHOOK_ID,          // YOUR webhook id from dashboard (sandbox/live)
    webhook_event: eventObj                  // object, not string
  };

  const res = await fetch(`${PP_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const out = await res.json();
  return out.verification_status === 'SUCCESS';
}

// Upsert subscription data you care about
async function recordEvent(event) {
  // Only touch the DB for subscription events
  const t = event.event_type || '';
  if (!t.startsWith('BILLING.SUBSCRIPTION')) return;

  const r = event.resource || {};
  const row = {
    // core identifiers
    subscription_id: r.id ?? null,
    plan_id: r.plan_id ?? null,
    status: r.status ?? null,

    // optional details
    payer_email: r?.subscriber?.email_address ?? null,
    payer_id: r?.subscriber?.payer_id ?? null,
    next_billing_time: r?.billing_info?.next_billing_time ?? null,
    update_time: r.update_time ?? r.create_time ?? new Date().toISOString(),

    // bookkeeping
    event_id: event.id ?? null,
    event_type: t,
    raw: event
  };

  // NOTE: associate to your user_id if you pass custom_id on createSubscription
  // In Subscriptions API v1, custom_id sits at resource.custom_id (when you set it)
  const customId = r.custom_id || null;
  if (customId) row.user_id = customId;

  // Upsert by subscription_id if present, otherwise by event_id
  const match = row.subscription_id ? { subscription_id: row.subscription_id } : { event_id: row.event_id };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(row, { onConflict: 'subscription_id' })  // needs a unique index on subscription_id
    .eq(Object.keys(match)[0], Object.values(match)[0]);

  if (error) throw error;
}

export async function POST(req) {
  try {
    // IMPORTANT: read raw body first (don’t call req.json() before verification)
    const raw = await req.text();
    const eventObj = JSON.parse(raw);

    // Verify signature with PayPal
    const ok = await verifyWithPayPal(req.headers, eventObj, raw);
    if (!ok) {
      // Fail closed for security; PayPal will retry. Log for debugging in Vercel logs.
      console.error('PayPal webhook verify FAILED', { id: eventObj.id, type: eventObj.event_type });
      return new Response('verify_failed', { status: 400 });
    }

    // Record subscription events
    try {
      await recordEvent(eventObj);
    } catch (dbErr) {
      console.error('Webhook DB insert error', dbErr);
      // Still return 200 so PayPal stops retrying; you can Resend later once fixed
    }

    return new Response('ok');
  } catch (e) {
    console.error('Webhook handler error', e);
    // Return 200 to avoid endless retries, but log the error
    return new Response('ok');
  }
}

// (Optional) simple health check
export async function GET() {
  return new Response('ok');
}
