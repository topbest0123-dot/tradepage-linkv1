// app/api/contact/route.js
export const runtime = 'nodejs';        // we need Node APIs (Buffer)
export const dynamic = 'force-dynamic'; // don't cache

export async function POST(req) {
  try {
    const fd = await req.formData();

    const name    = (fd.get('name')    || '').toString().trim();
    const email   = (fd.get('email')   || '').toString().trim();
    const phone   = (fd.get('phone')   || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();
    const files   = fd.getAll('photos');  // may be []

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const to   = process.env.CONTACT_TO;
    const from = process.env.CONTACT_FROM || 'onboarding@resend.dev'; // works w/o domain verification
    const key  = process.env.RESEND_API_KEY;

    if (!key) return Response.json({ error: 'RESEND_API_KEY not set.' }, { status: 500 });
    if (!to)  return Response.json({ error: 'CONTACT_TO not set.' }, { status: 500 });

    // Convert attachments (max 10, <=5MB each)
    const attachments = [];
    for (const f of files) {
      if (typeof f === 'string' || !f?.name) continue;
      if (f.size > 5 * 1024 * 1024) continue;
      const ab  = await f.arrayBuffer();
      const b64 = Buffer.from(ab).toString('base64');
      attachments.push({ filename: f.name, content: b64 });
      if (attachments.length >= 10) break;
    }

    // Build email
    const subject = `New contact — ${name}`;
    const html =
      `<div style="font-family:system-ui,Segoe UI,Roboto,Arial">
        <h2 style="margin:0 0 8px">New contact</h2>
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Phone:</b> ${esc(phone)}</p>
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px">${esc(message)}</pre>
      </div>`;

    // Send via Resend REST API (no npm package needed)
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html, attachments })
    });

    const out = await r.json().catch(() => ({}));
    if (!r.ok) {
      // Pass Resend’s message back to the client so you see WHY it failed.
      return Response.json({ error: out?.message || 'Email send failed.' }, { status: r.status });
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}
