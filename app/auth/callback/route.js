// app/auth/callback/route.js
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  // If no code, send back to sign-in (or your desired page)
  if (!code) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // IMPORTANT: create the redirect response FIRST
  const response = NextResponse.redirect(new URL('/dashboard', req.url))

  // Then build a Supabase server client that writes cookies onto THIS response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set(name, value, options),
        remove: (name, options) => response.cookies.set(name, '', { ...options, maxAge: 0 })
      }
    }
  )

  // Exchange the code for a session and set cookies on the redirect response
  await supabase.auth.exchangeCodeForSession(code)

  return response
}
