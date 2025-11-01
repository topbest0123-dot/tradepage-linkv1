// app/contact/page.jsx
'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [files, setFiles] = useState([]);

  const onFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const images = selected.filter(f => f.type.startsWith('image/'));
    const max = 10;
    if (images.length > max) {
      setMsg(`Please select up to ${max} images.`);
      e.target.value = '';
      return;
    }
    const tooBig = images.find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setMsg('Each image must be ≤ 5MB.');
      e.target.value = '';
      return;
    }
    setFiles(images);
    setMsg('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setSending(true);
    try {
      const form = new FormData(e.currentTarget);
      files.forEach(f => form.append('photos', f));
      const res = await fetch('/api/contact/send', { method: 'POST', body: form });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Failed to send');
      e.currentTarget.reset();
      setFiles([]);
      setMsg('Thanks! Your message was sent.');
    } catch (err) {
      setMsg(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const fieldBase = {
    padding: 12, width: '100%', borderRadius: 12,
    border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--text)'
  };

  return (
    <section>
      <div style={{
        background: 'var(--card-bg-1)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 20, marginBottom: 16
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Contact us</h1>
        <p style={{ opacity: 0.85, marginTop: 6 }}>
          We usually reply within 1 business day. Attach photos if it helps explain your request.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{
        display: 'grid', gap: 12,
        background: 'var(--card-bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 16
      }}>
        <label>
          <div style={{ marginBottom: 6, opacity: 0.8 }}>Name</div>
          <input name="name" required placeholder="Your name" style={fieldBase} />
        </label>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <label>
            <div style={{ marginBottom: 6, opacity: 0.8 }}>Email</div>
            <input name="email" type="email" required placeholder="you@example.com" style={fieldBase} />
          </label>
          <label>
            <div style={{ marginBottom: 6, opacity: 0.8 }}>Phone</div>
            <input name="phone" placeholder="+44 7700 900123" style={fieldBase} />
          </label>
        </div>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.8 }}>How can we help?</div>
          <textarea name="message" required rows={6}
            placeholder="Describe your question or idea..."
            style={{ ...fieldBase, resize: 'vertical' }} />
        </label>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.8 }}>
            Photos (optional, up to 10, ≤ 5MB each)
          </div>
          <input type="file" accept="image/*" multiple onChange={onFiles}
            style={{ ...fieldBase, padding: 10, cursor: 'pointer' }} />
        </label>

        {files.length > 0 ? (
          <div style={{
            display: 'grid', gap: 8,
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))'
          }}>
            {files.map((f, i) => {
              const url = URL.createObjectURL(f);
              return (
                <div key={i} style={{
                  border: '1px solid var(--chip-border)', borderRadius: 10,
                  overflow: 'hidden', background: 'var(--chip-bg)', height: 90
                }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <button type="submit" disabled={sending} style={{
            height: 42, padding: '0 18px', borderRadius: 12, fontWeight: 800,
            border: '1px solid var(--border)',
            background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
            color: '#08101e', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1
          }}>
            {sending ? 'Sending…' : 'Send message'}
          </button>
          {msg ? <span style={{ opacity: 0.9 }}>{msg}</span> : null}
        </div>
      </form>

      <div style={{ marginTop: 16, opacity: 0.8, fontSize: 12 }}>
        By submitting, you agree we may contact you about your message.
      </div>
    </section>
  );
}
