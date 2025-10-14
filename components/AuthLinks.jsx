'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthLinks() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let ignore = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!ignore) setSession(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!ignore) setSession(s ?? null);
    });

    return () => {
      ignore = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const go = (href) => router.push(href);
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Same tokens used by Call / WhatsApp buttons on the public page
  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: '0 18px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    fontWeight: 700,
    cursor: 'pointer',
    background: 'transparent',
    outline: 'none',
  };
  const btnPrimary = {
    background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
    color: '#08101e',
  };
  const btnNeutral = {
    background: 'var(--btn-neutral-bg)',
    color: 'var(--text)',
  };

  if (!session) {
  return (
    <button type="button" onClick={() => go('/signin')} style={{ ...btnBase, ...btnNeutral }}>
      Sign in
    </button>
  );
}


  // Authenticated: Dashboard (neutral) + Sign out (primary) — same look as WhatsApp + Call
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button type="button" onClick={() => go('/dashboard')} style={{ ...btnBase, ...btnNeutral }}>
        Dashboard
      </button>
      <button type="button" onClick={signOut} style={{ ...btnBase, ...btnPrimary }}>
        Sign out
      </button>
    </div>
  );
}
