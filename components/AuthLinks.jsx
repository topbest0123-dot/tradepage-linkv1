'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      setSession(s ?? null);
    });

    return () => {
      ignore = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!session ? (
          pathname !== '/signin' && (
            <Link href="/signin" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
              Sign in
            </Link>
          )
        ) : (
          <>
            {/* DASHBOARD as a link-lookalike BUTTON → never “visited”, always white */}
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                color: '#fff',                 // <- stays white
                textDecoration: 'underline',
                font: 'inherit',
                fontWeight: 600,
              }}
            >
              Dashboard
            </button>

            <button
              onClick={signOut}
              style={{
                background: 'transparent',
                border: '1px solid #213a6b',
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              Sign out
            </button>
          </>
        )}
      </nav>
    </>
  );
}
