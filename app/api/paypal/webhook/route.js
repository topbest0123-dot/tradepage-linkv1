// app/api/paypal/webhook/route.mjs
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only key
);

// Map PayPal event -> internal status
function mapStatus(eventType = '') {
  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
    case 'BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED':
    case 'PAYMENT.SALE.COMPLETED':
    case 'PAYMENT.CAPTURE.COMPLETED':
      return 'active';

    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      return 'inactive';

    case 'PAYMENT.SALE.DENIED':
    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
      return 'past_due';

    default:
      return null; // unknown/neutral events
  }
}

function getLastPaymentAt(resource = {}) {
  // Try common fields where PayPal sticks a timestamp
  return (
    resource?.billing_info?.last_payment?.time ||
    resource?.create_time ||
    resource?.update_time ||
    resource?.time ||
    null
  );
}

async function findUserId(resource = {}) {
  // Prefer custom_id if you set it when creating the subscription
  let userId = resource?.custom_id || null;

  // Sub ID helps when you store subscription id on your side
  const subId = resource?.id || resource?.billing_agreement_id || null;

  if (!userId && subId) {
    const { data: row } = await supa
      .from('subscriptions')
      .select('user_id')
      .eq('paypal_sub_id', subId)
      .maybeSingle();
    userId = row?.user_id || null;
  }

  // Last resort: try matching subscriber email to profiles.email
  const email = resource?.subscriber?.email_address || null;
  if (!userId && email) {
    const { data: p } = await supa
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    userId = p?.id || null;
  }

  return { userId, subId };
}

export async function POST(req) {
  // Parse JSON safely
  let payload = {};
  try {
    payload = await req.json();
  } catch {
    const raw = await req.text();
    try { payload = JSON.parse(raw || '{}'); } catch {}
  }

  const eventType = payload?.event_type || payload?.eventType || '';
  const resource  = payload?.resource || {};

  // Always log minimal info to help debugging
  await supa.from('webhook_logs').insert({
    provider: 'paypal',
    event_type: eventType,
    sub_id: resource?.id || null,
    raw: payload
  }).catch(() => { /* ignore logging errors */ });

  // Map to status and last payment time
  const status = mapStatus(eventType);
  const lastPaymentAt = getLastPaymentAt(resource);

  // We still want to store the mapping even on non-status events (e.g., CREATED)
  const { userId, subId } = await findUserId(resource);

  // If we cannot resolve user, we’re done (but we logged the event)
  if (!userId) {
    return NextResponse.json({ ok: true, note: 'no-user-found' });
  }

  // Build patch
  const patch = {
    user_id: userId,
    provider: 'paypal',
    paypal_sub_id: subId,
    updated_at: new Date().toISOString()
  };
  if (status) patch.status = status;
  if (lastPaymentAt) patch.last_payment_at = new Date(lastPaymentAt).toISOString();

  // Upsert by user_id
  await supa
    .from('subscriptions')
    .upsert(patch, { onConflict: 'user_id' });

  return NextResponse.json({ ok: true });
}
