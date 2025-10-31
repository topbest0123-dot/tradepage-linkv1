'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HeaderHider() {
  useEffect(() => {
    let disposed = false;

    const style = document.createElement('style');
    style.setAttribute('data-header-controller', '1');
    style.textContent = `
      /* keep header layout tidy */
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

      /* hide entire header for public slug pages */
      html[data-hide-header="1"] header,
      html[data-hide-header="1"] .site-header,
      html[data-hide-header="1"] .topbar { display: none !important; }

      /* hide ONLY the brand (keep actions) on dashboard & signed-in preview */
      html[data-hide-brand="1"] header .brand,
      html[data-hide-brand="1"] .site-title,
      html[data-hide-brand="1"] .logo,
      html[data-hide-brand="1"] .brand-title { display: none !important; }

      /* on general pages we switch to compact mode:
         hide your old inline nav/actions and rely on hamburger */
      html[data-compact-menu="1"] header nav,
      html[data-compact-menu="1"] header .actions,
      html[data-compact-menu="1"] .topbar nav,
      html[data-compact-menu="1"] .topbar .actions { display: none !important; }
    `;
    document.head.appendChild(style);

    const apply = async () => {
      const root = document.documentElement;
      const path = (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
      const segs = path.split('/').filter(Boolean);
      const first = segs[0] || '';
      const reserved = new Set(['', 'dashboard', 'signin', 'subscribe', 'api', 'contact', 'pricing', 'prices', 'blog']);

      const isDashboard = first === 'dashboard';
      const isSlug = !!first && !reserved.has(first);
      const generalPage = !isDashboard && !isSlug;

      const { data: { user } } = await supabase.auth.getUser();

      // default: clear all
      root.removeAttribute('data-hide-header');
      root.removeAttribute('data-hide-brand');
      root.removeAttribute('data-compact-menu');

      // public slug (no user) → hide header entirely
      if (!user && isSlug) {
        root.setAttribute('data-hide-header', '1');
        return;
      }

      // dashboard OR slug while signed-in (preview) → hide brand, keep inline actions
      if (user && (isDashboard || isSlug)) {
        root.setAttribute('data-hide-brand', '1');
        return;
      }

      // general pages → compact (hamburger) mode
      if (generalPage) {
        root.setAttribute('data-compact-menu', '1');
      }
    };

    apply();

    // react to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => apply());

    // react to nav changes
    const onPop = () => apply();
    window.addEventListener('popstate', onPop);

    return () => {
      disposed = true;
      style.remove();
      window.removeEventListener('popstate', onPop);
      sub?.unsubscribe?.();
    };
  }, []);

  return null;
}
