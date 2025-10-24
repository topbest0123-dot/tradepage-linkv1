// app/auth/callback/route.js
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  // If no code, go back to your sign-in
  if (!code) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Create the redirect response FIRST
  const res = NextResponse.redirect(new URL('/dashboard', req.url))

  // Build a Supabase server client that reads cookies from the request
  // and WRITES cookies onto THIS redirect response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) => res.cookies.set(name, '', { ...options, maxAge: 0 })
      }
    }
  )

  // Exchange the magic-link code for a session; this sets the auth cookies on `res`
  await supabase.auth.exchangeCodeForSession(code)

  return res
}
