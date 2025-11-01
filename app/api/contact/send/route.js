// app/api/contact/route.js
export const runtime = 'nodejs'; // needed for Buffer/attachments (not Edge)

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO      = process.env.CONTACT_TO_EMAIL;   // e.g. hello@yourdomain.com (your Gmail/Workspace inbox)
const CONTACT_FROM    = process.env.CONTACT_FROM_EMAIL; // e.g. no-reply@tradepage.link (MUST be on a VERIFIED Resend domain)

function ensureEnv() {
  const missing = [];
  if (!RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!CONTACT_TO)      missing.push('CONTACT_TO_EMAIL');
  if (!CONTACT_FROM)    missing.push('CONTACT_FROM_EMAIL');
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

async function parseRequest(req) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    const name    = (fd.get('name')    || '').toString();
    const email   = (fd.get('email')   || '').toString();
    const phone   = (fd.get('phone')   || '').toString();
    const message = (fd.get('message') || '').toString();

    // Collect any File entries under common keys
    const files = [
      ...fd.getAll('images'),
      ...fd.getAll('photos'),
      ...fd.getAll('attachments'),
      ...fd.getAll('files'),
    ].filter(v => typeof v === 'object' && 'arrayBuffer' in v);

    const attachments = [];
    for (const f of files.slice(0, 10)) {
      const ab = await f.arrayBuffer();
      attachments.push({
        filename: f.name || 'upload',
        content: Buffer.from(ab),
      });
    }
    return { name, email, phone, message, attachments };
  } else {
    const json = await req.json().catch(() => ({}));
    return {
      name:    json.name    || '',
      email:   json.email   || '',
      phone:   json.phone   || '',
      message: json.message || '',
      attachments: [], // JSON path: skip binary for now
    };
  }
}

function renderHtml({ name, email, phone, message }) {
  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial">
      <h2 style="margin:0 0 8px">New contact message</h2>
      <p style="margin:0 0 6px"><b>Name:</b> ${escapeHtml(name)}</p>
      <p style="margin:0 0 6px"><b>Email:</b> ${escapeHtml(email)}</p>
      <p style="margin:0 0 12px"><b>Phone:</b> ${escapeHtml(phone)}</p>
      <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;white-space:pre-wrap">
        ${escapeHtml(message)}
      </div>
    </div>`;
}

function renderText({ name, email, phone, message }) {
  return [
    `New contact message`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    ``,
    message || ''
  ].join('\n');
}

function escapeHtml(s='') {
  return s
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

export async function POST(req) {
  try {
    ensureEnv();

    const data = await parseRequest(req);
    const { name, email, phone, message, attachments } = data;

    if (!name || !email || !message) {
      return Response.json({ ok:false, error:'Missing required fields (name, email, message)' }, { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);

    const res = await resend.emails.send({
      from: CONTACT_FROM,               // MUST be a verified domain in Resend
      to:   [CONTACT_TO],               // your receiving inbox (can be Gmail/Workspace)
      subject: 'New contact message — TradePageLink',
      reply_to: email,                  // so you can reply directly
      text: renderText(data),
      html: renderHtml(data),
      attachments: attachments.length ? attachments : undefined,
    });

    if (res?.error) {
      console.error('Resend error:', res.error);
      return Response.json({ ok:false, error:String(res.error) }, { status: 502 });
    }

    return Response.json({ ok:true });
  } catch (err) {
    console.error('Contact POST failed:', err);
    return Response.json({ ok:false, error: String(err?.message || err) }, { status: 500 });
  }
}

export function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
