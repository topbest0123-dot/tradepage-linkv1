// app/page.jsx
'use client';

/**
 * Homepage focused on: essentials-only, frictionless contact, and one-link simplicity.
 * Put your real page screenshot at /public/tradepage-demo.jpg
 */

export default function HomePage() {
  return (
    <main className="home">
      <style>{css}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero__copy">
          <div className="eyebrow">A single link your customers actually use</div>
          <h1>Frictionless pages for trades.</h1>
          <p className="lead">
            TradePage.Link removes website clutter and keeps only what buyers need:
            <b> tap-to-call, WhatsApp, quote, prices, services, gallery, and socials</b> — in one clean link.
            Easy to see, easy to press, zero confusion.
          </p>

          <ul className="benefit-bullets">
            <li>Contact in one tap (Call or WhatsApp)</li>
            <li>Instant quote form that’s not a maze</li>
            <li>Prices & services up front (no hunting)</li>
            <li>Work gallery & social proof</li>
          </ul>

          <a href="#why" className="btn btn-ghost">See why it works ↓</a>
        </div>

        <div className="hero__shot">
          <div className="glow g1" />
          <div className="glow g2" />
          <img
            src="/tradepage-demo.jpg"
            alt="Example TradePage — everything essential in one place"
            className="shot"
          />
          <div className="shot-note">Real layout • Mobile-first • Fast</div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="strip">
        <span>Essentials-only</span>
        <span>Ridiculously fast</span>
        <span>Mobile-first</span>
        <span>Shareable anywhere</span>
      </section>

      {/* WHY (ANTI-CLUTTER) */}
      <section id="why" className="why">
        <h2>Cut the clutter. Keep the decisions.</h2>
        <div className="why__grid">
          <div className="panel bad">
            <h3>Old-style websites</h3>
            <ul>
              <li>Multiple pages and menus</li>
              <li>Hidden contact details</li>
              <li>Slow, bloated, confusing forms</li>
              <li>Too much text, not enough proof</li>
            </ul>
          </div>
          <div className="panel good">
            <h3>Your Trade Page</h3>
            <ul>
              <li><b>Call</b> & <b>WhatsApp</b> always visible</li>
              <li><b>Quote form</b> that’s quick to submit</li>
              <li><b>Prices</b> & <b>services</b> up front</li>
              <li><b>Gallery</b> + <b>socials</b> for instant trust</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ESSENTIALS GRID */}
      <section className="essentials">
        <h2>Everything customers need. Nothing they don’t.</h2>
        <div className="grid">
          <Feature emoji="📞" title="Tap-to-Call" text="No hunting for the number. It’s right there." />
          <Feature emoji="💬" title="Open WhatsApp" text="Start a chat instantly, from any device." />
          <Feature emoji="📝" title="Instant Quote" text="Simple fields. More enquiries, less drop-off." />
          <Feature emoji="💷" title="Prices & Services" text="Clear, skimmable, and up front." />
          <Feature emoji="🖼️" title="Gallery" text="Prove quality with work photos." />
          <Feature emoji="🔗" title="Socials" text="Link to Instagram, Facebook, TikTok, X, YouTube." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <h2>Get live in minutes</h2>
        <ol>
          <li><b>Pick your link</b> and add your name & logo.</li>
          <li><b>Enter essentials</b> — contact, services, prices, gallery.</li>
          <li><b>Share your link</b> in Instagram bio, Google Business, and messages.</li>
        </ol>
        <a href="#faq" className="btn btn-ghost">Questions? See FAQ</a>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2>What trades say</h2>
        <div className="tgrid">
          <Quote text="Clients get everything at a glance. Calls up. Confusion down." who="Paula — Domestic Cleaning" />
          <Quote text="I just send one link now. Looks professional and quick to use." who="Jay — Handyman" />
          <Quote text="The gallery sold the job before we spoke. Simple and tidy." who="Mirela — Painter" />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <h2>FAQ</h2>
        <details>
          <summary>Do I need hosting or a domain?</summary>
          <p>No. Your page is hosted for you. Just share your TradePage link.</p>
        </details>
        <details>
          <summary>Is it mobile friendly?</summary>
          <p>Yes — built mobile-first so customers can call or WhatsApp without friction.</p>
        </details>
        <details>
          <summary>Can I update it anytime?</summary>
          <p>Absolutely. Use your dashboard, hit save, and it’s live.</p>
        </details>
      </section>
    </main>
  );
}

