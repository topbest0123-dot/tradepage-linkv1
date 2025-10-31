'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const linkStyle = {
  padding: '8px 12px',
  border: '1px solid var(--social-border)',
  borderRadius: 10,
  color: 'var(--text)',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
};

export default function AuthLinks() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();
  }, []);

  if (!email) {
    return <Link href="/signin" style={linkStyle}>Create your page</Link>;
  }

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
      <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
      <button
        onClick={async () => { try { await supabase.auth.signOut(); } finally { window.location.href = '/'; } }}
        style={{ ...linkStyle, background: 'transparent', border: '1px solid var(--social-border)' }}
      >
        Sign out
      </button>
    </div>
  );
}
