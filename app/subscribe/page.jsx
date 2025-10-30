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

  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  // Use www.paypal.com; the client-id decides sandbox vs live
  const sdkSrc =
    `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CLIENT_ID)}&components=buttons&vault=true&intent=subscription`;

  // Get current session + listen for changes
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (alive) setUserId(session?.user?.id || null);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setUserId(session?.user?.id || null);
    });

    return () => {
      alive = false;
      if (subscription && subscription.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  // Render PayPal button when ready
  useEffect(() => {
    if (renderedRef.current) return;
    if (!sdkReady || !userId || !btnRef.current) return;
    if (typeof window === 'undefined' || !window.paypal) return;

    renderedRef.current = true;

    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'subscribe' },
      createSubscription: (_data, actions) =>
        actions.subscription.create({
          plan_id: PLAN_ID,
          custom_id: userId,
          application_context: { brand_name: 'TradePage.link' },
        }),
      onApprove: (data) => {
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
    <main style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan configured in PayPal.</p>

      {/* Inline diagnostics */}
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, lineHeight: 1.6 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • userId set: <b>{String(!!userId)}</b><br />
        clientId len: <b>{CLIENT_ID.length}</b> • SDK URL: <a href={sdkSrc} target="_blank" rel="noreferrer">{sdkSrc}</a>
      </div>

      {CLIENT_ID && (
        <Script
          src={sdkSrc}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={() => {
            alert('PayPal SDK failed to load (network/CSP/ad-block).');
          }}
        />
      )}

      <div ref={btnRef} style={{ marginTop: 24 }} />

      {!userId && (
        <div style={{ marginTop: 12, fontSize: 13 }}>
          Please <a href="/signin">sign in</a> first. The button appears once you’re logged in.
        </div>
      )}
    </main>
  );
}
