import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  // 1) Confirm the caller is logged in (via your anon client + cookies)
  const cookieStore = cookies()
  const supaAnon = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n, o) => cookieStore.set({ name: n, value: '', ...o, maxAge: 0 })
      }
    }
  )
  const { data: auth, error: authErr } = await supaAnon.auth.getUser()
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2) Read request
  const { bucket, path } = await req.json()
  if (!bucket || !path) {
    return NextResponse.json({ error: 'bucket and path are required' }, { status: 400 })
  }

  // 3) Use SERVICE ROLE to mint a one-time signed upload URL (server-only)
  const SERVICE_ROLE =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE
  if (!SERVICE_ROLE) {
    return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })
  }

  const supaService = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE)
  const { data, error } = await supaService.storage
    .from(bucket)
    .createSignedUploadUrl(path)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Returns: { signedUrl, token, path }
  return NextResponse.json(data)
}
