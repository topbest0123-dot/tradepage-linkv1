// app/page.jsx
'use client';

/**
 * Homepage with a realistic modern phone mock.
 * Put your assets in /public:
 *  - tradepage-demo.mp4 (and optionally tradepage-demo.webm)
 *  - tradepage-demo.jpg  (poster frame)
 *  - flow-screenshot.jpg (optional static image for FLOW)
 */

export default function HomePage() {
  return (
    <main className="tp-home">
      <style>{styles}</style>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <p className="eyebrow">A single link customers actually use</p>
            <h1>
              The essentials. <br className="hide-d" />
              One link.
            </h1>
            <p className="lead">
              TradePage<span className="dot">.</span>Link removes the fluff and shows only what matters:
              <b> call</b>, <b>WhatsApp</b>, <b>quick quote</b>, <b>prices</b>, <b>services</b>, <b>gallery</b>, <b>socials</b>.
              Your customer acts in seconds—no wandering menus, no confusion.
            </p>

            <div className="chips" role="list">
              {[
                'Tap-to-Call',
                'Open WhatsApp',
                'Quick Quote',
                'Prices Up-Front',
                'Services',
                'Gallery',
                'Social Proof',
                'Share Anywhere',
              ].map((t) => (
                <span role="listitem" key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Modern phone mock */}
          <div className="hero-visual">
            <div className="device-neo">
              {/* side reflections */}
              <i className="edge edge-l" />
              <i className="edge edge-r" />

              <div className="bezel">
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
                        <rect x="0" y="9" width="2" height="3" fill="white" />
                        <rect x="4" y="7" width="2" height="5" fill="white" />
                        <rect x="8" y="5" width="2" height="7" fill="white" />
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
                    <span className="bat">
                      <i className="lvl" />
                    </span>
                  </div>
                </div>

                {/* punch-hole camera */}
                <div className="punch" />
              </div>
            </div>
          </div>
        </div>

        {/* ambient glows */}
        <div className="glow g1" />
        <div className="glow g2" />
      </section>

      {/* FLOW — sticky phone (desktop), linear story (mobile) */}
      <section className="flow">
        <div className="container flow-wrap">
          <div className="flow-phone">
            <div className="device-neo sticky">
              <i className="edge edge-l" />
              <i className="edge edge-r" />
              <div className="bezel">
                <img className="screen" src="/flow-screenshot.jpg" alt="Essentials view" loading="lazy" />
                <div className="statusbar">
                  <span className="time">12:08 PM</span>
                  <div className="sicons" aria-hidden>
                    <span className="sig">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <rect x="0" y="9" width="2" height="3" fill="white" />
                        <rect x="4" y="7" width="2" height="5" fill="white" />
                        <rect x="8" y="5" width="2" height="7" fill="white" />
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
                    <span className="bat">
                      <i className="lvl" />
                    </span>
                  </div>
                </div>
                <div className="punch" />
              </div>
            </div>
          </div>

          <div className="flow-steps">
            <h2>From link to lead in seconds</h2>
            <Step n="01" title="Open" text="Your trade, city and contact are instantly visible—no searching for the number." />
            <Step n="02" title="Skim" text="Clear prices and services remove guesswork so customers decide faster." />
            <Step n="03" title="Trust" text="Gallery + socials show real work and proof—without sending people away." />
            <Step n="04" title="Act" text="Tap to call or WhatsApp. Or fire a quick quote. Fewer clicks, more bookings." />
          </div>
        </div>
      </section>

      {/* VALUE BELT */}
      <section className="belt" aria-label="Highlights">
        <div className="belt-track">
          {[
            'Essentials-Only',
            'Ridiculously Fast',
            'Mobile-First',
            'Looks Professional',
            'Shareable Anywhere',
            'Frictionless',
            'Simple Pricing',
            'Easy to Edit',
          ].map((t, i) => (
            <span className="belt-pill" key={t + i}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="compare">
        <div className="container cmp-grid">
          <div className="cmp bad">
            <h3>Typical website</h3>
            <ul aria-label="Problems">
              {['Endless menus', 'Hidden contact', 'Slow + cluttered', 'Confusing copy', 'Too many steps'].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="cmp good">
            <h3>Your TradePage</h3>
            <ul aria-label="Benefits">
              {['Tap-to-call up-front', 'WhatsApp in one tap', 'Prices + services clear', 'Photos prove quality', 'Quote in seconds'].map((s) => (
                <li key={s}>{s}</li>
              ))}
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

/* Lightweight step row */
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
.tp-home{color:var(--text);background:var(--bg);}
.container{max-width:1180px;margin:0 auto;padding:0 16px}

/* HERO */
.hero{position:relative;padding:42px 0 10px;border-bottom:1px solid var(--border)}
.hero .container{display:grid;grid-template-columns:1fr;gap:24px}
.eyebrow{display:inline-block;font-size:12px;padding:8px 12px;border-radius:999px;border:1px solid var(--chip-border);background:var(--chip-bg);opacity:.95}
.hero h1{margin:10px 0 6px;font-size:40px;line-height:1.05;font-weight:1000;letter-spacing:.2px}
.hero .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}
.lead{font-size:16px;line-height:1.7;opacity:.95;max-width:760px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.chip{border:1px solid var(--chip-border);background:var(--chip-bg);padding:6px 10px;border-radius:999px;font-size:12px;white-space:nowrap}
.hero-visual{display:flex;justify-content:center}

/* --- Realistic modern phone --- */
.device-neo{
  position:relative;
  width:420px;max-width:100%;
  aspect-ratio:9/19;
  border-radius:42px;
  background:linear-gradient(180deg,#7a7f88,#3b3e44);
  box-shadow:
    0 40px 120px rgba(0,0,0,.35),
    0 1px 0 rgba(255,255,255,.12) inset,
    0 -1px 0 rgba(0,0,0,.45) inset;
  border:1px solid rgba(255,255,255,.08);
}

/* side reflections */
.device-neo .edge{
  content:'';position:absolute;top:10px;bottom:10px;width:9px;border-radius:8px;opacity:.6;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.05) 45%,rgba(0,0,0,.35) 55%,rgba(255,255,255,.2));
  filter:blur(.2px);
}
.device-neo .edge-l{left:6px}
.device-neo .edge-r{right:6px;transform:scaleX(-1)}

.bezel{
  position:absolute;inset:8px;border-radius:36px;
  background:linear-gradient(180deg,#0f1116,#0a0d12);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.06) inset,
    0 0 0 10px rgba(0,0,0,.25) inset;
}

/* punch-hole camera */
.punch{
  position:absolute;top:12px;left:50%;transform:translateX(-50%);
  width:12px;height:12px;border-radius:50%;
  background:#000;box-shadow:0 0 0 2px rgba(255,255,255,.12) inset, 0 0 8px rgba(0,0,0,.45);
  opacity:.9;pointer-events:none;
}

/* screen area */
.screen{
  position:absolute;inset:16px;border-radius:28px;background:#000;object-fit:cover;width:auto;height:auto;display:block;
  border:1px solid rgba(255,255,255,.06);
  box-shadow:
    0 0 0 1px rgba(0,0,0,.5) inset,
    0 18px 28px rgba(0,0,0,.45) inset;
  overflow:hidden;
}

/* tiny status bar */
.statusbar{
  position:absolute;left:26px;right:26px;top:18px;height:18px;
  display:flex;align-items:center;justify-content:space-between;
  color:#fff;font-size:12px;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.45);opacity:.9;
}
.time{font-weight:700;opacity:.95}
.sicons{display:flex;align-items:center;gap:6px}
.sig svg,.wifi svg{display:block}
.bat{position:relative;width:22px;height:10px;border:1.6px solid rgba(255,255,255,.95);border-radius:2px}
.bat::after{content:'';position:absolute;right:-3px;top:3px;width:2px;height:4px;background:rgba(255,255,255,.95);border-radius:1px}
.bat .lvl{position:absolute;left:2px;top:2px;height:6px;width:16px;background:#fff;border-radius:1px}

/* ambient glows */
.glow{position:absolute;filter:blur(48px);opacity:.5;pointer-events:none}
.g1{width:540px;height:540px;left:-160px;top:-140px;background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%)}
.g2{width:520px;height:520px;right:-160px;top:-120px;background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%)}

/* FLOW */
.flow{padding:24px 0}
.flow-wrap{display:grid;grid-template-columns:1fr;gap:18px}
.flow-phone{order:1}
.flow-steps{order:2}
.flow-steps h2{margin:0 0 6px;font-size:24px;font-weight:1000;text-wrap:balance}
.step{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px dashed var(--border)}
.step:last-child{border-bottom:0}
.step-n{width:40px;height:40px;min-width:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;border:1px solid var(--chip-border);background:var(--chip-bg)}
.step-title{font-weight:900}
.step-text{opacity:.92}

/* BELT */
.belt{padding:8px 0 2px}
.belt-track{display:flex;gap:10px;overflow:auto;padding:0 16px;scroll-snap-type:x mandatory}
.belt-pill{flex:0 0 auto;scroll-snap-align:start;border:1px solid var(--chip-border);background:var(--chip-bg);padding:8px 12px;border-radius:999px;font-size:12px}

/* COMPARE */
.compare{padding:26px 0 10px}
.cmp-grid{display:grid;grid-template-columns:1fr;gap:14px}
.cmp{padding:18px;border-radius:20px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))}
.cmp h3{margin:0 0 6px;font-size:16px;font-weight:1000}
.cmp ul{margin:0;padding:0;list-style:none}
.cmp li{padding:8px 0;border-bottom:1px dashed var(--border);opacity:.95}
.cmp li:last-child{border-bottom:0}
.cmp.bad li::before{content:'— ';opacity:.6}
.cmp.good li::before{content:'✓ ';}

/* NOTE */
.note{padding:22px 16px 48px;text-align:center;opacity:.9}
.note .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}

/* DESKTOP ENHANCEMENTS */
@media (min-width:980px){
  .hero .container{grid-template-columns:1.05fr .95fr;align-items:center}
  .hero h1{font-size:64px}
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
