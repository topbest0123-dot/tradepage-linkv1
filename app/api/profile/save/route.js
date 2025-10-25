// app/api/profile/save/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req) {
  const authHeader = req.headers.get('authorization') || ''
  const supaUser = createClient(URL, ANON, { global: { headers: { Authorization: authHeader } } })
  const { data: { user }, error: authErr } = await supaUser.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const row = await req.json()
  // enforce ownership on the server
  row.id = user.id

  if (!SERVICE) return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })
  const supaService = createClient(URL, SERVICE)

  const { data, error } = await supaService.from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 })
  return NextResponse.json({ ok: true, data })
}
