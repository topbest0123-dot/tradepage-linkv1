// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SubscribePage() {
  const btnRef = useRef(null);
  const renderedRef = useRef(false);

  const [sdkReady, setSdkReady] = useState(false);
  const [sdkErr, setSdkErr] = useState('');
  const [userId, setUserId] = useState(null);

  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  const sdkSrc = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
    CLIENT_ID
  )}&components=buttons&vault=true&intent=subscription&enable-funding=card`;

  // get / track auth
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (alive) setUserId(session?.user?.id ?? null);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setUserId(session?.user?.id ?? null);
    });
    return () => { alive = false; subscription?.unsubscribe?.(); };
  }, []);

  // HARD load the PayPal SDK (no Next.js <Script>)
  useEffect(() => {
    if (!CLIENT_ID) return;

    // remove any old sdk tag
    const old = document.getElementById('paypal-sdk');
    if (old) old.remove();

    const s = document.createElement('script');
    s.id = 'paypal-sdk';
    s.src = sdkSrc;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.dataset.sdkIntegrationSource = 'platform-react';
    s.onload = () => {
      // small defer to allow sdk to attach window.paypal
      setTimeout(() => {
        if (window.paypal) setSdkReady(true);
        else setSdkErr('SDK loaded but window.paypal is missing');
      }, 0);
    };
    s.onerror = () => {
      setSdkErr('Failed to load PayPal SDK (network/CSP/ad-block).');
    };
    document.head.appendChild(s);

    // final fallback after 2s
    const t = setTimeout(() => {
      if (!window.paypal) setSdkErr('SDK did not attach (likely CSP/ad-block).');
    }, 2000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CLIENT_ID, sdkSrc]);

  // render buttons
  useEffect(() => {
    if (renderedRef.current) return;
    if (!sdkReady || !userId || !btnRef.current || !PLAN_ID) return;
    if (!window?.paypal?.Buttons) return;

    renderedRef.current = true;

    const buttons = window.paypal.Buttons({
      style: { shape: 'rect', layout: 'vertical', label: 'subscribe' },
      createSubscription: (_data, actions) => {
        return actions.subscription.create({
          plan_id: PLAN_ID,
          custom_id: userId,
          application_context: { brand_name: 'TradePage.link', user_action: 'SUBSCRIBE_NOW' }
        });
      },
      onApprove: (data) => {
        alert('Subscription started: ' + data.subscriptionID);
        window.location.href = '/dashboard';
      },
      onError: (err) => {
        console.error('PayPal error', err);
        alert('Payment error. Please try again.');
      }
    });

    buttons.render(btnRef.current);

    return () => {
      try { btnRef.current && (btnRef.current.innerHTML = ''); } catch {}
      renderedRef.current = false;
    };
  }, [sdkReady, userId, PLAN_ID]);

  return (
    <main className="container" style={{ padding: 24 }}>
      <h1>Subscribe to TradePage.link</h1>
      <p>You’ll be charged according to the plan configured in PayPal.</p>

      {/* diagnostics */}
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, lineHeight: 1.6 }}>
        SDK ready: <b>{String(sdkReady)}</b> • plan set: <b>{String(!!PLAN_ID)}</b> • userId set: <b>{String(!!userId)}</b><br />
        clientId len: <b>{CLIENT_ID.length}</b> • SDK URL:{' '}
        <a href={sdkSrc} target="_blank" rel="noreferrer">{sdkSrc}</a>
      </div>
      {sdkErr && <p style={{ color: '#ef4444', marginTop: 8 }}>{sdkErr}</p>}
      {!CLIENT_ID && (
        <p style={{ color: '#ef4444', marginTop: 8 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>.
        </p>
      )}
      {!PLAN_ID && (
        <p style={{ color: '#f59e0b', marginTop: 8 }}>
          Missing <code>NEXT_PUBLIC_PAYPAL_PLAN_ID</code> (starts with <code>P-</code>).
        </p>
      )}

      <div ref={btnRef} style={{ marginTop: 24 }} />

      {!userId && (
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
          Please <a href="/signin">sign in</a> first. The button appears once you’re logged in.
        </div>
      )}
    </main>
  );
}
