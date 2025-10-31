'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HeaderHider() {
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      // Try a few likely selectors; first match wins
      const header =
        document.querySelector('[data-site-header]') ||
        document.querySelector('header.site-header') ||
        document.querySelector('header') ||
        document.querySelector('[data-topbar]');

      if (!header) return;

      if (!user) {
        header.style.display = 'none';      // hide for visitors
      } else {
        header.style.display = '';          // show for signed-in users
      }
    })();

    return () => { mounted = false; };
  }, []);

  return null;
}
