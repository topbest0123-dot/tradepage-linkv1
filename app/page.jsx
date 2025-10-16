// app/page.jsx
'use client';

import { useMemo } from 'react';

/* Small helpers to keep styles consistent with the rest of the app */
const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 44,
  padding: '0 18px',
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 14,
  textDecoration: 'none',
  cursor: 'pointer',
  border: '1px solid var(--border)',
};
const btnPrimary = {
  ...btnBase,
  background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
  color: '#08101e',
};
const btnNeutral = {
  ...btnBase,
  background: 'var(--btn-neutral-bg)',
  color: 'var(--text)',
  border: '1px solid var(--social-border)',
};

const card = {
  borderRadius: 18,
  border: '1px solid var(--border)',
  background: 'linear-gradient(var(--card-angle,180deg),var(--card-bg-1),var(--card-bg-2))',
};

export default function HomePage() {
  const features = useMemo(
    () => [
      {
        title: 'One link. All the info.',
        body:
          'Your business name, services, areas, prices, photos, and social links—beautifully organized on a single page.',
      },
      {
        title: 'Instant contact',
        body:
          'Tap-to-call and WhatsApp buttons remove friction so customers contact you faster and more often.',
      },
      {
        title: 'Professional look',
        body:
          'Your logo, colors, and layout keep things on-brand. It looks premium on mobile and desktop.',
      },
      {
        title: 'Gallery that sells',
        body:
          'Show your best work with a simple gallery. Real photos build trust and boost conversions.',
      },
      {
        title: 'SEO & social ready',
        body:
          'Open Graph and Twitter cards are optimized, so sharing your link always looks great.',
      },
      {
        title: 'Blazingly simple',
        body:
          'Update anything from your dashboard—no website builder headaches, hosting, or plugins.',
      },
    ],
    []
  );

  return (
    <main style={page}>
      {/* top nav */}
      <header style={topBar}>
        <div style={brandWrap}>
          <div style={brandTitle}>TradePage.Link</div>
          <div style={brandTag}>Your business in a link</div>
        </div>
        <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/signin" style={{ ...btnNeutral, height: 38, padding: '0 14px', borderRadius: 10 }}>
            Sign in
          </a>
          <a href="/dashboard" style={{ ...btnPrimary, height: 38, padding: '0 14px', borderRadius: 10 }}>
            Create your page
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section style={heroWrap}>
        <div style={heroLeft}>
          <div style={pill}>Make your trade look premium in minutes</div>
          <h1 style={heroH1}>
            Everything clients need—<span style={{ opacity: 0.9 }}>in one clean link.</span>
          </h1>
          <p style={heroP}>
            TradePage.Link gives every tradesperson a professional mini-site: contact, services, prices,
            areas, photos, social media—beautiful, fast, and easy to share.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
            <a href="/dashboard" style={{ ...btnPrimary, height: 48, padding: '0 22px', fontSize: 15 }}>
              Create your Trade Page
            </a>
            <a href="#how" style={{ ...btnNeutral, height: 48, padding: '0 18px' }}>
              See how it works
            </a>
          </div>

          <ul style={heroBullets}>
            <li>Looks amazing on mobile</li>
            <li>Tap-to-call & WhatsApp</li>
            <li>Zero code. Zero fuss.</li>
          </ul>
        </div>

        {/* Right: mock preview */}
        <div style={previewOuter}>
          <div style={{ ...card, padding: 16 }}>
            <div style={headerRow}>
              <div style={logoDot}>★</div>
              <div>
                <div style={bizName}>Pro Handyman</div>
                <div style={subtext}>Handyman • Birmingham</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              <div style={chipPrimary}>Call</div>
              <div style={chipNeutral}>WhatsApp</div>
              <div style={chipGhost}>Share</div>
            </div>

            <div style={{ ...miniCard, marginTop: 14 }}>
              <div style={miniTitle}>About</div>
              <p style={miniP}>
                Friendly, reliable, and affordable. From furniture assembly to home repairs—done right the
                first time.
              </p>
            </div>

            <div style={{ ...miniCard, marginTop: 10 }}>
              <div style={miniTitle}>Services</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={chip}>Repairs</span>
                <span style={chip}>Painting</span>
                <span style={chip}>Carpentry</span>
                <span style={chip}>Mounting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section style={{ marginTop: 24 }}>
        <h2 style={sectionH}>Why tradespeople love TradePage.Link</h2>
        <div style={grid3}>
          {features.map((f, i) => (
            <article key={i} style={{ ...card, padding: 16 }}>
              <h3 style={cardH}>{f.title}</h3>
              <p style={cardP}>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* BEFORE/AFTER STRIP */}
      <section style={{ marginTop: 24 }}>
        <div style={{ ...card, padding: 16 }}>
          <div style={split}>
            <div style={splitCol}>
              <div style={splitLabel}>Before</div>
              <ul style={list}>
                <li>Scattered links: phone here, Instagram there, prices in a PDF…</li>
                <li>Inconsistent look & messy first impression</li>
                <li>Hard to update; customers drop off</li>
              </ul>
            </div>
            <div style={splitCol}>
              <div style={splitLabelGood}>After</div>
              <ul style={list}>
                <li>One clean page with everything your client needs</li>
                <li>Professional brand feel with photos & social proof</li>
                <li>Faster contact → more booked jobs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ marginTop: 24 }}>
        <h2 style={sectionH}>Set up in three quick steps</h2>
        <div style={grid3}>
          <div style={{ ...card, padding: 16 }}>
            <div style={stepNum}>1</div>
            <h3 style={cardH}>Create your page</h3>
            <p style={cardP}>Pick a public link (slug), add your business name and logo.</p>
          </div>
          <div style={{ ...card, padding: 16 }}>
            <div style={stepNum}>2</div>
            <h3 style={cardH}>Add details</h3>
            <p style={cardP}>
              Services, areas, prices, opening hours, social links and a gallery—add as much as you like.
            </p>
          </div>
          <div style={{ ...card, padding: 16 }}>
            <div style={stepNum}>3</div>
            <h3 style={cardH}>Share one link</h3>
            <p style={cardP}>Use it on WhatsApp, Instagram bio, flyers, vans—everywhere.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ marginTop: 28 }}>
        <div style={{ ...card, padding: 20, textAlign: 'center' }}>
          <h2 style={{ ...sectionH, marginBottom: 6 }}>Ready to look more professional?</h2>
          <p style={{ ...cardP, opacity: 0.9 }}>
            Create your Trade Page in minutes. No code. No hassle.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
            <a href="/dashboard" style={{ ...btnPrimary, height: 50, padding: '0 24px', fontSize: 16 }}>
              Create your page
            </a>
            <a href="/signin" style={{ ...btnNeutral, height: 50, padding: '0 20px', fontSize: 15 }}>
              Sign in
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={footer}>
        <div>© {new Date().getFullYear()} TradePage.Link</div>
        <div style={{ opacity: 0.8 }}>Built for tradespeople who value time and presentation.</div>
      </footer>
    </main>
  );
}

