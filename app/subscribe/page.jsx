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

  // Robust user detection (updates when auth changes)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setUserId(session?.user?.id ?? null);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Render the PayPal Subscriptions button once the SDK is ready.
  // NOTE: we DO NOT block rendering on userId anymore; if userId is null,
  // we still create the subscription and then attach it server-side onApprove.
  useEffect(() => {
    if (renderedRef.current) return;               // prevent double render
    if (!sdkReady || !btnRef.current) return;      // wait for SDK + mount
    if (!window.paypal) return;                    // SDK not present yet

    renderedRef.current = true;

    window.paypal.Buttons({
      style: { shape: 'rect', layout: 'vertical', label: 'subscribe' },

      createSubscription: async (_data, actions) => {
        try {
          // Pass plan id; include custom_id only if we already have it
          const body = {
            plan_id: PLAN_ID,
            // JSON.stringify omits undefined — so this is safe:
            custom_id: userId || undefined,
            application_context: { brand_name: 'TradePage.link', user_action: 'SUBSCRIBE_NOW' }
          };
          return await actions.subscription.create(body);
        } catch (err) {
          console.error('createSubscription error', err);
          alert('PayPal error creating subscription. Ensure your Sandbox plan is ACTIVE and belongs to this merchant.');
          throw err;
        }
      },

      onApprove: async (data) => {
        try {
          // Attach the subscription to the logged-in user (fills user_id in DB)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token && data?.subscriptionID) {
            await fetch('/api/paypal/attach', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${session.access_token}`
              },
              body: JSON.stringify({ subscription_id: data.subscriptionID })
            });
          }
        } catch (e) {
          console.warn('Attach skipped:', e);
        }

        alert('Subscription started: ' + data.subscriptionID);
        window.location.href = '/dashboard';
      },

      onError: (err) => {
        console.error('PayPal error', err);
        alert('Payment error. Please try again.');
      }
    }).render(btnRef.current);
  }, [sdkReady, PLAN_ID, userId]);

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
          You can subscribe now; we’ll link it to your account on approval.
        </p>
      )}

      {/* PayPal JS SDK – vault + subscriptions. Hide card flows for now. */}
      {!missingClient && (
<Script
  src={`https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&vault=true&intent=subscription&enable-funding=card`}
  strategy="afterInteractive"
  onLoad={() => setSdkReady(true)}
  onError={(e) => { console.error('PayPal SDK failed to load', e); alert('PayPal SDK failed to load. Check NEXT_PUBLIC_PAYPAL_CLIENT_ID or ad-blockers.'); }}
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
