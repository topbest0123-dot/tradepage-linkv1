// app/signin/page.jsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const sendLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSending(true);
      setMsg('');
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      setMsg('Check your inbox for the sign-in link.');
    } catch (err) {
      setMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="signin">
      <style>{styles}</style>

      {/* Dark header card (matches home hero theme) */}
      <section className="hero">
        <div className="container">
          <form className="signin-card" onSubmit={sendLink}>
            <h1>Sign in / create account</h1>
            <p className="muted">We’ll email you a secure magic link. No password required.</p>

            <label className="lbl" htmlFor="email">Email address</label>
            <input
              id="email"
              className="field"
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="btn-wide btn-gradient" disabled={sending}>
              {sending ? 'Sending…' : 'Send me the sign-in link'}
            </button>

            <p className="subline">✓ No credit card • No hidden fees • Cancel anytime</p>

            {msg && <div className="note">{msg}</div>}
          </form>
        </div>
      </section>

      {/* Light continuation area (same style language as home) */}
      <section className="light-area">
        <div className="container">
          <div className="tiles">
            <Tile title="One-tap to save your info" icon="⭐">
              New: customers can save your contact details with a single tap, so they call you first next time.
            </Tile>
            <Tile title="Built for trades" icon="🧰">
              All essentials on one page: contact, quote form, prices, services, photos and socials.
            </Tile>
            <Tile title="Mobile-first" icon="📱">
              Looks pro on phones — where customers actually decide and contact.
            </Tile>
            <Tile title="Edit from your phone" icon="⚡">
              Update services, areas and prices in seconds. Changes are live instantly.
            </Tile>
          </div>

          <div className="how">
            <h3>How the free trial works</h3>
            <ul>
              <li><b>Day 0:</b> Enter your email. We send a secure sign-in link — no password, no card.</li>
              <li><b>Days 1–14:</b> Share your link, collect quotes and calls, and measure the difference.</li>
              <li><b>Day 14:</b> Love it or leave it. Continue on a simple monthly plan, or walk away — no hassle.</li>
            </ul>
          </div>

          <div className="faq">
            <details>
              <summary>Do I need to add card details now?</summary>
              <p>No. Get your free 14-day trial first — completely card-free. Decide later.</p>
            </details>
            <details>
              <summary>Can I cancel during the trial?</summary>
              <p>Yes — cancel anytime in one click during the trial.</p>
            </details>
            <details>
              <summary>Is there a contract?</summary>
              <p>No contracts. Keep it month-to-month. Love it or leave it.</p>
            </details>
          </div>

          <div className="cta">
            <a href="#email" onClick={(e)=>{e.preventDefault(); document.getElementById('email')?.focus();}} className="btn-wide btn-gradient">
              Start your free trial
            </a>
            <p className="tiny">Takes under 1 minute. No card required.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ----- tiny presentational tile ----- */
function Tile({ title, icon, children }) {
  return (
    <div className="tile">
      <div className="tile-head">
        <span className="ico" aria-hidden>{icon}</span>
        <h4>{title}</h4>
      </div>
      <p>{children}</p>
    </div>
  );
}

/* ===== styles (kept consistent with home) ===== */
const styles = `
:root{
  --bg:#0b1017;                 /* dark hero background */
  --primary-1:#5aa6ff;
  --primary-2:#22a06b;

  /* light area palette */
  --below-bg:#f6f0e7;
  --la-text:#0f1216;
  --la-muted:#3f4852;
  --la-border:#d9d3c7;
  --la-card:#ffffff;
}

html, body{ background:var(--bg); color:#fff; }

.container{ max-width:980px; margin:0 auto; padding:0 16px; }

/* hero */
.hero{ padding:28px 0 20px; border-bottom:1px solid rgba(255,255,255,.08); }
.signin-card{
  background:linear-gradient(180deg, rgba(12,16,24,.9), rgba(12,16,24,.8));
  border:1px solid rgba(255,255,255,.12);
  border-radius:20px;
  padding:18px;
  box-shadow:0 20px 60px rgba(8,12,20,.35);
}
.signin-card h1{ margin:0 0 4px; font-size:20px; font-weight:900; color:#fff; }
.muted{ color:rgba(255,255,255,.75); margin:0 0 12px; }
.lbl{ display:block; margin:10px 0 6px; color:#cfe0ff; font-size:13px; }

.field{
  width:100%;
  height:44px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.06);
  color:#fff;
  padding:0 12px;
  outline:none;
}
.field::placeholder{ color:rgba(255,255,255,.55); }

.btn-wide{
  display:block; width:100%; text-align:center;
  height:44px; border-radius:12px; margin-top:10px;
  font-weight:800; color:#08101e; border:1px solid rgba(255,255,255,.1); text-decoration:none;
}
.btn-gradient{ background:linear-gradient(135deg, var(--primary-1), var(--primary-2)); }

.subline{ color:rgba(255,255,255,.8); font-size:12px; margin:10px 0 0; }
.note{ margin-top:10px; padding:10px; border-radius:10px; background:rgba(46,204,113,.1); color:#b8ffcf; border:1px solid rgba(46,204,113,.35); }

/* light continuation */
.light-area{
  background:var(--below-bg);
  color:var(--la-text);
  padding:18px 0 48px;
}
.tiles{ display:grid; grid-template-columns:1fr; gap:10px; }
.tile{ background:var(--la-card); border:1px solid var(--la-border); border-radius:16px; padding:12px; }
.tile-head{ display:flex; align-items:center; gap:10px; }
.tile h4{ margin:0; font-size:15px; font-weight:900; }
.tile p{ margin:6px 0 0; color:var(--la-muted); }

.ico{ width:28px; height:28px; display:grid; place-items:center; border-radius:8px; background:#fff; border:1px solid #eee; }

.how{ margin:14px 0; padding:12px; border:1px dashed var(--la-border); border-radius:14px; background:#fff; }
.how h3{ margin:0 0 8px; font-size:18px; font-weight:1000; }
.how ul{ margin:0; padding-left:18px; color:var(--la-muted); }

.faq details{ border:1px solid var(--la-border); background:#fff; border-radius:14px; margin:8px 0; padding:12px; }
.faq summary{ font-weight:900; cursor:pointer; list-style:none; }
.faq summary::-webkit-details-marker{ display:none; }
.faq p{ color:var(--la-muted); margin:8px 0 0; }

.cta{ text-align:center; margin-top:10px; }
.tiny{ margin-top:8px; font-size:12px; color:var(--la-muted); }

/* responsive tiles */
@media (min-width:980px){ .tiles{ grid-template-columns:1fr 1fr; } }

/* --- FIX: keep email input & button perfectly inside the card --- */
.signin-card .field,
.signin-card .btn-wide{
  box-sizing: border-box;
  max-width: 100%;
}
`;
