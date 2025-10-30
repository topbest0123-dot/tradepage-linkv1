// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';

// Supabase client (browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);

export default function SubscribePage() {
  const mountRef = useRef(null);
  const renderedRef = useRef(false);

  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);

  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  // SDK url — keep it simple and explicit
  const sdkUrl = CLIENT_ID
    ? `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        CLIENT_ID
      )}&components=buttons&vault=true&intent=subscription&enable-funding=card`
    : '';

  // Track auth
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (alive) setUser(session?.user || null);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  // Render PayPal button
  useEffect(() => {
    if (!sdkReady || !user || !mountRef.current || renderedRef.current) return;
    if (!window.paypal) return;

    renderedRef.current = true; // one-time render

    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'subscribe' },

      // Create the subscription in PayPal
      createSubscription: (_data, actions) => {
        return actions.subscription.create({
          plan_id: PLAN_ID,
          custom_id: user.id, // useful for mapping in webhooks later
          application_context: { brand_name: 'TradePage.link', user_action: 'SUBSCRIBE_NOW' },
        });
      },

      // Called after successful approval
      onApprove: async (data) => {
        try {
          // save to DB (server route)
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          await fetch('/api/subscriptions/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              provider: 'paypal',
              subscription_id: data.subscriptionID,
              plan_id: PLAN_ID,
              status: 'approved',
              raw: data,
            }),
          });

          alert('Subscription started ✔');
          window.location.href = '/dashboard';
        } catch (e) {
          console.error(e);
          alert('Saved subscription, but failed to record in DB. Please contact support.');
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        alert('Payment error. Please try again.');
      },
    }).render(mountRef.current);
  }, [sdkReady, user, PLAN_ID]);

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan configured in PayPal.</p>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8, lineHeight: 1.6 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • user set: <b>{String(!!user)}</b><br />
        clientId len: <b>{CLIENT_ID.length}</b>{' '}
        {CLIENT_ID && <>• SDK URL: <a href={sdkUrl} target="_blank" rel="noreferrer">{sdkUrl}</a></>}
      </div>

      {!CLIENT_ID && (
        <p style={{ color: '#ef4444', marginTop: 10 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in Vercel env. Add it and redeploy.
        </p>
      )}

      {!PLAN_ID && (
        <p style={{ color: '#ef4444', marginTop: 6 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_PLAN_ID</code>. Add it and redeploy.
        </p>
      )}

      {/* Load SDK only when we have a client ID */}
      {CLIENT_ID && (
        <Script
          src={sdkUrl}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={() => alert('PayPal SDK failed to load (blocked by extension/CSP/network). Try a Guest window.')}
        />
      )}

      {/* Mount point for the button */}
      <div ref={mountRef} style={{ marginTop: 20 }} />

      {!user && (
        <p style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
          Please <a href="/signin">sign in</a> first. The button appears after login.
        </p>
      )}
    </main>
  );
}
