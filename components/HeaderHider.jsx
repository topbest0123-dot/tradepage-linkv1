'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Slug pages are single-segment URLs like /john; everything below stays visible
const APP_ROUTES = new Set([
  '', 'dashboard', 'signin', 'subscribe', 'contact', 'pricing', 'blog', 'api'
]);

export default function HeaderHider() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const parts = (pathname || '/').split('/').filter(Boolean);
    const isSingle = parts.length === 1;
    const first = isSingle ? parts[0] : null;

    // Hide header ONLY on public profile pages (/[slug])
    const isSlugPage = isSingle && !APP_ROUTES.has(first || '');

    header.style.display = isSlugPage ? 'none' : '';
  }, [pathname]);

  return null;
}
