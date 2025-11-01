// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime  = 'nodejs';           // avoid Edge gotchas
export const dynamic  = 'force-dynamic';
export const maxDuration = 30;              // generous limit for images

const pick = (...keys) => {
  for (const k of keys) {
    const v = process.env[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
};

const RESEND_KEY = pick('RESEND_API_KEY');
const FROM_EMAIL = pick('EMAIL_FROM','CONTACT_FROM');           // accept either name
const TO_EMAIL   = pick('CONTACT_TO_EMAIL','EMAIL_TO','EMAIL'); // accept either name

export async function POST(req) {
  try {
    if (!RESEND_KEY)  return NextResponse.json({ ok:false, error:'CONFIG: RESEND_API_KEY missing' }, { status: 500 });
    if (!FROM_EMAIL)  return NextResponse.json({ ok:false, error:'CONFIG: EMAIL_FROM (or CONTACT_FROM) missing' }, { status: 500 });
    if (!TO_EMAIL)    return NextResponse.json({ ok:false, error:'CONFIG: CONTACT_TO_EMAIL (or EMAIL_TO) missing' }, { status: 500 });

    const form = await req.formData();

    const name  = (form.get('name')  || '').toString().trim();
    const email = (form.get('email') || '').toString().trim();
    const phone = (form.get('phone') || '').toString().trim();
    const body  = (form.get('message') || '').toString().trim();

    if (!name && !email && !phone && !body) {
      return NextResponse.json({ ok:false, error:'Empty submission' }, { status: 400 });
    }

    // Collect up to 10 attachments
    const files = form.getAll('photos').slice(0, 10);
    const attachments = [];
    for (const f of files) {
      if (!(f && typeof f === 'object' && 'arrayBuffer' in f)) continue;
      if (f.size === 0) continue;
      // keep under ~5MB each by your UI constraint
      const ab = await f.arrayBuffer();
      attachments.push({
        filename: f.name || 'photo.jpg',
        content: Buffer.from(ab),
      });
    }

    const resend = new Resend(RESEND_KEY);

    const subject = `New contact — ${name || email || phone || 'anonymous'}`;
    const text = [
      `Name: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `Phone: ${phone || '-'}`,
      '',
      'Message:',
      body || '(no message)',
    ].join('\n');

    // HTML kept simple to reduce spam-score
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5; color:#111">
        <h2 style="margin:0 0 8px">New contact</h2>
        <p><b>Name:</b> ${escapeHtml(name) || '-'}</p>
        <p><b>Email:</b> ${escapeHtml(email) || '-'}</p>
        <p><b>Phone:</b> ${escapeHtml(phone) || '-'}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:12px 0" />
        <pre style="white-space:pre-wrap;font:inherit">${escapeHtml(body) || '(no message)'}</pre>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `TradePage Contact <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject,
      text,
      html,
      replyTo: email || undefined,     // correct key is replyTo
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      // bubble up the real reason for easier debugging
      return NextResponse.json({ ok:false, error: error.message || String(error) }, { status: 500 });
    }

    return NextResponse.json({ ok:true, id: data?.id || null });
  } catch (err) {
    return NextResponse.json({ ok:false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