/* Reusable bits */
function Feature({ emoji, title, text }) {
  return (
    <div className="feature">
      <div className="emoji">{emoji}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Quote({ text, who }) {
  return (
    <blockquote>
      “{text}”
      <span>{who}</span>
    </blockquote>
  );
}

/* CSS (theme-aware via your CSS variables) */
const css = `
.home{color:var(--text);background:var(--bg);max-width:1160px;margin:28px auto;padding:0 16px 56px}

/* HERO */
.hero{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:20px;border-radius:26px;padding:26px;border:1px solid var(--border);
  background:
    radial-gradient(1200px 520px at 0% -20%, color-mix(in oklab, var(--btn-primary-2) 15%, transparent), transparent),
    radial-gradient(900px 400px at 120% -10%, color-mix(in oklab, var(--btn-primary-1) 14%, transparent), transparent),
    linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));
  overflow:hidden}
.eyebrow{display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid var(--chip-border);background:var(--chip-bg);font-size:12px;opacity:.95}
.hero h1{margin:10px 0 8px;font-size:44px;line-height:1.06;font-weight:900;letter-spacing:.1px}
.lead{font-size:18px;opacity:.95;line-height:1.65;margin:0 0 12px}
.benefit-bullets{margin:10px 0 16px;padding-left:18px;line-height:1.8;opacity:.95}

.btn{display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 16px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;border:1px solid var(--social-border)}
.btn-ghost{background:transparent;color:var(--text)}

.hero__shot{position:relative;min-height:360px;display:flex;align-items:center;justify-content:center}
.shot{width:100%;max-width:520px;border-radius:18px;border:1px solid var(--border);
  background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));box-shadow:0 10px 40px rgba(0,0,0,.25)}
.shot-note{margin-top:8px;text-align:center;font-size:12px;opacity:.7}
.glow{position:absolute;filter:blur(28px);opacity:.55}
.g1{width:520px;height:520px;right:-120px;top:-160px;background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%)}
.g2{width:420px;height:420px;left:-100px;bottom:-120px;background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%)}

/* VALUE STRIP */
.strip{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;align-items:center;margin:16px 0 10px;opacity:.85}
.strip span{border:1px solid var(--chip-border);background:var(--chip-bg);padding:6px 10px;border-radius:999px;font-size:12px}

/* WHY */
.why{margin-top:28px}
.why h2{text-align:center;margin:0 0 14px;font-size:26px;font-weight:900}
.why__grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.panel{padding:16px;border-radius:18px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))}
.panel h3{margin:0 0 8px;font-size:16px}
.panel ul{margin:0;padding-left:18px;line-height:1.8}
.panel.bad li{opacity:.85}
.panel.good li{opacity:1}

/* ESSENTIALS */
.essentials{margin-top:28px}
.essentials h2{text-align:center;margin:0 0 14px;font-size:26px;font-weight:900}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.feature{padding:16px;border-radius:18px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))}
.feature .emoji{font-size:22px}
.feature h3{margin:8px 0 6px;font-size:16px}
.feature p{margin:0;opacity:.95}

/* HOW */
.how{margin-top:30px;text-align:center}
.how h2{font-size:24px;margin:0 0 8px;font-weight:900}
.how ol{margin:0 auto 12px;padding-left:18px;max-width:720px;text-align:left;line-height:1.8}

/* TESTIMONIALS */
.testimonials{margin-top:28px}
.testimonials h2{text-align:center;margin:0 0 10px;font-size:24px;font-weight:900}
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
blockquote{margin:0;padding:16px;border-radius:16px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));line-height:1.6}
blockquote span{display:block;opacity:.8;margin-top:6px}

/* FAQ */
.faq{margin-top:28px}
.faq h2{text-align:center;margin:0 0 10px;font-size:24px;font-weight:900}
.faq details{border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));padding:12px 14px;margin-bottom:10px}
.faq summary{cursor:pointer;font-weight:800}
.faq p{margin:8px 0 0;opacity:.95}

/* RESPONSIVE */
@media (max-width: 1024px){
  .hero{grid-template-columns:1fr;padding:20px}
  .hero h1{font-size:36px}
}
@media (max-width: 820px){
  .grid,.tgrid,.why__grid{grid-template-columns:1fr}
  .hero h1{font-size:32px}
}
`;
