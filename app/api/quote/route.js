// app/api/quote/route.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// ---- config ----
const QUOTES_BUCKET = process.env.QUOTES_BUCKET || 'quotes'; // create this bucket (public or private)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'TradePage <noreply@yourdomain.com>';

// Admin client for Storage uploads
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

// helper: upload one file, return public/signed URL
async function uploadFile(file, prefix = '') {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const ext = file.name.split('.').pop() || 'bin';
  const key = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin
    .storage.from(QUOTES_BUCKET)
    .upload(key, fileBuffer, { contentType: file.type || 'application/octet-stream' });

  if (error) throw error;

  // If bucket is PUBLIC:
  const { data: pub } = supabaseAdmin.storage.from(QUOTES_BUCKET).getPublicUrl(key);
  return pub.publicUrl;

  // If bucket is PRIVATE instead, use signed URL:
  // const { data: signed } = await supabaseAdmin
  //   .storage.from(QUOTES_BUCKET)
  //   .createSignedUrl(key, 60 * 60 * 24 * 7); // 7 days
  // return signed.signedUrl;
}

export async function POST(req) {
  try {
    const ctype = req.headers.get('content-type') || '';

    // --- multipart/form-data path (from the /quote page) ---
    if (ctype.includes('multipart/form-data')) {
      const form = await req.formData();

      const to           = String(form.get('to') || '').trim();            // tradesperson email
      const businessName = String(form.get('businessName') || '').trim();
      const profileSlug  = String(form.get('profileSlug') || '').trim();
      const name         = String(form.get('name') || '').trim();
      const phone        = String(form.get('phone') || '').trim();
      const email        = String(form.get('email') || '').trim();
      const description  = String(form.get('description') || '').trim();

      if (!to) {
        return new Response(JSON.stringify({ error: 'Missing recipient' }), { status: 400 });
      }

      // files come as `photos` (multiple)
      const files = form.getAll('photos').filter(Boolean).slice(0, 10); // limit 10
      const uploadedUrls = [];
      for (const f of files) {
        if (typeof f === 'object' && 'arrayBuffer' in f) {
          const url = await uploadFile(f, profileSlug ? `${profileSlug}/` : '');
          uploadedUrls.push(url);
        }
      }

      const subject = `New quote request from ${name || 'Someone'} — ${businessName || profileSlug || 'TradePage'}`;

      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
          <h2 style="margin:0 0 8px">New quote request</h2>
          <p style="margin:0 0 8px"><b>Business:</b> ${esc(businessName || '')} ${profileSlug ? `(${esc(profileSlug)})` : ''}</p>
          <p style="margin:0 0 8px">
            <b>Name:</b> ${esc(name)}<br/>
            <b>Phone:</b> ${esc(phone)}<br/>
            <b>Email:</b> ${esc(email)}
          </p>
          <p style="margin:12px 0 8px"><b>Description</b></p>
          <div style="white-space:pre-wrap">${esc(description)}</div>
          <p style="margin:12px 0 8px"><b>Photos</b></p>
          ${
            uploadedUrls.length
              ? uploadedUrls.map((u, i) => `<div><a href="${u}">Photo ${i + 1}</a></div>`).join('')
              : '<div>— none —</div>'
          }
        </div>
      `;

      await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
      return Response.json({ ok: true, uploaded: uploadedUrls.length });
    }

    // --- JSON fallback (if you ever POST JSON with ready-made imageUrls) ---
    const {
      to, businessName, profileSlug, name, phone, email, description, imageUrls = [],
    } = await req.json();

    if (!to) {
      return new Response(JSON.stringify({ error: 'Missing recipient' }), { status: 400 });
    }

    const subject = `New quote request from ${name || 'Someone'} — ${businessName || profileSlug || 'TradePage'}`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 8px">New quote request</h2>
        <p style="margin:0 0 8px"><b>Business:</b> ${esc(businessName || '')} ${profileSlug ? `(${esc(profileSlug)})` : ''}</p>
        <p style="margin:0 0 8px">
          <b>Name:</b> ${esc(name)}<br/>
          <b>Phone:</b> ${esc(phone)}<br/>
          <b>Email:</b> ${esc(email)}
        </p>
        <p style="margin:12px 0 8px"><b>Description</b></p>
        <div style="white-space:pre-wrap">${esc(description)}</div>
        <p style="margin:12px 0 8px"><b>Photos</b></p>
        ${imageUrls.length ? imageUrls.map((u, i) => `<div><a href="${u}">Photo ${i + 1}</a></div>`).join('') : '<div>— none —</div>'}
      </div>
    `;
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
    return Response.json({ ok: true, uploaded: imageUrls.length });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
}
