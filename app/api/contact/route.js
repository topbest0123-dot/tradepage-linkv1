// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const get = (k) => (process.env[k] || '').trim();

const RESEND_KEY = get('RESEND_API_KEY');
const FROM_RAW   = get('CONTACT_FROM') || get('EMAIL_FROM');        // your screenshot: contact@tradepage.link
const TO_EMAIL   = get('CONTACT_TO_EMAIL') || get('EMAIL_TO') || get('EMAIL');

function asFromHeader(raw) {
  if (!raw) return '';
  const clean = raw.replace(/[\r\n]/g, '').trim();
  // If already "Name <mail@domain>" keep as-is:
  if (/<[^>]+@[^>]+>/.test(clean)) return clean;
  // If it’s a plain address, keep it plain (Resend accepts this)
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return clean;
  return '';
}

const FROM = asFromHeader(FROM_RAW);

export async function POST(req) {
  try {
    if (!RESEND_KEY) return NextResponse.json({ ok:false, error:'Missing RESEND_API_KEY' }, { status:500 });
    if (!FROM)       return NextResponse.json({ ok:false, error:'EMAIL_FROM/CONTACT_FROM invalid. Use contact@tradepage.link or "Name <contact@tradepage.link>".' }, { status:500 });
    if (!TO_EMAIL)   return NextResponse.json({ ok:false, error:'Missing CONTACT_TO_EMAIL' }, { status:500 });

    const form = await req.formData();
    const name  = (form.get('name')    || '').toString().trim();
    const email = (form.get('email')   || '').toString().trim();
    const phone = (form.get('phone')   || '').toString().trim();
    const body  = (form.get('message') || '').toString().trim();

    // attachments (optional)
    const files = form.getAll('photos').slice(0, 10);
    const attachments = [];
    for (const f of files) {
      if (!f || typeof f !== 'object' || !('arrayBuffer' in f) || f.size === 0) continue;
      const ab = await f.arrayBuffer();
      attachments.push({ filename: f.name || 'photo.jpg', content: Buffer.from(ab) });
    }

    const resend = new Resend(RESEND_KEY);
    const subject = `New contact form enquire from — ${name || email || phone || 'anonymous'}`;

    const { data, error } = await resend.emails.send({
      from: FROM,                     // ← now robust (plain or "Name <…>" both OK)
      to: [TO_EMAIL],
      subject,
      text: [
        `Name: ${name || '-'}`,
        `Email: ${email || '-'}`,
        `Phone: ${phone || '-'}`,
        '',
        body || '(no message)'
      ].join('\n'),
      replyTo: email || undefined,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) return NextResponse.json({ ok:false, error: error?.message || String(error) }, { status:500 });
    return NextResponse.json({ ok:true, id: data?.id || null });
  } catch (err) {
    return NextResponse.json({ ok:false, error: err?.message || 'Unknown error' }, { status:500 });
  }
}
