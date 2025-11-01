// app/api/contact/send/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY); // required
const TO = process.env.CONTACT_TO_EMAIL || 'owner@example.com'; // set this
const FROM = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'; // replace with your verified sender when ready

export async function POST(req) {
  try {
    const form = await req.formData();

    const name = (form.get('name') || '').toString().slice(0, 120);
    const email = (form.get('email') || '').toString().slice(0, 200);
    const phone = (form.get('phone') || '').toString().slice(0, 60);
    const message = (form.get('message') || '').toString().slice(0, 8000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Collect up to 10 image attachments, each ≤ 5MB
    const files = form.getAll('photos');
    const limited = files.slice(0, 10);
    const attachments = [];
    for (const f of limited) {
      if (typeof f?.arrayBuffer !== 'function') continue;
      if (!f.type?.startsWith?.('image/')) continue;
      if (f.size > 5 * 1024 * 1024) continue;
      const buf = Buffer.from(await f.arrayBuffer());
      attachments.push({ filename: f.name || 'photo.jpg', content: buf });
    }

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial">
        <h2 style="margin:0 0 6px">New contact message</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Phone:</b> ${escapeHtml(phone || '-')}</p>
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa">${escapeHtml(message)}</pre>
        <p style="opacity:.7">Attachments: ${attachments.length}</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: FROM,            // e.g. "TradePage Contact <hello@yourdomain.com>"
      to: [TO],
      reply_to: email,       // so you can reply straight to the sender
      subject: `Contact form — ${name}`,
      html,
      attachments,           // buffers
    });

    if (error) {
      return NextResponse.json({ error: error.message || 'Email failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// tiny HTML escaper
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
  ));
}
