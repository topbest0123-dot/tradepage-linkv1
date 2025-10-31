// /components/HeaderHider.jsx
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HeaderHider() {
  useEffect(() => {
    let disposed = false;

    // Style that hides header for signed-out viewers (public pages)
    const hideStyle = document.createElement('style');
    hideStyle.setAttribute('data-header-fix', 'hide');
    hideStyle.textContent = `
      html[data-hide-header="1"] header,
      html[data-hide-header="1"] .site-header,
      html[data-hide-header="1"] .topbar { display: none !important; }
    `;

    // Style that forces brand + actions to stay on ONE row when header is visible
    const nowrapStyle = document.createElement('style');
    nowrapStyle.setAttribute('data-header-fix', 'nowrap');
    nowrapStyle.textContent = `
      header, .site-header, .topbar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        flex-wrap: nowrap !important;
        gap: 12px !important;
      }
      header .brand, .site-title, .logo, .brand-title {
        white-space: nowrap !important;
      }
      header nav, header .actions, .topbar .actions {
        display: inline-flex !important;
        gap: 10px !important;
        flex-wrap: nowrap !important;
      }
    `;

    document.head.appendChild(hideStyle);
    document.head.appendChild(nowrapStyle);

    // Set initial state
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (disposed) return;
      const root = document.documentElement;
      if (user) root.removeAttribute('data-hide-header');
      else root.setAttribute('data-hide-header', '1');
    })();

    // Update on auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      const root = document.documentElement;
      if (session?.user) root.removeAttribute('data-hide-header');
      else root.setAttribute('data-hide-header', '1');
    });

    return () => {
      disposed = true;
      hideStyle.remove();
      nowrapStyle.remove();
      sub?.unsubscribe?.();
    };
  }, []);

  return null;
}
