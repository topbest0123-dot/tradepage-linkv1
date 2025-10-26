import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Make sure this route runs on the Node runtime (so server env vars are available)
export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { bucket, path /* contentType not strictly needed here */ } = await req.json() || {}
    if (!bucket || !path) {
      return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 })
    }

    // 1) Verify the caller is a real logged-in user (using their access token sent from the client)
    const authHeader = req.headers.get('authorization') || ''
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
    }

    // 2) Use the SERVICE ROLE to create a signed upload URL
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // ONLY on server
    )

    const { data, error } = await admin
      .storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return both pieces the client needs
    // - signedUrl: PUT destination
    // - token: goes in Authorization header for the PUT
    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token
    })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
