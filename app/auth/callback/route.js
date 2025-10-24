// app/auth/callback/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // If there is no code, go back to your sign-in page
  if (!code) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Create the redirect response FIRST (so we can attach cookies to it)
  const res = NextResponse.redirect(new URL('/dashboard', request.url))

  // Read cookies from the request, WRITE cookies onto *this* redirect response
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) =>
          res.cookies.set(name, '', { ...options, maxAge: 0 })
      }
    }
  )

  // Exchange the magic link code for a session — sets auth cookies on `res`
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    // If something fails, send user back to sign-in with a hint
    return NextResponse.redirect(new URL('/signin?err=auth', request.url))
  }

  return res
}
