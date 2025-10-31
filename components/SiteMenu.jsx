// components/SiteMenu.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SiteMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const panelRef = useRef(null);

  const onDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (alive) setUser(user || null);
    })();
    return () => { alive = false; };
  }, []);

  // Close on outside click or ESC
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) setOpen(false); // click anywhere closes
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // Common site items (homepage menu)
  const coreItems = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ];

 // Build the list: always show core items; add Sign out whenever the user is logged in
const items = [...coreItems];

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut();
  } finally {
    window.location.href = '/';
  }
};

if (user) {
  items.push({ label: 'Sign out', action: handleSignOut });
}


  const Burger = (
    <button
      type="button"
      aria-label="Open menu"
      onClick={() => setOpen((v) => !v)}
      style={{
        width: 40, height: 36,
        borderRadius: 10,
        border: '1px solid var(--social-border)',
        background: 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <div style={{ width: 18 }}>
        <div style={{ height: 2, background: 'var(--text)', margin: '3px 0' }} />
        <div style={{ height: 2, background: 'var(--text)', margin: '3px 0' }} />
        <div style={{ height: 2, background: 'var(--text)', margin: '3px 0' }} />
      </div>
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      {Burger}

      {open && (
        <>
          {/* Overlay: clicking anywhere closes */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
              zIndex: 40
            }}
          />
          <div
            ref={panelRef}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 50,
              minWidth: 220,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--card-bg-1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: 8 }}>
              {items.map((it, i) => (
                it.action ? (
                  <button
                    key={`a-${i}`}
                    type="button"
                    onClick={() => { it.action(); setOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--chip-border)',
                      background: 'var(--chip-bg)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      marginBottom: 6
                    }}
                  >
                    {it.label}
                  </button>
                ) : (
                  <a
                    key={`l-${i}`}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--chip-border)',
                      background: 'var(--chip-bg)',
                      color: 'var(--text)',
                      textDecoration: 'none',
                      marginBottom: 6
                    }}
                  >
                    {it.label}
                  </a>
                )
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
