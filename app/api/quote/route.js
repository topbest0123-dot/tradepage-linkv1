// app/api/quote/route.js
import { Resend } from 'resend';

export const runtime = 'nodejs'; // use Node runtime for the Resend SDK

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

export async function POST(req) {
  try {
    const {
      to,                 // recipient = tradesperson email from dashboard
      businessName,
      profileSlug,
      name,
      phone,
      email,
      description,
      imageUrls = [],
    } = await req.json();

    if (!to) {
      return new Response(JSON.stringify({ error: 'Missing recipient' }), { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || 'TradePage <noreply@yourdomain.com>';

    const subject = `New quote request from ${name || 'Someone'} — ${businessName || profileSlug || 'TradePage'}`;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5">
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
        ${imageUrls.length
          ? imageUrls.map((u, i) => `<div><a href="${u}">Photo ${i + 1}</a></div>`).join('')
          : '<div>— none —</div>'}
      </div>
    `;

    await resend.emails.send({ from, to, subject, html });

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
}
