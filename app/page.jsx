// app/page.jsx
'use client';
import { useEffect } from 'react';

/**
 * Homepage — light theme, with refined phone mock (no corner seams).
 * Assets in /public:
 *   - tradepage-demo.mp4 (and optionally tradepage-demo.webm)
 *   - tradepage-demo.jpg  (poster frame)
 *   - flow-screenshot.jpg (optional static image for FLOW)
 */

export default function HomePage() {
  // Force + lock a light palette on this route so it can't flip back to dark.
  useEffect(() => {
    const root = document.documentElement;

    // Light tokens to apply to :root as inline CSS variables
    const LIGHT = {
      '--bg': '#faf7f2',
      '--text': '#101418',
      '--muted': '#5a6672',
      '--border': '#e9e5dc',
      '--card-bg-1': '#ffffff',
      '--card-bg-2': '#f4f6fb',
      '--chip-bg': '#f6f7f9',
      '--chip-border': '#e7e8ec',
      '--btn-primary-1': '#5aa6ff',
      '--btn-primary-2': '#77e2b3',
    };

    // Remember previous inline values so we can restore on unmount
    const prev = {};
    for (const [k, v] of Object.entries(LIGHT)) {
      prev[k] = root.style.getPropertyValue(k);
      root.style.setProperty(k, v);
    }

    // If anything rewrites :root style, immediately re-apply our light tokens
    const obs = new MutationObserver(() => {
      for (const [k, v] of Object.entries(LIGHT)) {
        if (root.style.getPropertyValue(k).trim() !== v) {
          root.style.setProperty(k, v);
        }
      }
    });
    obs.observe(root, { attributes: true, attributeFilter: ['style'] });

    return () => {
      obs.disconnect();
      // restore whatever was there before visiting the homepage
      for (const [k, v] of Object.entries(prev)) {
        if (v) root.style.setProperty(k, v);
        else root.style.removeProperty(k);
      }
    };
  }, []);

  return (
    <main className="tp-home tp-home--light">
      <style>{styles}</style>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1>
              The essentials. <br className="hide-d" />
              One link.
            </h1>
            <p className="lead">
              TradePage<span className="dot">.</span>Link removes the fluff and shows only what matters:
              <b> call</b>, <b>WhatsApp</b>, <b>quick quote</b>, <b>prices</b>, <b>services</b>, <b>gallery</b>, <b>socials</b>.
              Your customer acts in seconds—no wandering menus, no confusion.
            </p>
          </div>

          {/* Refined modern phone mock (no seams) */}
          <div className="hero-visual">
            <div className="device-ultra">
              <div className="frame2">
                <video
                  className="screen"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/tradepage-demo.jpg"
                  preload="metadata"
                >
                  <source src="/tradepage-demo.webm" type="video/webm" />
                  <source src="/tradepage-demo.mp4" type="video/mp4" />
                </video>

                {/* status bar */}
                <div className="statusbar">
                  <span className="time">12:08 PM</span>
                  <div className="sicons" aria-hidden>
                    <span className="sig">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <rect x="0"  y="9" width="2" height="3" fill="white" />
                        <rect x="4"  y="7" width="2" height="5" fill="white" />
                        <rect x="8"  y="5" width="2" height="7" fill="white" />
                        <rect x="12" y="3" width="2" height="9" fill="white" />
                      </svg>
                    </span>
                    <span className="wifi">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M2 5.5a9 9 0 0112 0" stroke="white" strokeOpacity=".9" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M4.5 7.5a6 6 0 017 0" stroke="white" strokeOpacity=".85" strokeWidth="1.2" strokeLinecap="round"/>
                        <circle cx="8" cy="10.5" r="1.4" fill="white"/>
                      </svg>
                    </span>
                    <span className="bat"><i className="lvl" /></span>
                  </div>
                </div>

                {/* punch-hole camera */}
                <div className="punch2" />
              </div>
            </div>
          </div>
        </div>

        {/* ambient glows */}
        <div className="glow g1" />
        <div className="glow g2" />
      </section>

      {/* FLOW */}
      <section className="flow">
        <div className="container flow-wrap">
          <div className="flow-phone">
            <div className="device-ultra sticky">
              <div className="frame2">
                <img className="screen" src="/flow-screenshot.jpg" alt="Essentials view" loading="lazy" />
                <div className="statusbar">
                  <span className="time">12:08 PM</span>
                  <div className="sicons" aria-hidden>
                    <span className="sig">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <rect x="0"  y="9" width="2" height="3" fill="white" />
                        <rect x="4"  y="7" width="2" height="5" fill="white" />
                        <rect x="8"  y="5" width="2" height="7" fill="white" />
                        <rect x="12" y="3" width="2" height="9" fill="white" />
                      </svg>
                    </span>
                    <span className="wifi">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M2 5.5a9 9 0 0112 0" stroke="white" strokeOpacity=".9" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M4.5 7.5a6 6 0 017 0" stroke="white" strokeOpacity=".85" strokeWidth="1.2" strokeLinecap="round"/>
                        <circle cx="8" cy="10.5" r="1.4" fill="white"/>
                      </svg>
                    </span>
                    <span className="bat"><i className="lvl" /></span>
                  </div>
                </div>
                <div className="punch2" />
              </div>
            </div>
          </div>

          <div className="flow-steps">
            <h2>From link to lead in seconds</h2>
            <Step n="01" title="Open"  text="Your trade, city and contact are instantly visible—no searching for the number." />
            <Step n="02" title="Skim"  text="Clear prices and services remove guesswork so customers decide faster." />
            <Step n="03" title="Trust" text="Gallery + socials show real work and proof—without sending people away." />
            <Step n="04" title="Act"   text="Tap to call or WhatsApp. Or fire a quick quote. Fewer clicks, more bookings." />
          </div>
        </div>
      </section>

      {/* VALUE BELT */}
      <section className="belt" aria-label="Highlights">
        <div className="belt-track">
          {[
            'Essentials-Only','Ridiculously Fast','Mobile-First',
            'Looks Professional','Shareable Anywhere','Frictionless',
            'Simple Pricing','Easy to Edit'
          ].map((t, i) => <span className="belt-pill" key={t+i}>{t}</span>)}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="compare">
        <div className="container cmp-grid">
          <div className="cmp bad">
            <h3>Typical website</h3>
            <ul aria-label="Problems">
              {['Endless menus','Hidden contact','Slow + cluttered','Confusing copy','Too many steps']
                .map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div className="cmp good">
            <h3>Your TradePage</h3>
            <ul aria-label="Benefits">
              {['Tap-to-call up-front','WhatsApp in one tap','Prices + services clear','Photos prove quality','Quote in seconds']
                .map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* FOOT NOTE */}
      <section className="note">
        <p>
          TradePage<span className="dot">.</span>Link is the essentials-only profile for trades—one link that actually converts.
        </p>
      </section>
    </main>
  );
}

function Step({ n, title, text }) {
  return (
    <div className="step">
      <div className="step-n">{n}</div>
      <div className="step-body">
        <div className="step-title">{title}</div>
        <div className="step-text">{text}</div>
      </div>
    </div>
  );
}

/* Styles */
const styles = `
/* -------------- PAGE-WIDE LIGHT THEME --------------- */
:root{
  --bg:#faf7f2; --text:#101418; --muted:#5a6672; --border:#e9e5dc;
  --card-bg-1:#ffffff; --card-bg-2:#f4f6fb; --chip-bg:#f6f7f9; --chip-border:#e7e8ec;
  --btn-primary-1:#5aa6ff; --btn-primary-2:#77e2b3;
}
/* Keep the light theme tokens as-is above this */

/* Desktop/tablet background (subtle accents are fine here) */
html,body{
  background:
    radial-gradient(1000px 500px at 70% -10%, rgba(122,186,255,.25), transparent 60%),
    radial-gradient(900px 420px at -10% -6%, rgba(255,188,143,.22), transparent 60%),
    linear-gradient(180deg, #fff, var(--bg));
  color:var(--text);
}

/* --- MOBILE: remove the bluish gradient completely for readability --- */
@media (max-width: 768px){
  html,body{
    background: linear-gradient(180deg, #fff, var(--bg)) !important; /* clean, light */
  }
  /* also hide the decorative hero glows on small screens */
  .glow{ display:none !important; }
}


/* layout helpers */
.tp-home{color:var(--text)}
.container{max-width:1180px;margin:0 auto;padding:0 16px}

/* HERO */
.hero{position:relative;padding:54px 0 12px;border-bottom:1px solid var(--border)}
.hero .container{display:grid;grid-template-columns:1fr;gap:28px}
.hero h1{margin:10px 0 8px;font-size:42px;line-height:1.06;font-weight:1000;letter-spacing:.2px}
.hero .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}
.lead{font-size:16px;line-height:1.75;color:var(--muted);max-width:760px}
.hero-visual{display:flex;justify-content:center}

/* --------- REFINED PHONE MOCK (no corner seams) ---------- */
.device-ultra{
  position:relative;
  width:360px;max-width:100%;
  aspect-ratio:9/19;
  border-radius:40px;
  background:linear-gradient(180deg,#b6bcc6,#8c929c);
  box-shadow:0 40px 120px rgba(32,39,68,.18);
  border:1px solid rgba(255,255,255,.45);
}
.frame2{
  position:absolute;inset:10px;border-radius:32px;background:#0a0d12;
  box-shadow:0 0 0 12px rgba(0,0,0,.18) inset;
  overflow:hidden;
}
.screen{
  position:absolute;inset:22px;border-radius:24px;background:#000;object-fit:cover;display:block;
}
.punch2{
  position:absolute;top:16px;left:50%;transform:translateX(-50%);
  width:12px;height:12px;border-radius:50%;background:#000;opacity:.95;
  box-shadow:0 0 0 2px rgba(255,255,255,.22) inset, 0 0 8px rgba(0,0,0,.5);
  pointer-events:none;
}
.statusbar{
  position:absolute;left:30px;right:30px;top:22px;height:18px;
  display:flex;align-items:center;justify-content:space-between;
  color:#fff;font-size:12px;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.45);opacity:.95;
}
.time{font-weight:700}
.sicons{display:flex;align-items:center;gap:6px}
.sig svg,.wifi svg{display:block}
.bat{position:relative;width:22px;height:10px;border:1.6px solid rgba(255,255,255,.98);border-radius:2px}
.bat::after{content:'';position:absolute;right:-3px;top:3px;width:2px;height:4px;background:rgba(255,255,255,.98);border-radius:1px}
.bat .lvl{position:absolute;left:2px;top:2px;height:6px;width:16px;background:#fff;border-radius:1px}

/* ambient glows — soft for light bg */
.glow{position:absolute;filter:blur(48px);opacity:.35;pointer-events:none}
.g1{width:620px;height:620px;left:-180px;top:-160px;background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%)}
.g2{width:600px;height:600px;right:-180px;top:-140px;background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%)}

/* FLOW */
.flow{padding:28px 0}
.flow-wrap{display:grid;grid-template-columns:1fr;gap:20px}
.flow-phone{order:1}
.flow-steps{order:2}
.flow-steps h2{margin:0 0 8px;font-size:26px;font-weight:1000;color:var(--text)}
.step{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px dashed var(--border)}
.step:last-child{border-bottom:0}
.step-n{width:40px;height:40px;min-width:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-weight:900;border:1px solid var(--chip-border);background:#fff;color:var(--text);box-shadow:0 4px 12px rgba(0,0,0,.05)}
.step-title{font-weight:900;color:var(--text)}
.step-text{color:var(--muted)}

/* BELT */
.belt{padding:10px 0 4px}
.belt-track{display:flex;gap:10px;overflow:auto;padding:0 16px;scroll-snap-type:x mandatory}
.belt-pill{flex:0 0 auto;scroll-snap-align:start;border:1px solid var(--chip-border);background:#fff;padding:8px 12px;border-radius:999px;font-size:12px;color:var(--text);box-shadow:0 4px 12px rgba(0,0,0,.04)}

/* COMPARE */
.compare{padding:30px 0 12px}
.cmp-grid{display:grid;grid-template-columns:1fr;gap:16px}
.cmp{padding:20px;border-radius:18px;border:1px solid var(--border);
  background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));
  box-shadow:0 20px 40px rgba(16,22,48,.08)}
.cmp h3{margin:0 0 8px;font-size:16px;font-weight:1000;color:var(--text)}
.cmp ul{margin:0;padding:0;list-style:none}
.cmp li{padding:9px 0;border-bottom:1px dashed var(--border);color:var(--muted)}
.cmp li:last-child{border-bottom:0}
.cmp.bad li::before{content:'— ';opacity:.6}
.cmp.good li::before{content:'✓ ';color:#22a06b}

/* NOTE */
.note{padding:26px 16px 54px;text-align:center;color:var(--muted)}
.note .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}

/* DESKTOP ENHANCEMENTS */
@media (min-width:980px){
  .hero .container{grid-template-columns:1.05fr .95fr;align-items:center}
  .hero h1{font-size:66px}
  .lead{font-size:18px}
  .hero-visual{justify-content:flex-end}
  .flow-wrap{grid-template-columns:0.9fr 1.1fr;align-items:start}
  .flow-phone{order:1}
  .flow-steps{order:2;padding-left:10px}
  .sticky{position:sticky;top:86px}
  .cmp-grid{grid-template-columns:1fr 1fr}
}

/* tiny helpers */
.hide-d{display:inline}@media(min-width:980px){.hide-d{display:none}}
`;
