// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';

// Create a client (client-side anon key)
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
  const [msg, setMsg] = useState('');

  // Read envs safely + trim
  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  // Build SDK src (visible for debug)
  const sdkSrc =
    `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CLIENT_ID)}&vault=true&intent=subscription`;

  // Fetch current session + listen for auth changes
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (alive) setUserId(session?.user?.id ?? null);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setUserId(session?.user?.id ?? null);
    });

    return () => {
      alive = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  // Render PayPal button when SDK + userId ready
  useEffect(() => {
    if (renderedRef.current) return;
    if (!sdkReady || !userId || !btnRef.current) return;
    if (!window.paypal) return;

    renderedRef.current = true;

    window.paypal.Buttons({
      style: { shape: 'rect', layout: 'vertical', label: 'subscribe' },
      createSubscription: (_data, actions) => {
        return actions.subscription.create({
          plan_id: PLAN_ID,
          custom_id: userId,
          application_context: {
            brand_name: 'TradePage.link',
            user_action: 'SUBSCRIBE_NOW',
          },
        });
      },
      onApprove: async (data) => {
        alert('Subscription started: ' + data.subscriptionID);
        window.location.href = '/dashboard';
      },
      onError: (err) => {
        console.error('PayPal error', err);
        alert('Payment error. Please try again.');
      },
    }).render(btnRef.current);
  }, [sdkReady, userId, PLAN_ID]);

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan configured in PayPal.</p>

      {/* Helpful inline diagnostics */}
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, lineHeight: 1.6 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • userId set: <b>{String(!!userId)}</b><br />
        clientId len: <b>{CLIENT_ID.length}</b> • SDK URL: <a href={sdkSrc} target="_blank" rel="noreferrer">{sdkSrc}</a>
      </div>

      {/* Show clear message if client id missing */}
      {!CLIENT_ID && (
        <p style={{ color: '#ef4444', marginTop: 12 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>. Set it in Vercel (Production) and redeploy.
        </p>
      )}

      {/* Load PayPal SDK (only when we have a client id) */}
      {CLIENT_ID && (
        <Script
          src={sdkSrc}
          strategy="afterInteractive"
          onLoad={() => { console.log('PayPal SDK loaded:', sdkSrc); setSdkReady(true); }}
          onError={(e) => {
            console.error('PayPal SDK failed:', sdkSrc, e);
            alert('PayPal SDK failed to load. Check NEXT_PUBLIC_PAYPAL_CLIENT_ID or ad-blockers.');
          }}
        />
      )}

      {/* Button mount point */}
      <div ref={btnRef} style={{ marginTop: 24 }} />

      {/* If not logged in, show a sign-in nudge */}
      {!userId && (
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
          Please <a href="/signin">sign in</a> first. The button appears once you’re logged in.
        </div>
      )}

      {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}
    </main>
  );
}
