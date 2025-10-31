'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const router = useRouter();

  // figure out which pages get the hamburger
  const [showBurger, setShowBurger] = useState(false);

  useEffect(() => {
    let mounted = true;

    const compute = async () => {
      const path = (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
      const segs = path.split('/').filter(Boolean);
      const first = segs[0] || '';
      const reserved = new Set(['', 'dashboard', 'signin', 'subscribe', 'api', 'contact', 'pricing', 'prices', 'blog']);
      const isDashboard = first === 'dashboard';
      const isSlug = !!first && !reserved.has(first);

      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setMe(user);

      // Show burger on general pages only (not dashboard, not slug+signed-in, not slug+public)
      const generalPage = !isDashboard && !isSlug;
      const shouldShow = generalPage;
      setShowBurger(shouldShow);
    };

    compute();

    // close menu on navigation
    const onPop = () => setOpen(false);
    window.addEventListener('popstate', onPop);

    return () => {
      mounted = false;
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  if (!showBurger) return null;

  const itemsSignedOut = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/signin', label: 'Create your page' },
  ];

  const itemsSignedIn = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '#signout', label: 'Sign out' },
  ];

  const items = me ? itemsSignedIn : itemsSignedOut;

  const handleClick = async (href) => {
    if (href === '#signout') {
      await supabase.auth.signOut();
      router.push('/');
      setOpen(false);
      return;
    }
    router.push(href);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* hamburger button */}
      <button
        aria-label="Menu"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen(v => !v)}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: '1px solid var(--social-border)',
          borderRadius: 10,
          width: 42, height: 38,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'grid', gap: 3 }}>
          <span style={{ width: 18, height: 2, background: 'var(--text)', display: 'block' }} />
          <span style={{ width: 18, height: 2, background: 'var(--text)', display: 'block' }} />
          <span style={{ width: 18, height: 2, background: 'var(--text)', display: 'block' }} />
        </div>
      </button>

      {/* dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: '110%',
            background: 'var(--card-bg-1)',
            border: '1px solid var(--chip-border)',
            borderRadius: 12,
            minWidth: 210,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            zIndex: 50
          }}
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => handleClick(it.href)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                background: 'transparent',
                border: '0',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
