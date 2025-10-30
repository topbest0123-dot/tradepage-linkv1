// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true } }
);

export default function SubscribePage() {
  const btnRef = useRef<HTMLDivElement | null>(null);
  const rendered = useRef(false);

  const [sdkReady, setSdkReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID   || '').trim();

  // IMPORTANT: Always use www.paypal.com host. The Client ID decides sandbox vs live.
  const sdkSrc = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
    CLIENT_ID
  )}&components=buttons&vault=true&intent=subscription`;

  // get session user
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (alive) setUserId(session?.user?.id ?? null);
    })();
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, session) => {
        if (alive) setUserId(session?.user?.id ?? null);
      });
    return () => { alive = false; subscription?.unsubscribe?.(); };
  }, []);

  // render buttons
  useEffect(() => {
    if (!sdkReady || !userId || !btnRef.current || rendered.current) return;
    if (!window.paypal) return;
    rendered.current = true;

    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'subscribe' },
      createSubscription: (_data, actions) =>
        actions.subscription.create({
          plan_id: PLAN_ID,
          custom_id: userId,
          application_context: { brand_name: 'TradePage.link' },
        }),
      onApprove: async (data) => {
        alert(`Subscription started: ${data.subscriptionID}`);
        location.href = '/dashboard';
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

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • userId set: <b>{String(!!userId)}</b><br/>
        clientId len: <b>{CLIENT_ID.length}</b> • SDK URL: <a href={sdkSrc} target="_blank" rel="noreferrer">{sdkSrc}</a>
      </div>

      {CLIENT_ID && (
        <Script
          src={sdkSrc}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={() =>
            alert('PayPal SDK failed to load (network/CSP/ad-block).')
          }
        />
      )}

      <div ref={btnRef} style={{ marginTop: 24 }} />

      {!userId && (
        <p style={{ marginTop: 12, fontSize: 13 }}>
          Please <a href="/signin">sign in</a> first. The button appears after login.
        </p>
      )}
    </main>
  );
}
