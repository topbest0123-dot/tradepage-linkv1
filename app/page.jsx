// app/page.jsx
'use client';

/**
 * Modern homepage focused on visuals, motion, and the “essentials-only” story.
 * Put an actual page screenshot at /public/tradepage-demo.jpg
 * (update the src below if you use a different filename).
 */

export default function HomePage() {
  return (
    <main className="hp">
      <style>{css}</style>

      {/* HERO */}
      <section className="hero">
        <div className="glows">
          <div className="g g1" />
          <div className="g g2" />
          <div className="g g3" />
        </div>

        <div className="hero__copy">
          <p className="eyebrow">A single link customers actually use</p>
          <h1>
            TradePage<LinkDot />Link
            <span className="sub">The essentials. No clutter.</span>
          </h1>

          <p className="lead">
            Ditch confusing websites. Share <b>one clean link</b> that shows only what buyers need:
            <b> tap-to-call</b>, <b>WhatsApp</b>, <b>quick quote</b>, <b>prices</b>, <b>services</b>, <b>gallery</b>, and <b>socials</b>.
            <br className="hide-sm" />
            <span className="muted">Frictionless. Fast. Mobile-first.</span>
          </p>

          <div className="chips-scroll" role="list">
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
              <span role="listitem" key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>

        {/* Angled phone with your real screenshot */}
        <div className="hero__visual">
          <div className="phone">
            <div className="notch" />
            <img
              src="/tradepage-demo.jpg"
              alt="A real TradePage showing essentials-only info"
              className="shot"
            />
          </div>
          <div className="fly fly-a">↑ calls</div>
          <div className="fly fly-b">↑ enquiries</div>
          <div className="fly fly-c">↓ confusion</div>
        </div>
      </section>

      {/* VALUE STRIPE */}
      <section className="stripe">
        <div className="stripe__inner">
          <span>Essentials-only</span>
          <span>Ridiculously fast</span>
          <span>Mobile-first</span>
          <span>Looks professional</span>
          <span>Shareable anywhere</span>
        </div>
      </section>

      {/* STORY: WHY THIS WORKS (no long blocks; clean statements) */}
      <section className="story">
        <h2>Everything customers need. Nothing they don’t.</h2>
        <p className="subline">
          Your page is laser-focused on action — <b>call</b>, <b>WhatsApp</b>, <b>quote</b>, and <b>decide</b>.
          No menus. No scrolling labyrinth. No fluff.
        </p>

        <div className="story__cards">
          <Card title="One link, zero friction">
            Share in Instagram bio, Google Business Profile, emails and messages.
          </Card>
          <Card title="Instant contact">
            Tap-to-call or WhatsApp is always visible. No hunting for the number.
          </Card>
          <Card title="Decide at a glance">
            Prices, services and photos are front-and-center for quick decisions.
          </Card>
          <Card title="Trust in seconds">
            Gallery and socials give proof without sending people elsewhere.
          </Card>
        </div>
      </section>

      {/* HOW IT FEELS – A lightweight timeline with motion */}
      <section className="how">
        <h2>From link to lead — in seconds</h2>
        <ol className="timeline">
          <li>
            <span className="dot" />
            <b>Open the link.</b> Clear name, trade & city. Contact right there.
          </li>
          <li>
            <span className="dot" />
            <b>Skim prices & services.</b> No mystery. No sales pitch.
          </li>
          <li>
            <span className="dot" />
            <b>See real work.</b> Photos prove quality in a glance.
          </li>
          <li>
            <span className="dot" />
            <b>Tap to call or WhatsApp.</b> That’s it. You have a lead.
          </li>
        </ol>
      </section>

      {/* SOCIAL PROOF – floating quotes, minimal chrome */}
      <section className="quotes">
        <Quote text="I send one link now. Looks professional and clients call faster." who="Jay — Handyman" />
        <Quote text="The gallery sold the job before we spoke. Simple and tidy." who="Mirela — Painter" />
        <Quote text="Calls up, confusion down. Fewer questions. More bookings." who="Paula — Cleaning" />
      </section>

      {/* FOOTER NOTE */}
      <section className="footnote">
        <p>
          TradePage<LinkDot />Link is the <b>essentials-only</b> page for tradespeople. Share everywhere. Convert faster.
        </p>
      </section>
    </main>
  );
}

/* Small inline components */
function Card({ title, children }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}
function Quote({ text, who }) {
  return (
    <figure className="quote">
      <blockquote>“{text}”</blockquote>
      <figcaption>— {who}</figcaption>
    </figure>
  );
}
function LinkDot() {
  return <span className="dot">.</span>;
}

