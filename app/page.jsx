// app/page.jsx
'use client';

/**
 * HERO (dark) stays exactly as-is.
 * LIGHT AREA (cream) has locked colors for strong contrast.
 * Extra conversion blocks are appended (same palette), no layout changes.
 */

export default function HomePage() {
  return (
    <main className="tp-home tp-home--light">
      <style>{styles}</style>
      {/* extra styles for new conversion blocks (append-only) */}
      <style>{convStyles}</style>

      {/* ======= HERO (unchanged) ======= */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1>
              A smart page made for Tradespeople. Have all your trade info in one link<br className="hide-d" />
             
            </h1>
            <p className="lead">
              TradePage<span className="dot">.</span>Link removes the fluff and shows your customers only what trully matters:
               <b>contact details</b>, <b>quote form</b>, <b>prices</b>, <b>services</b>, <b>gallery</b>, <b>social media</b>, <b>covering areas.</b> Customers act in seconds — no wandering menus, no confusion — more conversions!
            </p>
          </div>

          {/* Phone mock (unchanged size + proportions) */}
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

      {/* ======= LIGHT AREA (only) ======= */}
      <section className="light-area" aria-label="Why TradePage.Link">
        <div className="container">

          {/* Lead-in */}
          <div className="la-head">
            <h2>Built for trades. Built for speed.</h2>
            <p>When everything lives in one clean view, customers stop searching and start contacting. Fewer taps, fewer doubts, more jobs.</p>
            <a href="/signin" className="btn-primary">Create your page</a>

            {/* NEW feature announcement — small, non-intrusive */}
            <div className="la-new">
              <span className="pill">NEW</span>
              <b>One-tap to save your info</b> — customers can instantly save your contact in their phone.
            </div>
          </div>

          {/* Value grid */}
          <div className="la-grid">
            <Feature
              title="No menus. No maze."
              text="One screen shows the lot—contact, prices, services, photos, socials. Zero hunting."
              icon="maze"
            />
            <Feature
              title="Tap to call or WhatsApp"
              text="Buttons are up-front and labeled. Customers act instantly—no copying numbers."
              icon="phone"
            />
            <Feature
              title="Clear prices & services"
              text="Clarity builds trust. People decide faster when they see what you do and what it costs."
              icon="list"
            />
            <Feature
              title="Proof at a glance"
              text="Gallery and socials show real work, not claims. Trust without leaving the page."
              icon="gallery"
            />
            <Feature
              title="Works anywhere"
              text="Share the same link on Facebook, Instagram, flyers, vans, business cards—one link to rule them all."
              icon="share"
            />
            <Feature
              title="No app. No logins."
              text="Opens in any browser. Customers don’t need to install or create accounts."
              icon="bolt"
            />
          </div>

          {/* How it works */}
          <div className="la-steps">
            <h3>From link to lead in seconds</h3>
            <Step n="1" t="Open" d="Your trade, city and contact are visible immediately." />
            <Step n="2" t="Skim" d="Prices, services and photos remove guesswork." />
            <Step n="3" t="Act"  d="They tap Call or WhatsApp. Or send a quick quote." />
          </div>

          {/* Why this converts */}
          <div className="la-convert">
            <h3>Why this converts</h3>
            <ul>
              <li><b>Every extra tap loses people.</b> One clean view removes friction.</li>
              <li><b>Decision info sits together.</b> Contact + prices + proof = faster yes.</li>
              <li><b>Focused layout.</b> No wandering menus, popups, or dead links.</li>
              <li><b>Mobile-first.</b> Designed for small screens where your customers actually are.</li>
            </ul>
          </div>

          {/* Comparison */}
          <div className="la-compare">
            <div className="card bad">
              <h4>Typical website</h4>
              <ul className="bad-list">   {/* “Typical website” */}
                <li>Endless menus</li>
                <li>Hidden contact</li>
                <li>Slow + cluttered</li>
                <li>Confusing copy</li>
                <li>Too many steps</li>
                <li>Bad mobile interface</li>
                <li>Technical skills required</li>
                <li>Can't edit/add info from your phone</li>
              </ul>
            </div>

            <div className="card good">
              <h4>Your TradePage</h4>
              <ul className="good-list">  {/* “Your TradePage” */}
               <li>One tap to contact you everywhere</li>
               <li>Prices, services, trades clearly stated</li>
               <li>Photos & social media in one place</li>
               <li>Easy quote form access</li>
               <li>One tap to share your link everywhere</li>
               <li>Perfectly optimised for mobile</li>
               <li>Super easy to edit and manage</li>
               <li>Edit your page from your phone in seconds</li>
             </ul>
            </div>
          </div>


          {/* FAQ */}
          <div className="la-faq">
            <details>
              <summary>Is this a full website?</summary>
              <p>It’s a focused, conversion page for trades. Keep your old site if you want—TradePage.Link is the fast path that actually gets you calls.</p>
            </details>
            <details>
              <summary>Do customers need an app?</summary>
              <p>No. It opens in any browser on any device. They can contact you with one click.</p>
            </details>
            <details>
              <summary>Can I show my prices?</summary>
              <p>Yes—add guide prices or “from” prices so people qualify themselves before they ring.</p>
            </details>
            <details>
              <summary>How long to set up?</summary>
              <p>Minutes. Add your essentials, pick a colour theme, share your link.</p>
            </details>
          </div>

          {/* Final CTA */}
         <div className="la-cta">
            <h3>Be the trade that’s easy to contact.</h3>
            <a href="/signin" className="btn-primary">Create your page</a>
            <p className="tiny">One link. All the essentials. Built for conversions.</p>
          </div>

          {/* ==== Added conversion sections (append-only) ==== */}
          <ConversionBlocks />
        </div>
      </section>
    </main>
  );
}

/* Tiny presentational components */
function Feature({ title, text, icon }) {
  return (
    <div className="feat">
      <span className="ico" aria-hidden>
        {icon === 'maze' && <svg viewBox="0 0 24 24"><path d="M3 5h8v4H7v6H3V5Zm10 0h8v6h-4v4h-4V5Zm-6 14h14v-4h-6v-2" /></svg>}
        {icon === 'phone' && <svg viewBox="0 0 24 24"><path d="M6 2h5l1 6-3 1a14 14 0 006 6l1-3 6 1v5c0 1-1 2-2 2C10 20 4 14 4 4c0-1 1-2 2-2Z"/></svg>}
        {icon === 'list' && <svg viewBox="0 0 24 24"><path d="M4 6h14M4 12h14M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        {icon === 'gallery' && <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 13l3-3 5 6H8z"/></svg>}
        {icon === 'share' && <svg viewBox="0 0 24 24"><path d="M14 9l-4 2 4 2m6-9a3 3 0 11-6 0 3 3 0 016 0Zm0 14a3 3 0 11-6 0 3 3 0 016 0ZM6 12a3 3 0 110-6 3 3 0 010 6Z"/></svg>}
        {icon === 'bolt' && <svg viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 11-14h-7l0-6z"/></svg>}
      </span>
      <div className="feat-body">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Step({ n, t, d }) {
  return (
    <div className="step">
      <div className="bubble">{n}</div>
      <div>
        <div className="st">{t}</div>
        <div className="sd">{d}</div>
      </div>
    </div>
  );
}

/* ---------- Added conversion sections (append-only) ---------- */
function ConversionBlocks() {
  return (
    <>
      {/* REALITY (same layout as Solutions) */}
<section className="conv conv-reality">
  <h2 className="conv-h2">Without TradePageLink</h2>
  <div className="solutions-grid">
    {[
      { i:'📵', t:'Missed calls = missed work', d:'People give up if they can’t find your contact you fast.' },
      { i:'🔗', t:'Links all over the place', d:'Facebook, Insta, WhatsApp, website — customers don’t know where find them.' },
      { i:'🧩', t:'Confusing sites', d:'Menus, fluff, and slow load times kill conversions.' },
      { i:'⏳', t:'Quotes take too long', d:'Back-and-forth messages delay decisions, forms are slow and confusing.' },
      { i:'🖼️', t:'Work not shown', d:'No quick gallery = trust drops.' },
      { i:'📍', t:'Coverage unclear', d:'People don’t know if you serve their area or hours.' },
    ].map((b, i) => (
      <div key={i} className="sol-card">
        <div className="sol-ic">{b.i}</div>
        <div className="sol-t">{b.t}</div>
        <div className="sol-d">{b.d}</div>
      </div>
    ))}
  </div>
</section>

      {/* SOLUTIONS */}
      <section className="conv conv-solutions">
        <h2 className="conv-h2">How TradePageLink fixes it</h2>
        <div className="solutions-grid">
          {[
            { t:'One link, essentials only', d:'Contact, quote, services, prices, gallery & socials — up front.', i:'⚡' },
            { t:'Fast quote capture', d:'Simple form + photo upload. Quotes land straight in your email instantly.', i:'📩' },
            { t:'Proof on the spot', d:'Clean gallery shows real jobs so customers trust you faster.', i:'✅' },
            { t:'Clear coverage & hours', d:'Zones and opening hours remove guesswork and wasted calls.', i:'🗺️' },
            { t:'Mobile-first', d:'Built for phones — where your customers actually are.', i:'📱' },
            { t:'NEW — One-tap to save your info', d:'Customers can save your details to contacts in a single tap.', i:'⭐' },
          ].map((b, i) => (
            <div key={i} className="sol-card">
              <div className="sol-ic">{b.i}</div>
              <div className="sol-t">{b.t}</div>
              <div className="sol-d">{b.d}</div>
            </div>
          ))}
        </div>
        <div className="conv-cta">
          <a href="/signin" className="conv-btn">Get started — it’s free</a>
        </div>
      </section>

      {/* PROOF / QUOTES */}
      <section className="conv conv-proof">
        <div className="quotes">
          <blockquote>“We trimmed our site to one link and calls doubled.” <span>— Daniel, Handyman</span></blockquote>
          <blockquote>“People send photos with the quote — we price jobs in minutes.” <span>— Anna, Painter</span></blockquote>
          <blockquote>“Looks pro on mobile. Customers find everything straight away.” <span>— Chris, Landscaper</span></blockquote>
        </div>
      </section>

      {/* Mini-FAQ (complements your main FAQ) */}
      <section className="conv conv-faq">
        <h2 className="conv-h2">Good to know</h2>
        <div className="faq">
          <details>
            <summary>Can I edit everything from my phone?</summary>
            <p>Yes — update services, areas, prices and photos on the go. Changes are live instantly.</p>
          </details>
          <details>
            <summary>Where do quotes go?</summary>
            <p>Directly to the email you set in your dashboard. You can also be contacted via call or WhatsApp.</p>
          </details>
          <details>
            <summary>Can I keep my current website?</summary>
            <p>Absolutely. Use TradePage as your high-conversion link in bios, ads and messages.</p>
          </details>
        </div>
        <div className="conv-cta">
          <a href="/signin" className="conv-btn alt">Create your TradePage</a>
        </div>
      </section>
    </>
  );
}

/* =================== STYLES =================== */
const styles = `
/* ----------- CORE TOKENS (HERO UNTOUCHED) ----------- */
:root{
  --bg:#0b1017; /* hero stays dark */
  --text:#101418; /* global default; overridden inside light-area */
  --muted:#5a6672;
  --border:#e6e1d7;

  /* light area palette base */
  --below-bg:#f6f0e7;
  --card:#ffffff;

  /* primary */
  --primary-1:#5aa6ff;
  --primary-2:#22a06b;

  /* phone sizing for hero mock — ORIGINAL values */
  --phone-w: 360px;
  --frame-inset: 10px;
  --screen-inset: 22px;
  --punch-top: 16px;
  --statusbar-lr: 30px;
  --statusbar-top: 22px;

  /* NEW: exact centering with optional nudges */
  --screen-pos-x: 50%;
  --screen-pos-y: 50%;
  --screen-nudge-x: 0px;
  --screen-nudge-y: 6px; /* tweak this (e.g. 0px–10px) until it looks visually perfect */
}

html,body{
  background:
    radial-gradient(900px 420px at -10% -6%, rgba(255,188,143,.12), transparent 60%),
    radial-gradient(1000px 500px at 70% -10%, rgba(122,186,255,.14), transparent 60%),
    linear-gradient(180deg, var(--bg), var(--bg));
  color:var(--text);
  overflow-x:hidden;
}

/* layout helpers */
.tp-home{color:var(--text)}
.container{max-width:1180px;margin:0 auto;padding:0 16px}

/* HERO (mobile-first) */
.hero{
  position:relative;
  padding:54px 0 12px;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.hero .container{
  display:grid;
  grid-template-columns: 1fr;   /* ✅ mobile: text then mock below */
  gap:28px;
}
.hero h1{
  margin:10px 0 8px;
  font-size:42px;
  line-height:1.06;
  font-weight:1000;
  letter-spacing:.2px;
  color:#fff;
}
.lead{font-size:16px;line-height:1.75;max-width:760px;color:rgba(255,255,255,.75)}
.hero-visual{display:flex; justify-content:center;} /* ✅ center mock on mobile */

/* Desktop only */
@media (min-width:980px){
  .hero .container{
    grid-template-columns: 1.05fr .95fr;  /* two columns on desktop */
    align-items:center;
  }
  .hero h1{font-size:66px}
  .lead{font-size:18px}
  .hero-visual{justify-content:flex-end;} /* align right on desktop */
}


/* Phone mock (unchanged, original sizing preserved) */
.device-ultra{position:relative;width:var(--phone-w);max-width:100%;aspect-ratio:9/19;border-radius:40px;background:linear-gradient(180deg,#b6bcc6,#8c929c);box-shadow:0 40px 120px rgba(32,39,68,.18);border:1px solid rgba(255,255,255,.45)}
.frame2{position:absolute;inset:var(--frame-inset);border-radius:32px;background:#0a0d12;box-shadow:0 0 0 12px rgba(0,0,0,.18) inset;overflow:hidden}

/* UPDATED: keep video/screenshot perfectly centered with adjustable visual nudge */
.screen{
  position:absolute;
  inset:var(--screen-inset);
  width:100%;
  height:100%;
  border-radius:24px;
  background:#000;
  object-fit:cover;
  object-position: calc(var(--screen-pos-x) + var(--screen-nudge-x)) calc(var(--screen-pos-y) + var(--screen-nudge-y));
  display:block;
}

.punch2{position:absolute;top:var(--punch-top);left:50%;transform:translateX(-50%);width:12px;height:12px;border-radius:50%;background:#000;opacity:.95;box-shadow:0 0 0 2px rgba(255,255,255,.22) inset,0 0 8px rgba(0,0,0,.5)}
.statusbar{position:absolute;left:var(--statusbar-lr);right:var(--statusbar-lr);top:var(--statusbar-top);height:18px;display:flex;align-items:center;justify-content:space-between;color:#fff;font-size:12px;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.45);opacity:.95}
.time{font-weight:700}.sicons{display:flex;align-items:center;gap:6px}
.sig svg,.wifi svg{display:block}
.bat{position:relative;width:22px;height:10px;border:1.6px solid rgba(255,255,255,.98);border-radius:2px}
.bat::after{content:'';position:absolute;right:-3px;top:3px;width:2px;height:4px;background:rgba(255,255,255,.98);border-radius:1px}
.bat .lvl{position:absolute;left:2px;top:2px;height:6px;width:16px;background:#fff;border-radius:1px}
.glow{position:absolute;filter:blur(48px);opacity:.35;pointer-events:none}
.g1{width:620px;height:620px;left:-180px;top:-160px;background:radial-gradient(closest-side,#77e2b3,transparent 70%)}
.g2{width:600px;height:600px;right:-180px;top:-140px;background:radial-gradient(closest-side,#5aa6ff,transparent 70%)}

/* ===== LIGHT AREA (contrast locked) ===== */
.light-area{
  position:relative;
  left:50%; transform:translateX(-50%);
  width:100vw;
  background:var(--below-bg);
  padding:28px 0 56px;

  /* LOCKED palette ONLY inside light area */
  --la-text:  #0f1216;
  --la-muted: #3f4852;
  --la-border:#d9d3c7;
  --la-card:  #ffffff;

  color: var(--la-text);
}
.light-area h2,.light-area h3,.light-area h4{color:#0a0d12}
.light-area .la-head p,
.light-area .feat-body p,
.light-area .sd,
.light-area .la-convert li,
.light-area .card ul,
.light-area .la-faq p,
.light-area .tiny{color:var(--la-muted)}

.btn-primary{
  display:inline-block; padding:12px 16px; border-radius:14px; font-weight:900;
  background:linear-gradient(135deg,var(--primary-1),var(--primary-2)); color:#fff; text-decoration:none;
  box-shadow:0 10px 24px rgba(16,22,48,.15)
}
.btn-wide{padding:14px 18px; width:100%; text-align:center; border-radius:16px}

/* NEW feature pill */
.la-new{
  margin-top:10px; display:flex; gap:8px; align-items:center;
  font-size:14px; color:var(--la-text);
}
.la-new .pill{
  display:inline-flex; align-items:center; height:22px; padding:0 8px; border-radius:999px;
  background:linear-gradient(135deg,var(--primary-1),var(--primary-2)); color:#fff; font-weight:900; font-size:12px;
}

/* Value grid */
.la-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:6px 0 18px}
.feat{display:flex;gap:12px;padding:12px;border:1px solid var(--la-border);border-radius:16px;background:var(--la-card);box-shadow:0 10px 30px rgba(16,22,48,.05)}
.ico{width:36px;height:36px;min-width:36px;border-radius:10px;display:grid;place-items:center;background:#fff;border:1px solid #eee;color:#0a0d12}
.ico svg{width:20px;height:20px;fill:currentColor;stroke:currentColor}
.feat-body h4{margin:0 0 4px;font-size:15px;font-weight:900}
.feat-body p{margin:0;font-size:14px}

/* Steps */
.la-steps{margin:10px 0 16px}
.la-steps h3{margin:0 0 8px;font-size:20px;font-weight:1000}
.step{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px dashed #dbcfbf}
.step:last-child{border-bottom:0}
.bubble{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-weight:900;border:1px solid #e8dfd1;background:#fff}
.st{font-weight:900}
.sd{font-size:14px}

/* Why this converts */
.la-convert{margin:6px 0 16px;padding:12px;border:1px dashed #d8cdbf;border-radius:14px;background:#fff8}
.la-convert h3{margin:0 0 6px;font-size:18px;font-weight:1000}
.la-convert ul{margin:0;padding-left:18px}
.la-convert li{margin:8px 0}

/* Comparison */
.la-compare{display:grid;grid-template-columns:1fr;gap:10px;margin:6px 0 16px}
.card{padding:14px;border-radius:16px;border:1px solid var(--la-border);background:linear-gradient(180deg,#fff,#fbfaf7)}
.card h4{margin:0 0 6px;font-size:16px;font-weight:1000}

/* FAQ */
.la-faq details{border:1px solid var(--la-border);background:#fff;border-radius:14px;margin:8px 0;padding:12px}
.la-faq summary{font-weight:900;cursor:pointer;list-style:none}
.la-faq summary::-webkit-details-marker{display:none}

/* Final CTA */
.la-cta{text-align:center;margin-top:8px}
.la-cta h3{margin:0 0 10px;font-size:22px;font-weight:1000}
.tiny{margin:8px 0 0;font-size:12px}

/* Desktop layout (hero unchanged) */
@media (min-width:980px){
  .la-grid{grid-template-columns:1fr 1fr;gap:14px}
  .la-compare{grid-template-columns:1fr 1fr}
}

/* Mobile hero phone sizing — ORIGINAL values preserved */
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

/* ===== extra styles for conversion blocks (keeps the same cream palette) ===== */
const convStyles = `
.conv{ padding:28px 0 0; }
.conv-h2{ margin:0 0 12px; font-size:22px; font-weight:1000; color:#0a0d12; }

/* pains */
.pains-list{ margin:0; padding:0; list-style:none; display:grid; gap:10px; }
.pains-list li{
  display:flex; gap:10px; align-items:flex-start;
  border:1px solid #d9d3c7; background:linear-gradient(180deg,#ffffff,#fbfaf7);
  padding:12px; border-radius:14px; color:#3f4852;
}
.pains-list li span{ font-size:18px; line-height:1; }
.pains-list li b{ color:#0f1216; margin-right:6px; }

/* solutions */
.solutions-grid{ display:grid; grid-template-columns:1fr; gap:12px; margin-top:6px; }
.sol-card{
  border:1px solid #d9d3c7; background:linear-gradient(180deg,#ffffff,#fbfaf7);
  border-radius:16px; padding:14px; min-width:0;
}
.sol-ic{ font-size:20px; }
.sol-t{ font-weight:900; margin:4px 0 4px; color:#0f1216 }
.sol-d{ color:#3f4852 }
.conv-cta{ margin-top:14px; display:flex; justify-content:center }
.conv-btn{
  display:inline-flex; height:40px; align-items:center; padding:0 18px; border-radius:12px;
  font-weight:800; text-decoration:none; color:#fff;
  background:linear-gradient(135deg,var(--primary-1),var(--primary-2));
  border:1px solid #e6e1d7;
}
.conv-btn.alt{ background:#0f213a10; color:#0f1216; border:1px solid #d9d3c7 }

/* proof */
.conv-proof .quotes{ display:grid; grid-template-columns:1fr; gap:12px; margin-top:10px; }
.conv-proof blockquote{
  margin:0; padding:14px; border-radius:16px;
  border:1px solid #d9d3c7; background:linear-gradient(180deg,#ffffff,#fbfaf7);
  color:#0f1216;
}
.conv-proof blockquote span{ display:block; margin-top:6px; color:#3f4852; font-weight:600 }

/* mini-faq */
.conv-faq .faq{ display:grid; grid-template-columns:1fr; gap:10px; margin-top:6px; }
.conv-faq details{
  border:1px solid #d9d3c7; background:#fff; border-radius:14px; padding:12px; color:#0f1216;
}
.conv-faq summary{ font-weight:900; cursor:pointer }
.conv-faq p{ margin:8px 0 0; color:#3f4852 }

/* desktop */
@media(min-width:980px){
  .pains-list{ grid-template-columns:1fr 1fr; }
  .solutions-grid{ grid-template-columns:repeat(3, 1fr); }
  .conv-proof .quotes{ grid-template-columns:repeat(3,1fr); }
}
`;
