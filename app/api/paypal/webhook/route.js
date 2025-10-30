// app/api/paypal/webhook/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const {
  PAYPAL_ENV, // 'live' or 'sandbox'
  PAYPAL_API_BASE = 'https://api-m.paypal.com', // live default
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// ---- Supabase (service role) ----
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

// ---- Helpers: PayPal ----
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
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`PayPal token fetch failed (${res.status}) ${t}`);
  }
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

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.error('Verify call failed', res.status, t);
    return false;
  }
  const json = await res.json();
  return json.verification_status === 'SUCCESS';
}

// Fetch subscription details (to read custom_id, plan_id, subscriber email)
async function getSubscriptionDetails(subId) {
  const access = await getPayPalAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${encodeURIComponent(subId)}`,
    {
      headers: { Authorization: `Bearer ${access.access_token}` },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.warn('getSubscriptionDetails failed', res.status, t);
    return null;
  }
  return res.json();
}

// ---- DB write (insert or update) ----
async function upsertSubscriptionRow(row) {
  // row fields we expect to exist in your table:
  // user_id (uuid), subscription_id (text), plan_id (text),
  // status (text), payer_email (text)

  if (!supabaseAdmin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.');
    return;
  }

  // Check if a row for this user already exists
  const { data: existing, error: selErr } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', row.user_id)
    .maybeSingle();

  if (selErr && selErr.code !== 'PGRST116') {
    console.error('Select existing row error', selErr);
  }

  if (!existing) {
    const { error: insErr } = await supabaseAdmin
      .from('subscriptions')
      .insert(row);

    if (insErr) console.error('Insert error', insErr);
    else console.log('Insert ok for user', row.user_id);
  } else {
    const { error: updErr } = await supabaseAdmin
      .from('subscriptions')
      .update(row)
      .eq('user_id', row.user_id);

    if (updErr) console.error('Update error', updErr);
    else console.log('Update ok for user', row.user_id);
  }
}

// ---- Event handling ----
function mapStatusFromEvent(type, resource) {
  // Coarse mapping for your status column
  if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') return 'active';
  if (
    type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
    type === 'BILLING.SUBSCRIPTION.EXPIRED'
  ) {
    return 'inactive';
  }
  if (type === 'PAYMENT.SALE.COMPLETED') return 'active';
  // fallback to resource.status if present
  return (resource?.status || '').toLowerCase() || null;
}

async function handleEvent(evt) {
  const type = evt?.event_type;
  const resource = evt?.resource || {};

  // Subscription ID may appear in different fields depending on event type
  const subId =
    resource?.id ||
    resource?.subscription_id ||
    resource?.billing_agreement_id ||
    null;

  let userId = resource?.custom_id || resource?.subscriber?.payer_id || null;
  let planId = resource?.plan_id || null;
  let payerEmail =
    resource?.subscriber?.email_address || resource?.payer?.email_address || null;

  if (!subId) {
    console.warn('No subscription id found in event → skipping');
    return;
  }

  // Pull details from PayPal if we’re missing custom_id/plan/email
  if (!userId || !planId || !payerEmail) {
    const details = await getSubscriptionDetails(subId);
    if (details) {
      userId = userId || details?.custom_id || null;
      planId = planId || details?.plan_id || null;
      payerEmail =
        payerEmail ||
        details?.subscriber?.email_address ||
        details?.subscriber?.email_address ||
        null;
    }
  }

  if (!userId) {
    console.warn('No userId (custom_id) on event/subscription → skipping write');
    return;
  }

  const status = mapStatusFromEvent(type, resource);

  const row = {
    user_id: userId,
    subscription_id: subId,
    plan_id: planId,
    status,
    payer_email: payerEmail,
  };

  console.log('Writing subscription row:', row);
  await upsertSubscriptionRow(row);
}

// ---- Optional GET to sanity-check the route ----
export async function GET() {
  return NextResponse.json({
    ok: true,
    path: '/api/paypal/webhook',
    expects: 'POST',
    env: PAYPAL_ENV || 'live',
  });
}

// ---- POST webhook ----
export async function POST(req) {
  try {
    const raw = await req.text();

    // Verify the signature
    const ok = await verifySignature(req.headers, raw);
    if (!ok) {
      console.warn('PayPal webhook verification FAILED');
      // 400 so you can see failures in Event Logs (we still protect against storms in catch)
      return NextResponse.json({ status: 'ignored' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    console.log('Webhook event:', event?.event_type, '->', event?.resource?.id || event?.resource?.billing_agreement_id);

    await handleEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err?.message || err);
    // Still return 200 to avoid PayPal retry storms on server errors
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
