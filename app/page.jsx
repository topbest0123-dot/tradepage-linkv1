// app/page.jsx
'use client';

/**
 * Homepage — keep HERO exactly as-is.
 * Below the red line: no content, and a hard cut to a warm cream background.
 */

export default function HomePage() {
  return (
    <main className="tp-home tp-home--light">
      <style>{styles}</style>

      {/* HERO (unchanged) */}
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

      {/* BELOW THE RED LINE: no content; just a full-width cream slab */}
      <section className="transition-slab" aria-hidden="true" />
    </main>
  );
}

/* Styles */
const styles = `
/* ----------- TOKENS ----------- */
:root{
  --bg:#0b1017;             /* existing dark/navy top stays */
  --text:#101418;
  --muted:#5a6672;
  --border:#1b2230;

  /* warm cream target */
  --below-bg:#f6f0e7;

  /* phone sizing */
  --phone-w: 360px;
  --frame-inset: 10px;
  --screen-inset: 22px;
  --punch-top: 16px;
  --statusbar-lr: 30px;
  --statusbar-top: 22px;

  --hero-h: 620px;
}

/* Keep top as-is; subtle dark with glows */
html,body{
  background:
    radial-gradient(900px 420px at -10% -6%, rgba(255,188,143,.12), transparent 60%),
    radial-gradient(1000px 500px at 70% -10%, rgba(122,186,255,.14), transparent 60%),
    linear-gradient(180deg, var(--bg), var(--bg));
  color:var(--text);
  overflow-x:hidden; /* prevent full-bleed slab from causing scroll */
}

/* layout helpers */
.tp-home{color:var(--text)}
.container{max-width:1180px;margin:0 auto;padding:0 16px}

/* HERO (unchanged) */
.hero{position:relative;padding:54px 0 12px;border-bottom:1px solid rgba(255,255,255,.08)}
.hero .container{display:grid;grid-template-columns:1fr;gap:28px}
.hero h1{margin:10px 0 8px;font-size:42px;line-height:1.06;font-weight:1000;letter-spacing:.2px;color:#fff}
.hero .dot{color:transparent;background:linear-gradient(135deg,#5aa6ff,#77e2b3);-webkit-background-clip:text;background-clip:text}
.lead{font-size:16px;line-height:1.75;max-width:760px;color:rgba(255,255,255,.75)}
.hero-visual{display:flex;justify-content:center}

/* Phone mock */
.device-ultra{
  position:relative; width:var(--phone-w); max-width:100%; aspect-ratio:9/19;
  border-radius:40px; background:linear-gradient(180deg,#b6bcc6,#8c929c);
  box-shadow:0 40px 120px rgba(32,39,68,.18); border:1px solid rgba(255,255,255,.45);
}
.frame2{
  position:absolute; inset:var(--frame-inset); border-radius:32px; background:#0a0d12;
  box-shadow:0 0 0 12px rgba(0,0,0,.18) inset; overflow:hidden;
}
.screen{position:absolute; inset:var(--screen-inset); border-radius:24px; background:#000; object-fit:cover; display:block;}
.punch2{
  position:absolute; top:var(--punch-top); left:50%; transform:translateX(-50%);
  width:12px;height:12px;border-radius:50%;background:#000;opacity:.95;
  box-shadow:0 0 0 2px rgba(255,255,255,.22) inset, 0 0 8px rgba(0,0,0,.5);
  pointer-events:none;
}
.statusbar{
  position:absolute; left:var(--statusbar-lr); right:var(--statusbar-lr); top:var(--statusbar-top); height:18px;
  display:flex;align-items:center;justify-content:space-between;
  color:#fff;font-size:12px;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.45);opacity:.95;
}
.time{font-weight:700}.sicons{display:flex;align-items:center;gap:6px}
.sig svg,.wifi svg{display:block}
.bat{position:relative;width:22px;height:10px;border:1.6px solid rgba(255,255,255,.98);border-radius:2px}
.bat::after{content:'';position:absolute;right:-3px;top:3px;width:2px;height:4px;background:rgba(255,255,255,.98);border-radius:1px}
.bat .lvl{position:absolute;left:2px;top:2px;height:6px;width:16px;background:#fff;border-radius:1px}

/* ambient glows (keep) */
.glow{position:absolute;filter:blur(48px);opacity:.35;pointer-events:none}
.g1{width:620px;height:620px;left:-180px;top:-160px;background:radial-gradient(closest-side,#77e2b3,transparent 70%)}
.g2{width:600px;height:600px;right:-180px;top:-140px;background:radial-gradient(closest-side,#5aa6ff,transparent 70%)}

/* ---- BELOW THE RED LINE ----
   Full-bleed slab with NO fade (clean hard edge) */
.transition-slab{
  position: relative;

  /* full-bleed */
  left: 50%;
  margin-left: -50vw;
  width: 100vw;

  min-height: 100vh;
  background: var(--below-bg);
  margin: 0; padding: 0; border: 0;
}

/* DESKTOP ENHANCEMENTS */
@media (min-width:980px){
  .hero .container{grid-template-columns:1.05fr .95fr;align-items:center}
  .hero h1{font-size:66px}
  .lead{font-size:18px}
  .hero-visual{justify-content:flex-end}
  :root{ --hero-h: 680px; }
}

/* MOBILE sizing kept for the phone mock */
@media (max-width:900px){
  :root{
    --phone-w: 340px; --frame-inset: 10px; --screen-inset: 22px;
    --punch-top: 16px; --statusbar-lr: 28px; --statusbar-top: 20px;
  }
}
@media (max-width:640px){
  :root{
    --phone-w: 320px; --frame-inset: 9px; --screen-inset: 20px;
    --punch-top: 15px; --statusbar-lr: 26px; --statusbar-top: 19px;
  }
}
@media (max-width:480px){
  :root{
    --phone-w: 300px; --frame-inset: 8px; --screen-inset: 18px;
    --punch-top: 14px; --statusbar-lr: 24px; --statusbar-top: 18px;
  }
}

/* tiny helpers */
.hide-d{display:inline}@media(min-width:980px){.hide-d{display:none}}
`;
