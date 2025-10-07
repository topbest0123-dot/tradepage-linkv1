'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NavAuth() {
  const [status, setStatus] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    let mounted = true;

    // initial
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setStatus(data?.session ? 'in' : 'out');
    });

    // subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setStatus(session ? 'in' : 'out');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const linkStyle = { color: '#b8ccff', textDecoration: 'none' };
  const btnStyle = {
    marginLeft: 8,
    background: 'none',
    border: '1px solid #2f3c4f',
    color: '#b8ccff',
    borderRadius: 10,
    padding: '6px 10px',
    cursor: 'pointer',
  };

  const signOut = async (e) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('sign out error', err);
    }
  };

  // While loading, show "Sign in" as a harmless fallback
  if (status === 'loading') {
    return <a href="/signin" style={linkStyle}>Sign in</a>;
  }

  return status === 'in' ? (
    <>
      <a href="/dashboard" style={linkStyle}>Dashboard</a>
      <button onClick={signOut} style={btnStyle}>Sign out</button>
    </>
  ) : (
    <a href="/signin" style={linkStyle}>Sign in</a>
  );
}