/* ---------- styles (inline, theme-aware via CSS variables) ---------- */
const page = { maxWidth: 1050, margin: '28px auto', padding: '0 16px 48px', color: 'var(--text)' };

const topBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 14,
};

const brandWrap = { display: 'flex', flexDirection: 'column' };
const brandTitle = { fontWeight: 900, letterSpacing: 0.2, fontSize: 22 };
const brandTag = { opacity: 0.75, fontSize: 12, marginTop: 2 };

const heroWrap = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: 16,
  alignItems: 'stretch',
};
const heroLeft = { padding: 16, ...{ borderRadius: 18, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))' } };
const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid var(--chip-border, var(--border))',
  background: 'var(--chip-bg, rgba(255,255,255,0.02))',
  fontSize: 12,
  opacity: 0.9,
};
const heroH1 = { margin: '12px 0 6px', fontSize: 34, lineHeight: 1.15, fontWeight: 900 };
const heroP = { margin: 0, opacity: 0.9, lineHeight: 1.6 };
const heroBullets = { marginTop: 14, paddingLeft: 18, lineHeight: 1.6, opacity: 0.95 };

const previewOuter = { ...{ borderRadius: 18, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))' }, padding: 10 };
const headerRow = { display: 'flex', alignItems: 'center', gap: 12 };
const logoDot = { width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn-primary-1)', color: '#0a0f1c', fontWeight: 800, fontSize: 18, border: '1px solid var(--border)' };
const bizName = { fontWeight: 800, fontSize: 18, lineHeight: '20px' };
const subtext = { opacity: 0.75, fontSize: 13, marginTop: 4 };

const chip = { padding: '6px 10px', borderRadius: 999, border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', fontSize: 12 };
const chipPrimary = { ...chip, background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))', color: '#08101e', border: '1px solid var(--border)' };
const chipNeutral = { ...chip, background: 'var(--btn-neutral-bg)' };
const chipGhost = { ...chip, background: 'transparent' };

const miniCard = { borderRadius: 12, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))', padding: 12 };
const miniTitle = { fontWeight: 800, marginBottom: 6 };
const miniP = { margin: 0, opacity: 0.9, lineHeight: 1.5 };

const sectionH = { margin: '0 0 10px', fontSize: 22, fontWeight: 900 };
const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 };
const cardH = { margin: '0 0 6px', fontSize: 16, fontWeight: 800 };
const cardP = { margin: 0, opacity: 0.9, lineHeight: 1.55 };

const split = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };
const splitCol = { borderRadius: 14, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))', padding: 14 };
const splitLabel = { fontWeight: 900, color: 'var(--muted)', marginBottom: 6 };
const splitLabelGood = { ...splitLabel, color: 'var(--text)' };
const list = { margin: 0, paddingLeft: 18, lineHeight: 1.6, opacity: 0.95 };

const stepNum = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--chip-bg)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  marginBottom: 8,
};

const footer = { marginTop: 32, opacity: 0.85, display: 'grid', gap: 6, justifyItems: 'center' };

/* Responsive adjustments */
const mq = `
@media (max-width: 980px){
  .heroGrid{ grid-template-columns: 1fr; }
}
`;
