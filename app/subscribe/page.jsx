'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);

export default function SubscribePage() {
  const mountRef = useRef(null);
  const renderedRef = useRef(false);

  const [userId, setUserId] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [msg, setMsg] = useState('');

  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  const baseParams =
    `client-id=${encodeURIComponent(CLIENT_ID)}&components=buttons` +
    `&vault=true&intent=subscription&enable-funding=card`;

  const PRIMARY  = `https://www.paypal.com/sdk/js?${baseParams}`;
  const FALLBACK = `https://www.sandbox.paypal.com/sdk/js?${baseParams}`;

  // show user id if present (not required for button)
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
    return () => { alive = false; data?.subscription?.unsubscribe?.(); };
  }, []);

  function inject(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.id = `paypal-sdk-${Math.random().toString(36).slice(2)}`;
      s.src = url;
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.onload  = () => resolve('ok');
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  // Try primary → then fallback
  useEffect(() => {
    if (!CLIENT_ID) { setMsg('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID'); return; }
    setMsg('');
    (async () => {
      try {
        await inject(PRIMARY);
        if (!window.paypal) throw new Error('SDK attached = false (primary)');
        setSdkReady(true);
        console.log('[PayPal] SDK loaded (primary).');
      } catch (err1) {
        console.warn('[PayPal] primary failed:', err1);
        try {
          await inject(FALLBACK);
          if (!window.paypal) throw new Error('SDK attached = false (fallback)');
          setSdkReady(true);
          console.log('[PayPal] SDK loaded (fallback).');
        } catch (err2) {
          console.error('[PayPal] fallback failed:', err2);
          setMsg('Failed to load PayPal SDK (network/CSP/filter).');
          setSdkReady(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CLIENT_ID]);

  // Render the button once
  useEffect(() => {
    if (renderedRef.current) return;
    if (!sdkReady || !PLAN_ID || !mountRef.current) return;
    if (!window.paypal?.Buttons) return;

    renderedRef.current = true;

    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'subscribe' },
      createSubscription: (_data, actions) => {
        return actions.subscription.create({
          plan_id: PLAN_ID,
          ...(userId ? { custom_id: userId } : {}),
          application_context: { brand_name: 'TradePage.link', user_action: 'SUBSCRIBE_NOW' }
        });
      },
      onApprove: (data) => {
        alert(`Subscription started: ${data.subscriptionID}`);
        window.location.href = '/dashboard';
      },
      onError: (err) => {
        console.error('PayPal error', err);
        alert('Payment error. Please try again.');
      }
    }).render(mountRef.current);
  }, [sdkReady, PLAN_ID, userId]);

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan configured in PayPal.</p>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8, lineHeight: 1.6 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • user set: <b>{String(!!userId)}</b><br />
        clientId len: <b>{CLIENT_ID.length}</b> • URLs:&nbsp;
        <a href={PRIMARY}  target="_blank" rel="noreferrer">primary</a> ·{' '}
        <a href={FALLBACK} target="_blank" rel="noreferrer">fallback</a>
      </div>

      <div ref={mountRef} style={{ marginTop: 20 }} />

      {msg ? <p style={{ color: '#ef4444', marginTop: 12 }}>{msg}</p> : null}
    </main>
  );
}
