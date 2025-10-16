// app/page.jsx
'use client';

export default function HomePage() {
  return (
    <main className="tp-home">
      <style>{css}</style>

      {/* Top nav */}
      <header className="tp-nav">
        <div className="tp-nav__brand">
          <span className="logo-dot">★</span>
          <div>
            <div className="brand-title">TradePage.Link</div>
            <div className="brand-tag">Your business in a link</div>
          </div>
        </div>
        <nav className="tp-nav__cta">
          <a className="btn btn-ghost" href="/signin">Sign in</a>
          <a className="btn btn-primary" href="/dashboard">Create your page</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero__copy">
          <div className="pill">A professional mini-site for trades—made in minutes</div>
          <h1>
            Look premium. Get contacted faster.
          </h1>
          <p className="lead">
            Put **everything** clients need on one beautiful link—contact, WhatsApp, services, prices,
            areas, gallery and socials. No website builder headaches.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary btn-lg" href="/dashboard">Create your Trade Page</a>
            <a className="btn btn-ghost btn-lg" href="#how">See how it works</a>
          </div>

          <ul className="hero-bullets">
            <li>Tap-to-call & WhatsApp</li>
            <li>Works perfectly on mobile</li>
            <li>SEO & social previews built-in</li>
          </ul>
        </div>

        {/* Decorative preview/shape – not the slug layout */}
        <div className="hero__art">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="device">
            <div className="bar">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <div className="device-hero">
              <div className="avatar">★</div>
              <div className="lines">
                <div className="l l1" />
                <div className="l l2" />
              </div>
            </div>
            <div className="chips">
              <div className="chip chip-primary">Call</div>
              <div className="chip">WhatsApp</div>
              <div className="chip">Share</div>
            </div>
            <div className="block" />
            <div className="tags">
              <span className="tag">Repairs</span>
              <span className="tag">Painting</span>
              <span className="tag">Carpentry</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust">
        <div>Used by cleaners, handymen, gardeners, barbers, tutors & more.</div>
      </section>

      {/* BENEFITS */}
      <section className="benefits" id="benefits">
        <h2>Why tradespeople choose TradePage.Link</h2>
        <div className="benefits__grid">
          <div className="benefit">
            <div className="emoji">🔗</div>
            <h3>One link. Zero friction.</h3>
            <p>All your details in one place—easy to share on WhatsApp, Instagram, flyers and vans.</p>
          </div>
          <div className="benefit">
            <div className="emoji">📱</div>
            <h3>Optimized for mobile</h3>
            <p>Lightning-fast, finger-friendly actions that make customers contact you quickly.</p>
          </div>
          <div className="benefit">
            <div className="emoji">✨</div>
            <h3>Looks premium</h3>
            <p>Your logo, clean typography and tasteful themes—no clunky website builder feel.</p>
          </div>
          <div className="benefit">
            <div className="emoji">🖼️</div>
            <h3>Gallery that converts</h3>
            <p>Upload work photos to build trust and show quality—results speak for themselves.</p>
          </div>
          <div className="benefit">
            <div className="emoji">🚀</div>
            <h3>SEO & Social ready</h3>
            <p>Open Graph and Twitter cards are set, so shares always look sharp.</p>
          </div>
          <div className="benefit">
            <div className="emoji">🛠️</div>
            <h3>Simple updates</h3>
            <p>Change prices, areas or hours from your dashboard—no plugins or hosting needed.</p>
          </div>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="checklist">
        <div className="checklist__wrap">
          <div className="checklist__copy">
            <h2>Everything your client needs—no digging, no guessing</h2>
            <ul>
              <li>Business name & logo</li>
              <li>Tap-to-call & WhatsApp</li>
              <li>Services, areas & prices</li>
              <li>Opening hours & location</li>
              <li>Instagram, Facebook, TikTok, X, YouTube</li>
              <li>Work gallery & updates</li>
            </ul>
            <div className="cta-row">
              <a className="btn btn-primary" href="/dashboard">Create your page</a>
              <a className="btn btn-ghost" href="#faq">Common questions</a>
            </div>
          </div>
          <div className="checklist__art">
            <div className="sheet">
              <div className="row w60" />
              <div className="row w40" />
              <div className="divider" />
              <div className="row w50" />
              <div className="row w30" />
              <div className="chips2">
                <span>Cleaning</span><span>London</span><span>Free quote</span>
              </span></div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2>What trades say</h2>
        <div className="t-grid">
          <blockquote>
            “Went live in 10 minutes. Clients finally have one place for everything.
            Calls up 30%.” <span>— Paula, Domestic Cleaning</span>
          </blockquote>
          <blockquote>
            “Looks proper on WhatsApp and Instagram. I just send one link. Done.”
            <span>— Jay, Handyman</span>
          </blockquote>
          <blockquote>
            “The gallery sold the job before I arrived. Easiest ‘website’ I’ve used.”
            <span>— Mirela, Painter</span>
          </blockquote>
        </div>
      </section>

      {/* HOW */}
      <section className="how" id="how">
        <h2>Set up in three quick steps</h2>
        <ol>
          <li><b>Create</b> your page and pick a public link</li>
          <li><b>Add</b> details, prices, areas and photos</li>
          <li><b>Share</b> the link everywhere and get more enquiries</li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <h2>FAQ</h2>
        <details>
          <summary>Do I need hosting or a domain?</summary>
          <p>No. Your page is hosted for you. You just share your TradePage link.</p>
        </details>
        <details>
          <summary>Is it mobile friendly?</summary>
          <p>Yes—designed mobile-first so clients can call or WhatsApp instantly.</p>
        </details>
        <details>
          <summary>Can I update it anytime?</summary>
          <p>Absolutely. Edit from your dashboard and it’s live immediately.</p>
        </details>
      </section>

      {/* FINAL CTA */}
      <section className="cta-final">
        <div className="cta-card">
          <h2>Ready to look more professional?</h2>
          <p>Create your Trade Page in minutes—no code, no fuss.</p>
          <div className="cta-row">
            <a className="btn btn-primary btn-lg" href="/dashboard">Create your page</a>
            <a className="btn btn-ghost btn-lg" href="/signin">Sign in</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>© {new Date().getFullYear()} TradePage.Link</div>
        <div className="muted">Built for trades who value time and presentation.</div>
      </footer>
    </main>
  );
}

