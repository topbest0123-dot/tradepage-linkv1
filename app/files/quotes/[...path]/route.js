// app/files/quotes/[...path]/route.js
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const BUCKET = process.env.QUOTES_BUCKET || 'quotes';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

function publicUrlFor(key) {
  // build the public URL (works even if we later switch to signed)
  const host = new URL(SUPABASE_URL).hostname; // e.g. ezwv...supabase.co
  const projectRef = host.split('.')[0];
  return `https://${projectRef}.supabase.co/storage/v1/object/public/${BUCKET}/${key}`;
}

export async function GET(_req, { params }) {
  const key = (params?.path || []).join('/'); // e.g. handyman/123.jpg
  if (!key) return new Response('Not Found', { status: 404 });

  // Try a short-lived signed URL (works for public or private buckets)
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(key, 60 * 60); // 1 hour
  const url = error ? publicUrlFor(key) : data.signedUrl;

  const r = await fetch(url);
  if (!r.ok) return new Response('Not Found', { status: 404 });

  const headers = new Headers(r.headers);
  headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  return new Response(r.body, { status: 200, headers });
}
