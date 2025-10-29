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
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (ready && window.paypal && btnRef.current && userId) {
      // Render PayPal Subscriptions button
      window.paypal.Buttons({
        style: { shape: 'rect', layout: 'vertical', label: 'subscribe' },
        createSubscription: (_data, actions) => {
          // Pass plan_id and custom_id (we use custom_id = supabase user_id)
          return actions.subscription.create({
            plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
            custom_id: userId,
            application_context: {
              brand_name: 'TradePage.link',
              user_action: 'SUBSCRIBE_NOW'
            }
          });
        },
        onApprove: async (data, _actions) => {
          // data.subscriptionID available; webhooks will do the real recording
          alert('Subscription started: ' + data.subscriptionID);
          // Optionally: redirect to dashboard
          window.location.href = '/dashboard';
        },
        onError: (err) => {
          console.error('PayPal error', err);
          alert('Payment error. Please try again.');
        }
      }).render(btnRef.current);
    }
  }, [ready, userId]);

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan you selected in PayPal.</p>

      {/* PayPal JS SDK – vault + subscriptions */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />

      <div ref={btnRef} style={{ marginTop: 24 }} />
    </main>
  );
}
