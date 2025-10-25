// app/api/storage/signed-upload/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY  // set in Vercel → Project → Settings → Env Vars

export async function POST(req) {
  const authHeader = req.headers.get('authorization') || ''
  const supaUser = createClient(URL, ANON, { global: { headers: { Authorization: authHeader } } })
  const { data: { user }, error: authErr } = await supaUser.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { bucket, path, contentType } = await req.json()
  if (!bucket || !path) return NextResponse.json({ error: 'bucket and path required' }, { status: 400 })
  if (!SERVICE) return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })

  const supaService = createClient(URL, SERVICE)
  const { data, error } = await supaService.storage.from(bucket).createSignedUploadUrl(path)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ...data, contentType: contentType || 'application/octet-stream' })
}
