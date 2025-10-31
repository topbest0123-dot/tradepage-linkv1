// components/AuthLinks.jsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 36,                 // ⬅️ same height for both
  padding: '0 14px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,               // ⬅️ same font-size for both
  textDecoration: 'none',
  cursor: 'pointer',
};

export default function AuthLinks() {
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (_) {
      setSigningOut(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <a
        href="/dashboard"
        style={{
          ...btnBase,
          background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
          color: '#08101e',
          border: '1px solid var(--border)',
        }}
      >
        Dashboard
      </a>

      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        style={{
          ...btnBase,
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--social-border)',
          opacity: signingOut ? 0.6 : 1,
        }}
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
