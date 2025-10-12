// app/[slug]/page.jsx  — SERVER component (no 'use client', no React hooks here)
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import SlugClient from './SlugClient';

export default function Page({ params }) {
  return (
    <div>
      {/* CANARY — remove later */}
      <div style={{ fontSize: 12, opacity: 0.6 }}>
        slug-canary {new Date().toISOString()} — {process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || 'local'} — {Math.random()}
      </div>

      <SlugClient slug={params.slug} />
    </div>
  );
}
