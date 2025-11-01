// app/api/paypal/webhook/route.mjs
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  // read raw text then parse (Paypal sends JSON)
  let body = {};
  try {
    body = await req.json();
  } catch {
    const raw = await req.text();
    try { body = JSON.parse(raw || '{}'); } catch {}
  }

  const eventType = body?.event_type || body?.eventType || '';
  const resource  = body?.resource || {};

  // map event → status + last payment time (tweak if your schema differs)
  let status;               // 'active' | 'inactive' | 'past_due'
  let lastPaymentAt = null;

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
      status = 'active';
      lastPaymentAt = resource?.billing_info?.last_payment?.time || null;
      break;
    case 'PAYMENT.SALE.COMPLETED':
      status = 'active';
      lastPaymentAt = resource?.create_time || new Date().toISOString();
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      status = 'inactive';
      break;
    case 'PAYMENT.SALE.DENIED':
    case 'PAYMENT.SALE.REFUNDED':
      status = 'past_due';
      break;
    default:
      // accept unknown events quietly
      return NextResponse.json({ ok: true, ignored: true });
  }

  // identify the user this event belongs to (ensure you store one of these IDs when creating the sub)
  const userId =
    resource?.custom_id || resource?.subscriber?.payer_id || resource?.payer_id || null;

  if (userId && status) {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // server-only
    );

    await supa.from('subscriptions').upsert(
      {
        user_id: userId,
        status,
        provider: 'paypal',
        last_payment_at: lastPaymentAt ? new Date(lastPaymentAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  }

  return NextResponse.json({ ok: true });
}
