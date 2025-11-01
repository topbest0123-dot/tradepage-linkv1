// components/HeaderBar.jsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SiteMenu from '@/components/SiteMenu';
import AuthLinks from '@/components/AuthLinks';

export default function HeaderBar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // ◀️ NEW

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (alive) setUser(user || null);
      if (alive) setAuthChecked(true); // ◀️ NEW
    })();
    return () => { alive = false; };
  }, []);

  const onDashboard = pathname?.startsWith('/dashboard');

  /* ── NEW: detect "public slug" route (single segment that is not a known system page) ── */
  const seg = (pathname || '/').replace(/^\/+|\/+$/g, '');       // 'john-plumber' | '' | 'pricing'
  const first = seg.split('/')[0] || '';                          // first segment (or empty for home)
  const isSingleSegment = seg !== '' && !seg.includes('/');       // exactly one segment
  const NON_SLUG = new Set(['signin', 'dashboard', 'pricing', 'contact', 'blog', 'subscribe', 'api']);
  const isPublicSlug = isSingleSegment && !NON_SLUG.has(first);

  // Hide the entire header on public slug pages for logged-out visitors.
  // Also hide while auth is loading to avoid a flash.
  if (isPublicSlug && (!authChecked || !user)) return null;
  /* ─────────────────────────────────────────────────────────────────────────────── */

  return (
    <header
      style={{
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'nowrap',
      }}
    >
      {/* Brand: logo + two-line name (Title Case: "Trade Page" / "Link") */}
      <div
        style={{
          minWidth: 0,
          flex: '0 1 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        <img
          src="/logo.png"                 /* put your logo at /public/logo.svg (or change path) */
          alt="TradePageLink logo"
          style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, borderRadius: 8 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.05,
            minWidth: 0,
          }}
        >
          <b style={{
            fontSize: 'clamp(16px,2.4vw,20px)',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap'
          }}>
            Trade Page
          </b>
          <span style={{
            fontWeight: 800,
            fontSize: 'clamp(16px,2.3vw,20px)',
            letterSpacing: '0.3px',
            marginTop: 2,
            whiteSpace: 'nowrap'
          }}>
            Link
          </span>
        </div>
      </div>

      {/* Right-side actions: only Dashboard inline on /dashboard; Sign out lives in burger */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          flex: '0 0 auto',
          whiteSpace: 'nowrap',
        }}
      >
        {onDashboard ? (
          <>
            {/* Keep only Dashboard as an inline button */}
            <a
              href="/dashboard"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                height: 36, padding: '0 14px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                textDecoration: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
                color: '#08101e', border: '1px solid var(--border)'
              }}
            >
              Dashboard
            </a>
            <SiteMenu />
          </>
        ) : (
          <>
            {user ? (
              <a
                href="/dashboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 36, padding: '0 14px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
                  color: '#08101e', border: '1px solid var(--border)'
                }}
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/signin"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 36, padding: '0 14px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
                  color: '#08101e', border: '1px solid var(--border)'
                }}
              >
                Create your page
              </a>
            )}
            <SiteMenu />
          </>
        )}
      </div>

    </header>
  );
}
