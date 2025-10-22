// app/signin/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  // If already signed in, bounce to dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/dashboard');
    });
  }, [router]);

  const sendLink = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!email.trim()) return setMsg('Please enter your email.');
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // where the magic link will return after auth succeeds:
          emailRedirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/dashboard`
            : undefined,
        },
      });
      if (error) throw error;
      setMsg('Done! Check your inbox for a sign-in link.');
    } catch (err) {
      setMsg(err?.message || 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="tp-home tp-home--light">
      <style>{styles}</style>

      {/* ===== HERO (same dark theme) ===== */}
      <section className="hero">
        <div className="container signin-hero">
          <div className="hero-copy">
            <div className="trial-pill">14-day free trial</div>
            <h1>Start free. No card. No risk.</h1>
            <p className="lead">
              Try TradePage<span className="dot">.</span>Link free for 14 days — <b>no credit card</b>, <b>no contracts</b>, no fuss.
              Set up your page in minutes and see the difference. Love it or leave it after 14 days.
            </p>
          </div>

          {/* Sign-in card */}
          <div className="signin-card">
            <h3>Sign in / create account</h3>
            <p className="hint">We’ll email you a secure magic link. No password required.</p>
            <form onSubmit={sendLink} className="form">
              <label className="label">
                <span>Email address</span>
                <input
                  type="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="field"
                />
              </label>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary btn-wide"
                aria-busy={sending ? 'true' : 'false'}
              >
                {sending ? 'Sending link…' : 'Send me the sign-in link'}
              </button>

              {msg ? <div className="msg">{msg}</div> : null}
            </form>

            <div className="safe">
              ✓ No credit card • No hidden fees • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIGHT AREA (same palette) ===== */}
      <section className="light-area">
        <div className="container">

          {/* Mini value tiles (mirrors homepage style) */}
          <div className="la-grid">
            <Tile
              title="One-tap to save your info"
              text="New: customers can save your contact details with a single tap, so they call you first next time."
              icon="star"
            />
            <Tile
              title="Built for trades"
              text="All essentials on one page: contact, quote form, prices, services, photos and socials."
              icon="tool"
            />
            <Tile
              title="Mobile-first"
              text="Looks pro on phones — where customers actually decide and contact."
              icon="phone"
            />
            <Tile
              title="Edit from your phone"
              text="Update services, areas and prices in seconds. Changes are live instantly."
              icon="bolt"
            />
          </div>

          {/* Clear trial explainer */}
          <div className="trial-explainer">
            <h3>How the free trial works</h3>
            <ul>
              <li><b>Day 0:</b> Enter your email. We send a secure sign-in link — no password, no card.</li>
              <li><b>Days 1–14:</b> Share your link, collect quotes and calls, and measure the difference.</li>
              <li><b>Day 14:</b> Love it or leave it. Continue on a simple monthly plan, or walk away — no hassle.</li>
            </ul>
          </div>

          {/* FAQ snap */}
          <div className="la-faq">
            <details open>
              <summary>Do I need to add card details now?</summary>
              <p>No. Get your free 14-day trial first — completely card-free. Decide later.</p>
            </details>
            <details>
              <summary>Can I cancel during the trial?</summary>
              <p>Any time. Your page will simply stop accepting new quotes after the trial if you don’t continue.</p>
            </details>
            <details>
              <summary>Is there a contract?</summary>
              <p>No contracts and no long commitments. Month-to-month, simple and fair.</p>
            </details>
          </div>

          <div className="la-cta">
            <a href="/signin" className="btn-primary">Start your free trial</a>
            <p className="tiny">Takes under 1 minute. No card required.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* --------- small presentational tile --------- */
function Tile({ title, text, icon }) {
  return (
    <div className="feat">
      <span className="ico" aria-hidden>
        {icon === 'star'  && <svg viewBox="0 0 24 24"><path d="M12 2l3.2 6.5 7.2 1-5.2 5.1 1.3 7.1L12 18l-6.5 3.7 1.3-7.1L1.6 9.5l7.2-1L12 2z"/></svg>}
        {icon === 'tool'  && <svg viewBox="0 0 24 24"><path d="M21 7l-4 4-4-4 1.5-1.5a4 4 0 10-5.7 5.7L3 16v5h5l4.8-4.8a4 4 0 005.7-5.7L21 7z"/></svg>}
        {icon === 'phone' && <svg viewBox="0 0 24 24"><path d="M6 2h5l1 6-3 1a14 14 0 006 6l1-3 6 1v5c0 1-1 2-2 2C10 20 4 14 4 4c0-1 1-2 2-2Z"/></svg>}
        {icon === 'bolt'  && <svg viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 11-14h-7l0-6z"/></svg>}
      </span>
      <div className="feat-body">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}

/* =================== STYLES (matches homepage) =================== */
const styles = `
:root{
  --bg:#0b1017;
  --text:#101418;
  --muted:#5a6672;
  --border:#e6e1d7;
  --below-bg:#f6f0e7;
  --card:#ffffff;
  --primary-1:#5aa6ff;
  --primary-2:#22a06b;
}

