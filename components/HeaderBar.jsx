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

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (alive) setUser(user || null);
    })();
    return () => { alive = false; };
  }, []);

  const onDashboard = pathname?.startsWith('/dashboard');

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
      {/* Brand: two lines, slightly smaller to avoid wrapping */}
      <div
        style={{
          minWidth: 0,
          flex: '0 1 auto',
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        <b style={{ textTransform: 'uppercase', fontSize: 'clamp(14px,2.4vw,18px)', letterSpacing: '0.4px' }}>
          TradePage
        </b>
        <span style={{ textTransform: 'uppercase', fontSize: 'clamp(11px,1.9vw,14px)', opacity: 0.85, letterSpacing: '0.3px' }}>
          Link
        </span>
      </div>

      {/* Right-side actions: single button + burger on non-dashboard; full AuthLinks on dashboard */}
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
          // Dashboard: keep your existing two inline buttons (Dashboard + Sign out)
          <AuthLinks />
        ) : (
          // Everywhere else (e.g., homepage): show ONLY one primary button, and keep Sign out inside the burger menu
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
          </>
        )}

        <SiteMenu />
      </div>
    </header>
  );
}
