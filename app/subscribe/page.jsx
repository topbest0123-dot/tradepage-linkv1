// app/subscribe/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { supabase } from '@/lib/supabaseClient';

export default function SubscribePage() {
  const btnRef = useRef(null);
  const renderedRef = useRef(false);

  const [sdkReady, setSdkReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [msg, setMsg] = useState('');

  // Read envs (production/live)
  const CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();
  const PLAN_ID   = (process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '').trim();

  // Build SDK src (no currency param for subs → use plan currency)
  const sdkSrc = CLIENT_ID
    ? `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CLIENT_ID)}&vault=true&intent=subscription&components=buttons`
    : '';

  // Get signed-in user
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (alive) {
        setUserId(user?.id ?? null);
        setLoadingUser(false);
      }
    })();

    const { data: authSub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!alive) return;
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      alive = false;
      authSub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Render PayPal Buttons once
  useEffect(() => {
    if (renderedRef.current) return;
    if (!sdkReady || !userId || !btnRef.current) return;
    if (!window.paypal || !PLAN_ID) return;

    renderedRef.current = true;

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          shape: 'rect',
          label: 'subscribe',
          height: 45,
        },
        createSubscription: (_data, actions) => {
          return actions.subscription.create({
            plan_id: PLAN_ID,
            custom_id: userId, // ← we use this in the webhook to map to the Supabase user
            application_context: {
              brand_name: 'TradePage.link',
              user_action: 'SUBSCRIBE_NOW',
            },
          });
        },
        onApprove: async (data) => {
          setMsg('Subscription active. Redirecting…');
          // Small delay to let PayPal finish UI cleanup
          setTimeout(() => { window.location.href = '/dashboard'; }, 500);
        },
        onError: (err) => {
          console.error('PayPal error', err);
          setMsg('Payment error. Please try again, or disable ad blockers.');
        },
      }).render(btnRef.current);
    } catch (e) {
      console.error('Render Buttons failed', e);
      setMsg('Could not render PayPal button. Please refresh or try another browser.');
    }
  }, [sdkReady, userId, PLAN_ID]);

  return (
    <main className="container" style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <style>{styles}</style>

      <div className="pricing-wrap">
        <div className="copy">
          <h1>Upgrade to TradePage.link Pro</h1>
          <p className="lead">
            Everything you need to look legit online — in one link.
          </p>

          <ul className="bullets">
            <li>Branded public page with your logo</li>
            <li>Custom colours & themes</li>
            <li>Gallery photos & contact buttons</li>
            <li>Shareable link you can put anywhere</li>
            <li>Cancel anytime</li>
          </ul>
        </div>

        <div className="card">
          <div className="price">
            <div className="amount">
              <span className="currency">$</span>4.99<span className="per">/mo</span>
            </div>
            <div className="tiny">Billed monthly via PayPal</div>
          </div>

          {/* If not signed in, show a friendly prompt */}
          {!loadingUser && !userId && (
            <a href="/signin" className="cta cta-secondary">
              Sign in to subscribe
            </a>
          )}

          {/* PayPal container (rendered when sdk + user ready) */}
          {CLIENT_ID && userId ? (
            <>
              <div ref={btnRef} className="paypal-mount" />
              <div className="hint">Cards via PayPal are supported in checkout. More options coming soon.</div>
            </>
          ) : null}

          {/* Helpful, quiet error states */}
          {!CLIENT_ID && (
            <div className="error">
              Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>. Set it in Vercel (Production) and redeploy.
            </div>
          )}
          {!PLAN_ID && (
            <div className="error">
              Missing <code>NEXT_PUBLIC_PAYPAL_PLAN_ID</code>. Create a PayPal Subscription Plan and set the env.
            </div>
          )}

          {msg ? <div className="note">{msg}</div> : null}

          {/* Collapsible technical details (hidden by default) */}
          <details className="tech">
            <summary>Having trouble? Show technical details</summary>
            <div className="tech-body">
              <div>SDK loaded: <b>{String(sdkReady)}</b></div>
              <div>User ID set: <b>{String(!!userId)}</b></div>
              <div>Plan set: <b>{String(!!PLAN_ID)}</b></div>
              <div style={{ wordBreak: 'break-all' }}>
                SDK URL: <code>{sdkSrc || '(no client id)'}</code>
              </div>
              <div className="tiny">Tip: disable ad blockers or try incognito.</div>
            </div>
          </details>
        </div>
      </div>

      {/* Load PayPal SDK (after interactive) */}
      {CLIENT_ID && (
        <Script
          src={sdkSrc}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={(e) => {
            console.error('PayPal SDK failed', e);
            setMsg('PayPal SDK failed to load. Check your network or disable ad blockers.');
          }}
        />
      )}
    </main>
  );
}

const styles = `
.pricing-wrap {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}
@media (max-width: 860px) {
  .pricing-wrap { grid-template-columns: 1fr; }
}

h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  line-height: 1.2;
  color: var(--text);
}
.lead {
  opacity: 0.85;
  margin: 0 0 18px 0;
}
.bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.bullets li {
  display: flex;
  gap: 10px;
  align-items: center;
  line-height: 1.4;
}
.bullets li::before {
  content: "✓";
  border: 1px solid var(--social-border);
  background: var(--chip-bg);
  color: var(--text);
  width: 20px; height: 20px;
  border-radius: 6px;
  display: grid; place-items: center;
  font-size: 12px;
}

.card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card-bg-1);
  padding: 18px;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}
.amount {
  font-weight: 800;
  font-size: 40px;
  letter-spacing: -0.5px;
  color: var(--text);
}
.currency { font-size: 18px; opacity: 0.9; margin-right: 2px; }
.per { font-size: 16px; opacity: 0.75; margin-left: 4px; }
.tiny { font-size: 12px; opacity: 0.65; }

.paypal-mount {
  margin-top: 10px;
  margin-bottom: 8px;
}

.hint {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 6px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid var(--border);
  cursor: pointer;
  text-decoration: none;
}
.cta-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--social-border);
  margin-top: 8px;
}

.error, .note {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}
.error {
  border: 1px solid #b91c1c;
  background: rgba(185,28,28,0.08);
  color: var(--text);
}
.note {
  border: 1px solid var(--border);
  background: var(--card-bg-2, var(--card-bg-1));
  color: var(--text);
}

.tech {
  margin-top: 12px;
}
.tech summary {
  cursor: pointer;
  opacity: 0.8;
}
.tech-body {
  margin-top: 8px;
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 10px;
  background: var(--chip-bg);
  color: var(--text);
}
`;
