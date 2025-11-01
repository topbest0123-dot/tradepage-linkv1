// app/contact/page.jsx
'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    setSending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch('/api/contact', { method: 'POST', body: fd });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Failed to send');
      setMsg('Thanks! Your message was sent.');
      e.currentTarget.reset();
    } catch (err) {
      setMsg(err.message || 'Something went wrong.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="contact-slab">
      <style jsx>{`
        .contact-slab {
          background: #faf7f1;      /* light slab like homepage */
          color: #191714;
          min-height: calc(100vh - 80px);
          padding: 24px 16px 56px;
        }
        .wrap { max-width: 900px; margin: 0 auto; }

        /* Card pattern */
        .card {
          background: #fff;
          border: 1px solid #eadfcd;
          border-radius: 18px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.02);
          overflow: hidden;         /* keep rounded look clean */
        }
        .inner { padding: 16px; }

        .gap16 { height: 16px; }

        h1 { margin: 0 0 6px; }
        p.lead { margin: 0; opacity: 0.9; }

        /* Form layout */
        form.inner {
          display: grid;
          gap: 14px;
          padding: 16px;            /* inner padding = centered look */
        }
        label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          display: block;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Inputs – fully centered with card using border-box */
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        textarea {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          box-sizing: border-box;
          padding: 12px 12px;
          border-radius: 12px;
          border: 1px solid #eadfcd;
          background: #fff;
          color: #191714;
          outline: none;
        }
        textarea { min-height: 140px; resize: vertical; }

        input:focus, textarea:focus {
          border-color: #dcccb4;
          box-shadow: 0 0 0 3px rgba(220,204,180,0.35);
        }

        .hint { font-size: 12px; opacity: 0.75; margin-top: 4px; }

        .actions {
          display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 6px;
        }
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          height: 40px; padding: 0 18px; border-radius: 12px;
          font-weight: 700; border: 1px solid #dcccb4;
          background: linear-gradient(135deg,#3b82f6,#22c55e);
          color: #08101e; cursor: pointer;
        }
        .btn[disabled] { opacity: .6; cursor: not-allowed; }
        .note { font-size: 13px; }

        @media (max-width: 720px) {
          .row { grid-template-columns: 1fr; }
          .inner { padding: 14px; }
          form.inner { gap: 12px; }
        }
      `}</style>

      <div className="wrap">
        {/* Intro card */}
        <section className="card">
          <div className="inner">
            <h1>Contact us</h1>
            <p className="lead">We usually reply within 1 business day. Attach photos if it helps explain your request.</p>
          </div>
        </section>

        <div className="gap16" />

        {/* Form card */}
        <section className="card">
          <form className="inner" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" placeholder="Your name" required />
            </div>

            <div className="row">
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" placeholder="+44 7700 900123" />
              </div>
            </div>

            <div>
              <label htmlFor="message">How can we help?</label>
              <textarea id="message" name="message" placeholder="Describe your question or idea..." required />
            </div>

            <div>
              <label htmlFor="photos">Photos (optional, up to 10, ≤ 5MB each)</label>
              <input id="photos" name="photos" type="file" accept="image/*" multiple />
              <div className="hint">You can select multiple images.</div>
            </div>

            <div className="actions">
              <button className="btn" type="submit" disabled={sending}>
                {sending ? 'Sending…' : 'Send message'}
              </button>
              {msg ? <span className="note">{msg}</span> : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