html,body{
  background:
    radial-gradient(900px 420px at -10% -6%, rgba(255,188,143,.12), transparent 60%),
    radial-gradient(1000px 500px at 70% -10%, rgba(122,186,255,.14), transparent 60%),
    linear-gradient(180deg, var(--bg), var(--bg));
  color:var(--text);
  overflow-x:hidden;
}

.container{max-width:1180px;margin:0 auto;padding:0 16px}

/* HERO */
.hero{position:relative;padding:54px 0 20px;border-bottom:1px solid rgba(255,255,255,.08)}
.signin-hero{display:grid;grid-template-columns:1fr;gap:20px;align-items:center}
.hero h1{margin:8px 0 8px;font-size:42px;line-height:1.07;font-weight:1000;letter-spacing:.2px;color:#fff}
.lead{font-size:16px;line-height:1.75;max-width:760px;color:rgba(255,255,255,.78)}
.dot{color:transparent;background:linear-gradient(135deg,var(--primary-1),var(--primary-2));-webkit-background-clip:text;background-clip:text}
.trial-pill{display:inline-block;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:999px;padding:6px 10px;font-weight:800;font-size:12px;margin-bottom:6px}

/* Signin card */
.signin-card{
  background:linear-gradient(180deg,#111924,#0c141e);
  border:1px solid rgba(255,255,255,.12);
  border-radius:16px;
  padding:16px;
  color:#e9f1ff;
  box-shadow:0 20px 50px rgba(16,22,48,.25);
}
.signin-card h3{margin:0 0 4px;font-size:18px;font-weight:900;color:#fff}
.hint{margin:0 0 12px;color:rgba(255,255,255,.75);font-size:14px}
.form{display:grid;gap:10px}
.label{display:grid;gap:6px;font-size:14px}
.field{
  padding:12px;border-radius:12px;width:100%;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.25);color:#fff;
}
.msg{margin-top:8px;font-size:14px;color:#b4ffcf}
.safe{margin-top:10px;opacity:.85;font-size:12px;color:#cfe2ff}

.btn-primary{
  display:inline-block;padding:12px 16px;border-radius:14px;font-weight:900;
  background:linear-gradient(135deg,var(--primary-1),var(--primary-2));color:#08101e;text-decoration:none;
  border:1px solid rgba(255,255,255,.2);
  box-shadow:0 10px 24px rgba(16,22,48,.15)
}
.btn-wide{width:100%;text-align:center}

/* LIGHT AREA */
.light-area{
  position:relative;left:50%;transform:translateX(-50%);width:100vw;
  background:var(--below-bg);padding:28px 0 56px;
  --la-text:#0f1216; --la-muted:#3f4852; --la-border:#d9d3c7; --la-card:#fff;
  color:var(--la-text);
}
.light-area .tiny,.light-area p,.light-area li{color:var(--la-muted)}
.la-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:10px 0 20px}
.feat{display:flex;gap:12px;padding:12px;border:1px solid var(--la-border);border-radius:16px;background:var(--la-card);box-shadow:0 10px 30px rgba(16,22,48,.05)}
.ico{width:36px;height:36px;min-width:36px;border-radius:10px;display:grid;place-items:center;background:#fff;border:1px solid #eee;color:#0a0d12}
.ico svg{width:20px;height:20px;fill:currentColor;stroke:currentColor}
.feat-body h4{margin:0 0 4px;font-size:15px;font-weight:900}
.feat-body p{margin:0;font-size:14px}

.trial-explainer{margin:8px 0 16px;padding:12px;border:1px dashed var(--la-border);border-radius:14px;background:#fff}
.trial-explainer h3{margin:0 0 6px;font-size:18px;font-weight:1000}
.trial-explainer ul{margin:0;padding-left:18px}
.trial-explainer li{margin:8px 0}

.la-faq details{border:1px solid var(--la-border);background:#fff;border-radius:14px;margin:8px 0;padding:12px}
.la-faq summary{font-weight:900;cursor:pointer;list-style:none}
.la-faq summary::-webkit-details-marker{display:none}
.la-cta{text-align:center;margin-top:10px}
.tiny{margin-top:8px;font-size:12px}

@media (min-width:980px){
  .signin-hero{grid-template-columns:1.05fr .95fr}
  .hero h1{font-size:60px}
  .lead{font-size:18px}
  .la-grid{grid-template-columns:1fr 1fr;gap:14px}
}
`;
