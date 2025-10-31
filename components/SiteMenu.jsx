'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const itemStyle = {
  display: 'block',
  padding: 8,
  color: 'var(--text)',
  textDecoration: 'none',
  borderRadius: 8,
  lineHeight: 1.2,
};

export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();
  }, []);

  // Close on click/touch outside or Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onSignOut = async () => {
    try { await supabase.auth.signOut(); } finally {
      window.location.href = '/';
    }
  };

  // helper: close then navigate
  const linkProps = { style: itemStyle, onClick: () => setOpen(false) };

  return (
    <div className="site-menu" ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen(v => !v)}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: '1px solid var(--social-border)',
          background: 'transparent', cursor: 'pointer',
          display: 'grid', placeItems: 'center'
        }}
      >
        <div style={{ width: 18 }}>
          <div style={{ height: 2, margin: '3px 0', background: 'var(--text)' }} />
          <div style={{ height: 2, margin: '3px 0', background: 'var(--text)' }} />
          <div style={{ height: 2, margin: '3px 0', background: 'var(--text)' }} />
        </div>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: 44, zIndex: 1000,
            minWidth: 200, border: '1px solid var(--border)',
            background: 'var(--card-bg-1)', borderRadius: 12, padding: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,.25)'
          }}
          role="menu"
        >
          {!email ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/signin" {...linkProps}>Create your page</Link></li>
              <li><Link href="/#features" {...linkProps}>Features</Link></li>
              <li><Link href="/#pricing" {...linkProps}>Pricing</Link></li>
              <li><Link href="/contact" {...linkProps}>Contact</Link></li>
            </ul>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/dashboard" {...linkProps}>Dashboard</Link></li>
              <li>
                <button
                  onClick={onSignOut}
                  style={{ ...itemStyle, width: '100%', textAlign: 'left', background: 'transparent', border: 0, padding: 8, cursor: 'pointer' }}
                >
                  Sign out
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
