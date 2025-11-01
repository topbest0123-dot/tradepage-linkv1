// app/api/paypal/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // PayPal sends JSON; if you later add signature verification you may want raw body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // fallback if content-type wasn't json
    const raw = await req.text();
    try { body = JSON.parse(raw || '{}'); } catch {}
  }

  const eventType: string = body?.event_type ?? body?.eventType ?? '';
  const resource = body?.resource ?? {};

  // Build a Supabase *admin* client (server-only key)
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // DO NOT expose to client
  );

  // Map event → subscription status + last_payment_at
  let status: 'active' | 'inactive' | 'past_due' | undefined;
  let lastPaymentAt: string | null = null;

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
      status = 'active';
      lastPaymentAt = resource?.billing_info?.last_payment?.time ?? null;
      break;

    case 'PAYMENT.SALE.COMPLETED':
      status = 'active';
      lastPaymentAt = resource?.create_time ?? new Date().toISOString();
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
      // accept unknown events without failing the webhook
      return NextResponse.json({ ok: true, ignored: true });
  }

  // Identify which user this event belongs to (adjust to your mapping)
  // Prefer a stable ID you store when creating the PayPal subscription:
  // e.g., use `custom_id` or `subscriber.payer_id` that you saved as subscriptions.user_id
  const userId: string | undefined =
    resource?.custom_id || resource?.subscriber?.payer_id || resource?.payer_id;

  if (userId && status) {
    await supa
      .from('subscriptions')
      .upsert(
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
