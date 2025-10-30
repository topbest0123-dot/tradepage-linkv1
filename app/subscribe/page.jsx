// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Minimal, self-contained Supabase client (client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);

export default function SubscribePage() {
  const containerRef = useRef(null);
  const renderedRef = useRef(false);

  const [userId, setUserId] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [msg, setMsg] = useState('');

  // Read envs once
  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  // Build SDK URL (buttons component, subscriptions)
  const sdkSrc =
    CLIENT_ID
      ? `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CLIENT_ID)}&components=buttons&vault=true&intent=subscription&enable-funding=card`
      : '';

  // --- 1) Grab current user id (optional, for custom_id) ---
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (alive) setUserId(session?.user?.id ?? null);
      } catch {}
    })();

    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!alive) return;
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      alive = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  // --- 2) Load PayPal SDK programmatically (no Next <Script>) ---
  useEffect(() => {
    if (!CLIENT_ID) return setMsg('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID in Vercel env.');
    if (typeof window === 'undefined') return;

    // If already loaded, mark ready
    if (window.paypal && !sdkReady) {
      setSdkReady(true);
      return;
    }

    // Remove any stale tag
    const old = document.getElementById('paypal-sdk');
    if (old) old.remove();

    setMsg(''); // clear

    const s = document.createElement('script');
    s.id = 'paypal-sdk';
    s.src = sdkSrc;
    s.async = true;
    s.onload = () => {
      // Give the SDK a tick to attach window.paypal
      setTimeout(() => {
        if (window.paypal) {
          setSdkReady(true);
        } else {
          setMsg('SDK loaded but did not attach (likely CSP / network / extension blocking).');
          setSdkReady(false);
        }
      }, 50);
    };
    s.onerror = () => {
      setMsg('Failed to load PayPal SDK (network/CSP/ad-block).');
      setSdkReady(false);
    };
    document.head.appendChild(s);

    return () => {
      // do not auto-remove; keeping SDK is fine when navigating
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CLIENT_ID, sdkSrc]);

  // --- 3) Render the Subscribe button once SDK + container are ready ---
  useEffect(() => {
    if (renderedRef.current) return;
    if (!sdkReady || !PLAN_ID || !containerRef.current) return;
    if (!window.paypal?.Buttons) return;

    renderedRef.current = true;

    try {
      window.paypal.Buttons({
        style: { layout: 'vertical', shape: 'rect', label: 'subscribe' },
        createSubscription: (_data, actions) => {
          return actions.subscription.create({
            plan_id: PLAN_ID,
            ...(userId ? { custom_id: userId } : {}),
            application_context: {
              brand_name: 'TradePage.link',
              user_action: 'SUBSCRIBE_NOW',
            },
          });
        },
        onApprove: async (data) => {
          alert(`Subscription started: ${data.subscriptionID}`);
          window.location.href = '/dashboard';
        },
        onError: (err) => {
          console.error('PayPal error', err);
          alert('Payment error. Please try again.');
        },
      }).render(containerRef.current);
    } catch (e) {
      console.error('Buttons render error', e);
      setMsg('Could not render PayPal button.');
    }
  }, [sdkReady, PLAN_ID, userId]);

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan configured in PayPal.</p>

      {/* Debug line to make it obvious what the page sees */}
      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8, lineHeight: 1.6 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • user set: <b>{String(!!userId)}</b><br />
        clientId len: <b>{CLIENT_ID.length}</b> • SDK URL:&nbsp;
        {CLIENT_ID ? (
          <a href={sdkSrc} target="_blank" rel="noreferrer">{sdkSrc}</a>
        ) : (
          <span>(missing)</span>
        )}
      </div>

      {/* Mount point for PayPal */}
      <div ref={containerRef} style={{ marginTop: 20 }} />

      {/* Helpful error text (if any) */}
      {msg ? <p style={{ color: '#ef4444', marginTop: 12 }}>{msg}</p> : null}
    </main>
  );
}
