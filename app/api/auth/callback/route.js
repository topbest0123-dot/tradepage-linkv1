// app/api/auth/callback/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // No code -> back to sign-in
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // Server-only Supabase client (no session persistence)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // Exchange ?code= for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/signin?m=auth_error', req.url));
  }

  const session = data?.session;
  const cookieStore = cookies();

  // ✅ Make cookies valid for both root and www
  const COOKIE_DOMAIN =
    process.env.NODE_ENV === 'production' ? '.tradepage.link' : undefined;

  // Common cookie options
  const baseOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: COOKIE_DOMAIN
  };

  // Access token (shorter expiry)
  if (session?.access_token) {
    cookieStore.set('sb-access-token', session.access_token, {
      ...baseOptions,
      maxAge: session.expires_in ?? 60 * 60 // seconds
    });
  }

  // Refresh token (longer expiry)
  if (session?.refresh_token) {
    cookieStore.set('sb-refresh-token', session.refresh_token, {
      ...baseOptions,
      maxAge: 60 * 60 * 24 * 365 // ~1 year
    });
  }

  // Done -> go to dashboard
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
