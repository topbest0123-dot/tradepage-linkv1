// app/api/paypal/webhook/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const base = process.env.PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error('PayPal token error: ' + t);
  }
  return res.json();
}

async function verifySignature(req, bodyJson) {
  const { access_token } = await getAccessToken();

  const verification = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth_algo: req.headers.get('paypal-auth-algo'),
      cert_url: req.headers.get('paypal-cert-url'),
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: bodyJson
    })
  });

  const vr = await verification.json();
  return vr.verification_status === 'SUCCESS';
}

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function upsertFromEvent(event) {
  const { event_type, resource, create_time } = event;

  // Subscriptions payload shape
  // resource.id = subscription_id
  // resource.status, resource.plan_id, resource.custom_id, resource.billing_info.next_billing_time, resource.subscriber.email_address
  const subId = resource?.id;
  if (!subId) return;

  const patch = {
    subscription_id: subId,
    plan_id: resource?.plan_id || null,
    status: resource?.status || null,
    payer_email: resource?.subscriber?.email_address || null,
    custom_id: resource?.custom_id || null,
    start_time: resource?.start_time ? new Date(resource.start_time).toISOString() : null,
    update_time: resource?.update_time ? new Date(resource.update_time).toISOString() : new Date(create_time || Date.now()).toISOString(),
    next_billing_time: resource?.billing_info?.next_billing_time ? new Date(resource.billing_info.next_billing_time).toISOString() : null,
    raw: event
  };

  // If custom_id is our Supabase user_id, attach it
  if (resource?.custom_id) {
    patch.user_id = resource.custom_id;
  }

  // PAYMENT.SALE.COMPLETED (recurring charge) uses a different shape
  if (event_type === 'PAYMENT.SALE.COMPLETED') {
    const subViaAgreement = resource?.billing_agreement_id; // = subscription_id
    if (subViaAgreement) {
      patch.subscription_id = subViaAgreement;
      patch.last_payment_time = resource?.create_time ? new Date(resource.create_time).toISOString() : new Date().toISOString();
      patch.status = 'ACTIVE'; // keep active if payments keep coming
    }
  }

  // Upsert by subscription_id
  await serviceSupabase.from('subscriptions').upsert(patch, { onConflict: 'subscription_id' });
}

export async function POST(req) {
  try {
    // We need the raw body for signature verification
    const raw = await req.text();
    const event = JSON.parse(raw);

    const ok = await verifySignature(req, event);
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'Bad signature' }, { status: 400 });
    }

    // Handle key subscription lifecycle + payment events
    // BILLING.SUBSCRIPTION.CREATED / ACTIVATED / SUSPENDED / CANCELLED / EXPIRED
    // PAYMENT.SALE.COMPLETED (each successful charge)
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'PAYMENT.SALE.COMPLETED':
        await upsertFromEvent(event);
        break;
      default:
        // ignore everything else
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Webhook error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
