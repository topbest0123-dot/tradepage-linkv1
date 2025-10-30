// middleware.js
import { NextResponse } from 'next/server';

const SUSPENDED_HTML = (slug) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Temporarily unavailable</title>
  <style>
    :root { color-scheme: dark light; --bg:#0b0f14; --card:#121821; --text:#eaf2ff; --muted:#b8c4d6; --border:#213246; }
    html,body {height:100%}
    body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,Segoe UI,Roboto,Arial}
    main{min-height:100%;display:grid;place-items:center;padding:48px}
    .card{max-width:720px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px}
    h1{margin:0 0 6px 0;font-size:28px}
    p{margin:6px 0;color:var(--muted)}
    a.btn{display:inline-flex;margin-top:16px;padding:10px 14px;border-radius:10px;border:1px solid var(--border);color:var(--text);text-decoration:none}
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>Profile temporarily unavailable</h1>
      <p>This page is currently suspended (trial ended or subscription inactive).</p>
      <p>If this is your page, please sign in to reactivate it.</p>
      <a class="btn" href="/signin">Sign in</a>
    </div>
  </main>
</body>
</html>`;

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only intercept single-root slugs (e.g., "/my-plumber")
  const parts = pathname.split('/').filter(Boolean);
  if (
    parts.length !== 1 ||
    parts[0].startsWith('_next') ||
    ['api','signin','signout','dashboard','favicon.ico','robots.txt','sitemap.xml'].includes(parts[0])
  ) {
    return NextResponse.next();
  }

  const slug = parts[0];

  try {
    // Call internal API to check account state
    const res = await fetch(new URL(`/api/account-state/${encodeURIComponent(slug)}`, req.url), {
      cache: 'no-store',
      headers: { 'x-from-mw': '1' },
    });

    if (!res.ok) return NextResponse.next();

    const data = await res.json();
    if (data.state === 'expired') {
      return new NextResponse(SUSPENDED_HTML(slug), {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '86400',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch {
    // If the check fails, don't block the page.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:slug'],
};
