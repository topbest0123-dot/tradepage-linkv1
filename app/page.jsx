// app/page.jsx
'use client';

export default function HomePage() {
  return (
    <main className="home">
      <style>{css}</style>

      {/* HERO (no header/CTAs here – we rely on your global header) */}
      <section className="hero">
        <div className="hero__copy">
          <div className="eyebrow">A polished mini-site for trades</div>
          <h1>Look professional. Be easy to contact.</h1>
          <p className="lead">
            TradePage.Link puts <b>contact, WhatsApp, services, prices, hours, gallery and socials</b> into one
            beautiful link that works everywhere. Clients get what they need in seconds.
          </p>

          <ul className="bullets">
            <li>Tap-to-call and WhatsApp</li>
            <li>Works perfectly on mobile</li>
            <li>Premium themes and smart previews</li>
          </ul>

          <a href="#benefits" className="btn btn-ghost">Explore the benefits ↓</a>
        </div>

        {/* Abstract art + device mock */}
        <div className="hero__art">
          <div className="glow g1" />
          <div className="glow g2" />
          <div className="glow g3" />
          <div className="device">
            <div className="device__bar">
              <i /><i /><i />
            </div>
            <div className="device__head">
              <div className="avatar">★</div>
              <div className="head__text">
                <div className="line l1" />
                <div className="line l2" />
              </div>
            </div>
            <div className="device__chips">
              <span className="chip chip-primary">Call</span>
              <span className="chip">WhatsApp</span>
              <span className="chip">Share</span>
            </div>
            <div className="device__block" />
            <div className="device__tags">
              <span>Repairs</span><span>Deep clean</span><span>Painting</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="strip">
        <span>Made for cleaners</span>
        <span>handymen</span>
        <span>gardeners</span>
        <span>barbers</span>
        <span>tutors</span>
        <span>and more</span>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="benefits">
        <h2>Why TradePage.Link works</h2>
        <div className="grid">
          <Feature emoji="🔗" title="Everything in one place"
            text="One link for contact, WhatsApp, services, prices, hours, location, socials and gallery." />
          <Feature emoji="📱" title="Mobile-first actions"
            text="Buttons your customers actually use. Call and WhatsApp are always front and center." />
          <Feature emoji="✨" title="Premium presentation"
            text="Tasteful design and themes that make small businesses look big, and trusted." />
          <Feature emoji="🖼️" title="Work gallery"
            text="Show proof. Upload job photos to help people choose you even before they message." />
          <Feature emoji="🚀" title="Fast & shareable"
            text="Perfect for Instagram bios, Google Business, text messages and flyers." />
          <Feature emoji="⚙️" title="Zero maintenance"
            text="Update anything from your dashboard—no plugins, hosting, or fiddly page builders." />
        </div>
      </section>

      {/* SHOWCASE – layered cards */}
      <section className="showcase">
        <div className="card c1">
          <div className="badge">Contact</div>
          <div className="pill">Tap to Call</div>
          <div className="pill alt">Open WhatsApp</div>
        </div>
        <div className="card c2">
          <div className="badge">Services & Prices</div>
          <div className="row w70" /><div className="row w50" /><div className="row w40" />
        </div>
        <div className="card c3">
          <div className="badge">Gallery</div>
          <div className="gallery">
            <div /><div /><div /><div />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <h2>Set up in minutes</h2>
        <ol>
          <li><b>Pick a link</b> and add your name & logo</li>
          <li><b>Fill the details</b> — services, prices, areas, hours, socials</li>
          <li><b>Share</b> your link on WhatsApp, Instagram, Google Business and flyers</li>
        </ol>
        <a href="#faq" className="btn btn-ghost">Common questions</a>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2>What trades say</h2>
        <div className="tgrid">
          <Quote text="Went live in 10 minutes. Clients finally have one place for everything. Calls up 30%."
                 who="Paula — Domestic Cleaning" />
          <Quote text="Looks proper on WhatsApp and Instagram. I just send one link. Done."
                 who="Jay — Handyman" />
          <Quote text="The gallery sold the job before I arrived. Easiest set-up I’ve used."
                 who="Mirela — Painter" />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <h2>FAQ</h2>
        <details><summary>Do I need a domain or hosting?</summary>
          <p>No. Your page is hosted for you. Share your TradePage link anywhere.</p>
        </details>
        <details><summary>Is it mobile friendly?</summary>
          <p>Yes—designed mobile-first so customers can call or WhatsApp without friction.</p>
        </details>
        <details><summary>Can I update it anytime?</summary>
          <p>Absolutely. Edit from your dashboard and changes are live instantly.</p>
        </details>
      </section>
    </main>
  );
}

/* ---------- Reusable bits ---------- */
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

