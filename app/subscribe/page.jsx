// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);

export default function SubscribePage() {
  const btnRef = useRef(null);
  const renderedRef = useRef(false);

  const [sdkReady, setSdkReady] = useState(false);
  const [userId, setUserId] = useState(null);

  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID;

  // Get the logged-in user (needed to pass as custom_id)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  // Render the PayPal Subscriptions button once all preconditions are met
  useEffect(() => {
    if (renderedRef.current) return;                      // prevent double render
    if (!sdkReady || !userId || !btnRef.current) return;  // wait for SDK + user

    if (!window.paypal) return;                           // SDK not present yet

    renderedRef.current = true;
    window.paypal
      .Buttons({
        style: { shape: 'rect', layout: 'vertical', label: 'subscribe' },
        createSubscription: (_data, actions) => {
          return actions.subscription.create({
            plan_id: PLAN_ID,
            custom_id: userId,
            application_context: {
              brand_name: 'TradePage.link',
              user_action: 'SUBSCRIBE_NOW'
            }
          });
        },
        onApprove: async (data) => {
          alert('Subscription started: ' + data.subscriptionID);
          window.location.href = '/dashboard';
        },
        onError: (err) => {
          console.error('PayPal error', err);
          alert('Payment error. Please try again.');
        }
      })
      .render(btnRef.current);
  }, [sdkReady, userId, PLAN_ID]);

  const missingClient = !CLIENT_ID;
  const missingPlan = !PLAN_ID;

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan you selected in PayPal.</p>

      {/* Helpful messages if something is missing */}
      {missingClient && (
        <p style={{ color: '#f87171', marginTop: 12 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>. Set it in your environment and redeploy.
        </p>
      )}
      {missingPlan && (
        <p style={{ color: '#fbbf24', marginTop: 8 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_PLAN_ID</code>. Add your PayPal plan ID (starts with <code>P-</code>).
        </p>
      )}
      {!userId && (
        <p style={{ color: '#94a3b8', marginTop: 8 }}>
          Please sign in to continue. (Button appears once you’re logged in.)
        </p>
      )}

      {/* PayPal JS SDK – vault + subscriptions. Use ONLY the public client id. */}
      {!missingClient && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&vault=true&intent=subscription`}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={(e) => {
            console.error('PayPal SDK failed to load', e);
            alert('PayPal SDK failed to load. Check NEXT_PUBLIC_PAYPAL_CLIENT_ID or ad-blockers.');
          }}
        />
      )}

      <div ref={btnRef} style={{ marginTop: 24 }} />

      {/* DEBUG (remove anytime) */}
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>
        SDK ready: {String(sdkReady)} • plan set: {String(!missingPlan)} • userId set: {String(!!userId)}
      </div>
    </main>
  );
}
