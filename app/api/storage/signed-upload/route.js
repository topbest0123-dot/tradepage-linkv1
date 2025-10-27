// app/api/storage/signed-upload/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const { bucket, path } = await req.json();
    if (!bucket || !path) {
      return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 });
    }

    // Validate caller: must include Authorization: Bearer <access_token>
    const auth = req.headers.get('authorization') || '';
    const accessToken = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token is a real logged-in user
    const userScoped = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );
    const { data: userData, error: userErr } = await userScoped.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Use the service role to issue the signed upload token
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // data = { token, path }
    return NextResponse.json({ token: data.token, path });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
