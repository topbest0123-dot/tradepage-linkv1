// app/api/auth/callback/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * TEMPORARY fallback that never crashes.
 * It just redirects to /dashboard and does not touch cookies.
 */
export async function GET(req) {
  const url = new URL(req.url);
  const to = url.searchParams.get('next') || '/dashboard';
  return Response.redirect(new URL(to, url.origin), 302);
}