/* ---------- CSS (theme-aware via your CSS variables) ---------- */
const css = `
.home{color:var(--text);background:var(--bg);max-width:1160px;margin:28px auto;padding:0 16px 56px;}

.hero{position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:18px;border-radius:24px;padding:24px;border:1px solid var(--border);
  background:
    radial-gradient(1200px 600px at 10% -20%, color-mix(in oklab, var(--btn-primary-2) 15%, transparent), transparent),
    conic-gradient(from 210deg at 110% -10%, color-mix(in oklab, var(--btn-primary-1) 12%, transparent), transparent 35%),
    linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2)); overflow:hidden;}
.eyebrow{display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid var(--chip-border);background:var(--chip-bg);font-size:12px;opacity:.95}
.hero h1{margin:10px 0 8px;font-size:42px;line-height:1.08;font-weight:900;letter-spacing:.1px}
.lead{font-size:18px;opacity:.95;line-height:1.6;margin:0 0 10px}
.bullets{margin:8px 0 14px;padding-left:18px;line-height:1.7;opacity:.95}
.btn{display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 16px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;border:1px solid var(--social-border)}
.btn-ghost{background:transparent;color:var(--text)}
.hero__art{position:relative;min-height:360px}
.glow{position:absolute;filter:blur(28px);opacity:.55}
.g1{width:520px;height:520px;right:-120px;top:-160px;background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%)}
.g2{width:460px;height:460px;right:40px;bottom:-160px;background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%)}
.g3{width:380px;height:380px;left:-140px;bottom:-160px;background:radial-gradient(closest-side,color-mix(in oklab,var(--btn-primary-2) 40%, var(--btn-primary-1)),transparent 70%)}
.device{position:relative;margin:10px auto 0;width:100%;max-width:440px;border-radius:22px;border:1px solid var(--border);
  background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));padding:12px;box-shadow:0 10px 40px rgba(0,0,0,.25)}
.device__bar{display:flex;gap:6px;padding:6px}
.device__bar i{width:8px;height:8px;border-radius:999px;background:var(--chip-bg);border:1px solid var(--chip-border)}
.device__head{display:flex;gap:12px;align-items:center;padding:6px 8px}
.avatar{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));display:flex;align-items:center;justify-content:center;color:#08101e;font-weight:900;border:1px solid var(--border)}
.head__text{flex:1}
.line{height:10px;border-radius:6px;background:var(--chip-bg);border:1px solid var(--chip-border)}
.l1{width:72%;margin-bottom:8px}.l2{width:44%}
.device__chips{display:flex;gap:8px;flex-wrap:wrap;padding:8px}
.chip{padding:6px 10px;border-radius:999px;border:1px solid var(--chip-border);background:var(--chip-bg);font-size:12px}
.chip-primary{background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));color:#08101e;border:1px solid var(--border)}
.device__block{height:78px;border-radius:14px;margin:6px 8px;background:var(--chip-bg);border:1px solid var(--chip-border)}
.device__tags{display:flex;gap:8px;flex-wrap:wrap;padding:0 8px 10px}
.device__tags span{padding:6px 10px;border-radius:999px;border:1px solid var(--chip-border);font-size:12px;opacity:.95}

.strip{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;align-items:center;margin:14px 0 8px;opacity:.85}
.strip span{border:1px solid var(--chip-border);background:var(--chip-bg);padding:6px 10px;border-radius:999px;font-size:12px}

.benefits{margin-top:24px}
.benefits h2{text-align:center;margin:0 0 14px;font-size:26px;font-weight:900}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.feature{padding:16px;border-radius:18px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))}
.feature .emoji{font-size:22px}
.feature h3{margin:8px 0 6px;font-size:16px}
.feature p{margin:0;opacity:.95}

.showcase{position:relative;margin-top:26px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.card{position:relative;border-radius:18px;border:1px solid var(--border);background:
  radial-gradient(800px 300px at 120% 0%, color-mix(in oklab,var(--btn-primary-1) 18%, transparent), transparent),
  linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));
  padding:14px;min-height:160px;overflow:hidden}
.badge{display:inline-block;font-size:12px;border:1px solid var(--chip-border);background:var(--chip-bg);border-radius:999px;padding:6px 10px;margin-bottom:10px}
.pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid var(--border);background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));color:#08101e;margin-right:8px;font-size:12px}
.pill.alt{background:var(--chip-bg);color:var(--text);border:1px solid var(--chip-border)}
.row{height:10px;border-radius:6px;background:var(--chip-bg);border:1px solid var(--chip-border);margin:8px 0}
.w70{width:70%}.w50{width:50%}.w40{width:40%}
.gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.gallery div{height:70px;border-radius:10px;border:1px solid var(--chip-border);background:var(--chip-bg)}

.how{margin-top:28px;text-align:center}
.how h2{font-size:24px;margin:0 0 8px;font-weight:900}
.how ol{margin:0 auto 10px;padding-left:18px;max-width:720px;text-align:left;line-height:1.8}
.testimonials{margin-top:26px}
.testimonials h2{text-align:center;margin:0 0 10px;font-size:24px;font-weight:900}
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
blockquote{margin:0;padding:16px;border-radius:16px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));line-height:1.6}
blockquote span{display:block;opacity:.8;margin-top:6px}

.faq{margin-top:26px}
.faq h2{text-align:center;margin:0 0 10px;font-size:24px;font-weight:900}
.faq details{border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));padding:12px 14px;margin-bottom:10px}
.faq summary{cursor:pointer;font-weight:800}
.faq p{margin:8px 0 0;opacity:.95}

@media (max-width: 980px){
  .hero{grid-template-columns:1fr;padding:18px}
  .grid,.showcase,.tgrid{grid-template-columns:1fr}
  .hero h1{font-size:32px}
}
`;