/* CSS — uses your theme CSS variables */
const css = `
.hp{color:var(--text);background:var(--bg);max-width:1160px;margin:28px auto;padding:0 16px 64px}

/* HERO */
.hero{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:24px;padding:26px;border:1px solid var(--border);
  border-radius:28px;background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));overflow:hidden}
.glows .g{position:absolute;filter:blur(40px);opacity:.55;pointer-events:none}
.g1{width:700px;height:700px;left:-240px;top:-260px;background:radial-gradient(closest-side,var(--btn-primary-2),transparent 70%)}
.g2{width:520px;height:520px;right:-200px;top:-140px;background:radial-gradient(closest-side,var(--btn-primary-1),transparent 70%)}
.g3{width:620px;height:620px;left:20%;bottom:-240px;background:radial-gradient(closest-side,color-mix(in oklab,var(--btn-primary-1) 60%, var(--btn-primary-2)),transparent 70%)}

.eyebrow{display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid var(--chip-border);background:var(--chip-bg);font-size:12px;opacity:.95}
.hero__copy h1{margin:10px 0 8px;font-size:56px;line-height:1.02;font-weight:1000;letter-spacing:.2px}
.hero__copy h1 .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}
.hero__copy h1 .sub{display:block;font-size:18px;font-weight:700;opacity:.85;margin-top:6px}
.lead{font-size:18px;opacity:.95;line-height:1.7;margin:8px 0 14px}
.lead .muted{opacity:.85}

.chips-scroll{display:flex;gap:10px;flex-wrap:wrap}
.chip{border:1px solid var(--chip-border);background:var(--chip-bg);padding:8px 12px;border-radius:999px;font-size:12px}

.hero__visual{position:relative;display:flex;align-items:center;justify-content:center}
.phone{width:420px;max-width:100%;aspect-ratio:9/19;border-radius:28px;border:1px solid var(--border);
  background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));
  transform:rotate(-8deg) translate3d(0,0,0);
  box-shadow:0 40px 120px rgba(0,0,0,.35), 0 0 0 6px rgba(255,255,255,.03) inset}
.notch{width:44%;height:18px;background:var(--bg);opacity:.6;border-radius:0 0 14px 14px;margin:10px auto 0}
.shot{display:block;width:86%;height:82%;object-fit:cover;border-radius:18px;margin:14px auto 0;border:1px solid var(--border)}
.fly{position:absolute;font-weight:900;font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid var(--chip-border);background:var(--chip-bg);opacity:.95}
.fly-a{top:10%;right:8%;animation:float 7s ease-in-out infinite}
.fly-b{bottom:14%;left:2%;animation:float 8s 1s ease-in-out infinite}
.fly-c{top:48%;left:-2%;animation:float 9s .5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

/* STRIPE */
.stripe{margin:18px 0}
.stripe__inner{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.stripe__inner span{border:1px solid var(--chip-border);background:var(--chip-bg);padding:6px 10px;border-radius:999px;font-size:12px}

/* STORY */
.story{margin-top:30px}
.story h2{text-align:center;margin:0 0 10px;font-size:30px;font-weight:1000}
.story .subline{text-align:center;opacity:.9;max-width:800px;margin:0 auto 16px}
.story__cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.card{padding:16px;border-radius:18px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));min-height:130px}
.card h3{margin:0 0 8px;font-size:16px}
.card p{margin:0;opacity:.95}

/* HOW */
.how{margin-top:34px}
.how h2{text-align:center;margin:0 0 14px;font-size:26px;font-weight:1000}
.timeline{max-width:820px;margin:0 auto;padding:0 0 0 0;list-style:none;counter-reset:step}
.timeline li{position:relative;border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));
  border-radius:14px;padding:14px 14px 14px 42px;margin-bottom:10px}
.timeline li .dot{position:absolute;left:12px;top:14px;width:16px;height:16px;border-radius:50%;
  background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));box-shadow:0 0 0 3px rgba(255,255,255,.04)}
.timeline li b{font-weight:900}

/* QUOTES */
.quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:30px}
.quote{border:1px solid var(--border);background:linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2));border-radius:16px;padding:14px}
.quote blockquote{margin:0;line-height:1.6}
.quote figcaption{opacity:.8;margin-top:8px}

/* FOOTNOTE */
.footnote{margin-top:34px;text-align:center;opacity:.9}
.footnote .dot{color:transparent;background:linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2));-webkit-background-clip:text;background-clip:text}

/* RESPONSIVE */
@media (max-width: 1040px){
  .hero{grid-template-columns:1fr}
  .hero__copy h1{font-size:44px}
  .phone{margin:6px auto 0;transform:none}
}
@media (max-width: 820px){
  .story__cards{grid-template-columns:1fr 1fr}
  .quotes{grid-template-columns:1fr}
}
@media (max-width: 560px){
  .hero__copy h1{font-size:36px}
  .story__cards{grid-template-columns:1fr}
}
`;
