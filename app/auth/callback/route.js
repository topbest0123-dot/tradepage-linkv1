// app/auth/callback/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // no code? go to sign-in
  if (!code) return NextResponse.redirect(new URL('/signin', request.url))

  // prepare the redirect response FIRST
  const res = NextResponse.redirect(new URL('/dashboard', request.url))

  // create a server Supabase client that writes auth cookies onto THIS redirect
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) => res.cookies.set(name, '', { ...options, maxAge: 0 }),
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    // if exchange fails, bounce to signin with a hint
    return NextResponse.redirect(new URL('/signin?auth=fail', request.url))
  }

  return res
}
