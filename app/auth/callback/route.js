import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // No code? back to sign-in
  if (!code) return NextResponse.redirect(new URL('/signin', request.url))

  // Prepare redirect response first (we'll attach cookies to it)
  const res = NextResponse.redirect(new URL('/dashboard', request.url))

  // Supabase server client that READS from request cookies
  // and WRITES auth cookies onto THIS redirect response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) =>
          res.cookies.set(name, '', { ...options, maxAge: 0 }),
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    // If exchange fails, send them back to sign-in
    return NextResponse.redirect(new URL('/signin?auth=fail', request.url))
  }

  return res
}