/* ---------- CSS (theme-aware via your CSS variables) ---------- */
const css = `
.tp-home{ color:var(--text); background:var(--bg); max-width:1160px; margin:28px auto; padding:0 16px 48px; }

/* NAV */
.tp-nav{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
.tp-nav__brand{ display:flex; align-items:center; gap:10px; }
.logo-dot{ width:28px; height:28px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; background:var(--btn-primary-1); color:#08101e; font-weight:900; border:1px solid var(--border); }
.brand-title{ font-weight:900; letter-spacing:.2px; font-size:22px; line-height:1; }
.brand-tag{ opacity:.75; font-size:12px; margin-top:4px; }
.tp-nav__cta{ display:flex; gap:10px; flex-wrap:wrap; }

/* BUTTONS */
.btn{ display:inline-flex; align-items:center; justify-content:center; height:40px; padding:0 16px; border-radius:12px; font-weight:800; font-size:14px; text-decoration:none; cursor:pointer; border:1px solid var(--border); }
.btn-lg{ height:48px; padding:0 22px; font-size:15px; }
.btn-primary{ background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2)); color:#08101e; }
.btn-ghost{ background:transparent; color:var(--text); border:1px solid var(--social-border); }

/* HERO */
.hero{ position:relative; display:grid; grid-template-columns: 1.1fr .9fr; gap:18px; border-radius:22px; padding:18px; background:radial-gradient(1200px 500px at 0% -10%, color-mix(in oklab, var(--btn-primary-2) 18%, transparent), transparent), linear-gradient(180deg,var(--card-bg-1,rgba(255,255,255,0.02)),var(--card-bg-2,rgba(255,255,255,0.01))); border:1px solid var(--border); overflow:hidden; }
.hero__copy{ position:relative; z-index:2; }
.pill{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:1px solid var(--chip-border, var(--border)); background:var(--chip-bg, rgba(255,255,255,0.02)); font-size:12px; opacity:.95; }
.hero h1{ font-size:44px; line-height:1.1; margin:12px 0 8px; font-weight:900; }
.lead{ font-size:18px; opacity:.95; line-height:1.6; margin:0; }
.cta-row{ display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
.hero-bullets{ margin:12px 0 0; padding-left:18px; line-height:1.6; opacity:.95; }

.hero__art{ position:relative; min-height:320px; }
.blob{ position:absolute; filter:blur(20px); opacity:.55; }
.blob.b1{ width:420px; height:420px; right:-80px; top:-80px; background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%); }
.blob.b2{ width:420px; height:420px; right:60px; bottom:-100px; background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%); }
.device{ position:relative; margin:12px auto 0; width:100%; max-width:420px; border-radius:22px; border:1px solid var(--border); background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2)); padding:12px; box-shadow:0 10px 40px rgba(0,0,0,.25); }
.bar{ display:flex; gap:6px; padding:6px; }
.bar .dot{ width:8px; height:8px; border-radius:999px; background:var(--chip-bg); border:1px solid var(--chip-border); }
.device-hero{ display:flex; gap:12px; align-items:center; padding:6px 8px; }
.avatar{ width:42px; height:42px; border-radius:12px; background:var(--btn-primary-1); display:flex; align-items:center; justify-content:center; color:#08101e; font-weight:900; border:1px solid var(--border); }
.lines{ flex:1; }
.l{ height:10px; border-radius:6px; background:var(--chip-bg); border:1px solid var(--chip-border); }
.l1{ width:70%; margin-bottom:8px; }
.l2{ width:40%; }
.chips{ display:flex; gap:8px; flex-wrap:wrap; padding:8px; }
.chip{ padding:6px 10px; border-radius:999px; border:1px solid var(--chip-border); background:var(--chip-bg); font-size:12px; }
.chip-primary{ background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2)); color:#08101e; border:1px solid var(--border); }
.block{ height:72px; border-radius:14px; margin:6px 8px; background:var(--chip-bg); border:1px solid var(--chip-border); }
.tags{ display:flex; gap:8px; flex-wrap:wrap; padding:0 8px 10px; }
.tag{ padding:6px 10px; border-radius:999px; border:1px solid var(--chip-border); font-size:12px; opacity:.95; }

/* TRUST */
.trust{ text-align:center; margin:18px 0 8px; opacity:.85; }

/* BENEFITS */
.benefits{ margin-top:22px; }
.benefits h2{ font-size:26px; margin:0 0 12px; font-weight:900; text-align:center; }
.benefits__grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
.benefit{ padding:16px; border-radius:18px; border:1px solid var(--border); background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2)); }
.benefit .emoji{ font-size:22px; }
.benefit h3{ margin:8px 0 6px; font-size:16px; }

/* CHECKLIST */
.checklist{ margin-top:28px; }
.checklist__wrap{ display:grid; grid-template-columns:1.1fr .9fr; gap:16px; align-items:center; }
.checklist__copy h2{ font-size:26px; margin:0 0 12px; font-weight:900; }
.checklist__copy ul{ margin:0 0 12px; padding-left:18px; line-height:1.7; }
.checklist__art .sheet{ border-radius:18px; border:1px solid var(--border); background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2)); padding:14px; }
.sheet .row{ height:12px; border-radius:8px; background:var(--chip-bg); border:1px solid var(--chip-border); margin-bottom:8px; }
.sheet .row.w60{ width:60%; } .sheet .row.w40{ width:40%; } .sheet .row.w50{ width:50%; } .sheet .row.w30{ width:30%; }
.sheet .divider{ height:1px; background:var(--border); margin:10px 0; }
.chips2{ display:flex; gap:8px; flex-wrap:wrap; }
.chips2 span{ padding:6px 10px; border-radius:999px; border:1px solid var(--chip-border); background:var(--chip-bg); font-size:12px; }

/* TESTIMONIALS */
.testimonials{ margin-top:26px; }
.testimonials h2{ text-align:center; font-size:24px; margin:0 0 10px; font-weight:900; }
.t-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
blockquote{ margin:0; padding:16px; border-radius:16px; border:1px solid var(--border); background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2)); line-height:1.6; }
blockquote span{ display:block; opacity:.8; margin-top:6px; }

/* HOW */
.how{ margin-top:26px; text-align:center; }
.how h2{ font-size:24px; margin:0 0 10px; font-weight:900; }
.how ol{ margin:0 auto; padding-left:18px; max-width:760px; text-align:left; line-height:1.8; }

/* FAQ */
.faq{ margin-top:26px; }
.faq h2{ text-align:center; font-size:24px; margin:0 0 10px; font-weight:900; }
.faq details{ border:1px solid var(--border); border-radius:14px; background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2)); padding:12px 14px; margin-bottom:10px; }
.faq summary{ cursor:pointer; font-weight:800; }
.faq p{ margin:8px 0 0; opacity:.95; }

/* FINAL CTA */
.cta-final{ margin-top:30px; }
.cta-card{ text-align:center; border:1px solid var(--border); border-radius:20px; padding:22px; background:
  radial-gradient(900px 400px at 100% 0%, color-mix(in oklab, var(--btn-primary-1) 16%, transparent), transparent),
  linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));
}
.cta-card h2{ margin:0 0 8px; font-size:26px; font-weight:900; }
.cta-card p{ margin:0 0 12px; opacity:.95; }

/* FOOTER */
.footer{ margin-top:34px; text-align:center; display:grid; gap:6px; }
.footer .muted{ opacity:.8; }

/* Responsive */
@media (max-width: 980px){
  .hero{ grid-template-columns:1fr; }
  .benefits__grid, .t-grid{ grid-template-columns:1fr; }
  .checklist__wrap{ grid-template-columns:1fr; }
  .tp-nav{ gap:8px; }
  .hero h1{ font-size:34px; }
  .btn-lg{ height:46px; }
}
`;
