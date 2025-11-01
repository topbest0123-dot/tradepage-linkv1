// app/api/paypal/webhook/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const {
  PAYPAL_API_BASE = 'https://api-m.paypal.com',
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// --- Supabase admin client (service role) ---
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

// --- Helpers ---
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

async function fetchSubscriptionDetails(subscriptionId) {
  const access = await getPayPalAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${access.access_token}` },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    throw new Error(
      `Fetch subscription ${subscriptionId} failed (${res.status})`
    );
  }
  return res.json();
}

// Normalizes + writes to DB
async function upsertSubscription({ userId, subId, type, resource }) {
  if (!supabaseAdmin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY → skipping DB write.');
    return;
  }

  // Minimal fields we can get from any event
  let row = {
    user_id: userId || null,
    subscription_id: subId || null,
    status: (resource?.status || '').toLowerCase() || 'active',
    custom_id: resource?.custom_id || resource?.custom || null,
    update_time: new Date().toISOString(),
  };

  // Decide whether we should fetch full details
  const isBillingEvent =
    type?.startsWith('BILLING.SUBSCRIPTION.') === true;

  // If we need more details (plan_id, payer_email, times), call Subscriptions API
  try {
    if ((isBillingEvent || !row.custom_id || !row.status || !row.user_id) && subId) {
      const details = await fetchSubscriptionDetails(subId);
      // Typical useful fields
      row = {
        ...row,
        plan_id: details?.plan_id || row.plan_id || null,
        payer_email:
          details?.subscriber?.email_address || row.payer_email || null,
        start_time: details?.start_time
          ? new Date(details.start_time).toISOString()
          : row.start_time || null,
        next_billing_time:
          details?.billing_info?.next_billing_time
            ? new Date(details.billing_info.next_billing_time).toISOString()
            : row.next_billing_time || null,
        status: (details?.status || row.status || '').toLowerCase(),
      };
    }
  } catch (e) {
    // Not fatal for write; we still upsert what we have
    console.warn('Subscription details fetch failed:', e?.message || e);
  }

  // Final guard: require userId + subId to write
  if (!row.user_id || !row.subscription_id) {
    console.warn('No userId/subId → skipping write', { row, type });
    return;
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    console.error('Supabase upsert error:', error);
  } else {
    console.log(
      `Supabase upsert ok: { userId: '${row.user_id}', subscriptionId: '${row.subscription_id}', status: '${row.status}', planId: ${row.plan_id || null} }`
    );
  }
}

// --- Public handlers ---
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

    const evt = JSON.parse(raw);
    const type = evt?.event_type;
    const resource = evt?.resource || {};// make sure you have an admin client here
// (service role key is required for server updates)
import { createClient } from '@supabase/supabase-js';
const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server key
);

// helper to update by PayPal subscription id
async function markPaid(subId: string | undefined, paidAtISO: string | undefined) {
  if (!subId) return;
  await supa
    .from('subscriptions')
    .update({
      provider: 'paypal',
      last_payment_at: paidAtISO ?? new Date().toISOString(),
      status: 'active', // optional: keep your current behavior
    })
    .eq('subscription_id', subId); // ← adjust if your column is named differently
}

// 1) Subscription activated — set provider upfront
if (body?.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
  const subId = body?.resource?.id;
  await supa.from('subscriptions').update({ provider: 'paypal', status: 'active' })
    .eq('subscription_id', subId);
}

// 2) Successful subscription payment (primary signal)
if (body?.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED') {
  const subId   = body?.resource?.id || body?.resource?.subscription_id;
  const paidISO = body?.resource?.billing_info?.last_payment?.time || body?.create_time;
  await markPaid(subId, paidISO);
}

// 3) Fallbacks some merchants see from PayPal
//    (sale/capture events can arrive with a link to the subscription)
if (body?.event_type === 'PAYMENT.SALE.COMPLETED') {
  const subId   = body?.resource?.billing_agreement_id;
  const paidISO = body?.resource?.create_time;
  await markPaid(subId, paidISO);
}
if (body?.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
  const subId   = body?.resource?.supplementary_data?.related_ids?.billing_agreement_id;
  const paidISO = body?.resource?.create_time || body?.resource?.update_time;
  await markPaid(subId, paidISO);
}


    // Extract identifiers from either SALE or BILLING events
    const subId =
      resource?.id || resource?.billing_agreement_id || null;

    // When you created the subscription you set custom_id = userId
    const userId =
      resource?.custom_id || resource?.custom || resource?.subscriber?.payer_id || null;

    await upsertSubscription({ userId, subId, type, resource });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err?.message || err);
    // Return 200 to avoid PayPal retry storms; we already log the error
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
