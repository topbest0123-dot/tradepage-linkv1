// app/page.jsx
'use client';

export default function HomePage() {
  return (
    <main className="tp-home">
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
                    <span className="bat"><i className="lvl" /></span>
                  </div>
                </div>

                <div className="punch2" />
              </div>
            </div>
          </div>
        </div>

        <div className="glow g1" />
        <div className="glow g2" />
      </section>

      {/* FULL-WIDTH LIGHT BAND (edge-to-edge, with smooth blend) */}
      <section className="soft-band">
        <div className="container">
          <div className="soft-placeholder">
            <h2>Next section starts here</h2>
            <p>
              We’ll add your content here. This area has a warm, light background and a clean fade from the hero.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Styles */
const styles = `
/* ========= base (dark hero) ========= */
:root{
  --bg:#0b1016; --text:#eaf2ff; --muted:#a6b2c2; --border:#1f2a36;
  --btn-primary-1:#66a6ff; --btn-primary-2:#77e2b3;

  /* phone tokens */
  --phone-w:360px; --frame-inset:10px; --screen-inset:22px;
  --punch-top:16px; --statusbar-lr:30px; --statusbar-top:22px;

  /* light band palette (tweak freely) */
  --band-bg-1:#fbf6ef;  /* top */
  --band-bg-2:#f7f0e6;  /* bottom */
  --band-accent-a:rgba(255,188,143,.24);
  --band-accent-b:rgba(122,186,255,.22);
}

/* Dark page background for the HERO */
html,body{
  background:
    radial-gradient(900px 420px at 20% -6%, rgba(102,166,255,.25), transparent 60%),
    radial-gradient(900px 420px at 90% -6%, rgba(119,226,179,.22), transparent 60%),
    linear-gradient(180deg, #0b1219, #0a1117 70%, #0a1016);
  color:var(--text);
}

.tp-home{color:var(--text)}
.container{max-width:1180px;margin:0 auto;padding:0 16px}

/* HERO */
.hero{position:relative;padding:54px 0 84px}
.hero .container{display:grid;grid-template-columns:1fr;gap:28px}
.hero h1{margin:10px 0 8px;font-size:42px;line-height:1.06;font-weight:1000;letter-spacing:.2px}
.hero .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}
.lead{font-size:16px;line-height:1.75;color:var(--muted);max-width:760px}
.hero-visual{display:flex;justify-content:center}

/* PHONE (unchanged) */
.device-ultra{
  position:relative;width:var(--phone-w);max-width:100%;aspect-ratio:9/19;border-radius:40px;
  background:linear-gradient(180deg,#b6bcc6,#8c929c);box-shadow:0 40px 120px rgba(32,39,68,.18);
  border:1px solid rgba(255,255,255,.45);
}
.frame2{position:absolute;inset:var(--frame-inset);border-radius:32px;background:#0a0d12;box-shadow:0 0 0 12px rgba(0,0,0,.18) inset;overflow:hidden}
.screen{position:absolute;inset:var(--screen-inset);border-radius:24px;background:#000;object-fit:cover;display:block}
.punch2{position:absolute;top:var(--punch-top);left:50%;transform:translateX(-50%);width:12px;height:12px;border-radius:50%;background:#000;opacity:.95;box-shadow:0 0 0 2px rgba(255,255,255,.22) inset,0 0 8px rgba(0,0,0,.5);pointer-events:none}
.statusbar{position:absolute;left:var(--statusbar-lr);right:var(--statusbar-lr);top:var(--statusbar-top);height:18px;display:flex;align-items:center;justify-content:space-between;color:#fff;font-size:12px;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.45);opacity:.95}
.time{font-weight:700}.sicons{display:flex;align-items:center;gap:6px}
.sig svg,.wifi svg{display:block}
.bat{position:relative;width:22px;height:10px;border:1.6px solid rgba(255,255,255,.98);border-radius:2px}
.bat::after{content:'';position:absolute;right:-3px;top:3px;width:2px;height:4px;background:rgba(255,255,255,.98);border-radius:1px}
.bat .lvl{position:absolute;left:2px;top:2px;height:6px;width:16px;background:#fff;border-radius:1px}

/* Hero glows */
.glow{position:absolute;filter:blur(48px);opacity:.35;pointer-events:none}
.g1{width:620px;height:620px;left:-180px;top:-160px;background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%)}
.g2{width:600px;height:600px;right:-180px;top:-140px;background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%)}

/* ========== FULL-WIDTH LIGHT BAND ========== */
/* We use a full-bleed pseudo element so it ALWAYS spans 100vw,
   even if a parent gets constrained later. Also adds the smooth blend. */
.soft-band{position:relative;isolation:isolate;padding:64px 0 96px;color:#101418}
.soft-band::before{
  content:"";position:absolute;z-index:-1;top:0;bottom:0;left:50%;right:50%;
  margin-left:-50vw;margin-right:-50vw;width:100vw; /* full-bleed */
  background:
    radial-gradient(900px 420px at 15% 0%, var(--band-accent-a), transparent 60%),
    radial-gradient(900px 420px at 85% 0%, var(--band-accent-b), transparent 60%),
    linear-gradient(180deg, var(--band-bg-1) 0%, var(--band-bg-2) 100%);
}
.soft-band::after{
  content:"";position:absolute;z-index:-1;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;
  top:-140px;height:140px; /* the dark->light fade */
  background:linear-gradient(to bottom, rgba(11,17,23,1) 0%, rgba(11,17,23,.65) 28%, rgba(11,17,23,.25) 60%, rgba(11,17,23,0) 100%);
}

.soft-placeholder{max-width:800px;margin:0 auto;text-align:center}
.soft-placeholder h2{margin:0 0 8px;font-size:28px;font-weight:900}
.soft-placeholder p{margin:0;opacity:.75}

/* Responsive phone scaling */
@media (max-width:900px){
  :root{ --phone-w:340px; --statusbar-lr:28px; --statusbar-top:20px; }
}
@media (max-width:640px){
  :root{ --phone-w:320px; --frame-inset:9px; --screen-inset:20px; --punch-top:15px; --statusbar-lr:26px; --statusbar-top:19px; }
}
@media (max-width:480px){
  :root{ --phone-w:300px; --frame-inset:8px; --screen-inset:18px; --punch-top:14px; --statusbar-lr:24px; --statusbar-top:18px; }
}

/* helpers */
.hide-d{display:inline}@media(min-width:980px){.hide-d{display:none}}
`;
