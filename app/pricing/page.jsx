// app/pricing/page.jsx
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <section className="pricing">
      <style>{`
        /* Light palette to match homepage (cream) */
        .pricing{
          --bg:#f6fbf8;          /* page background */
          --text:#0b1b16;        /* primary text */
          --muted:#4c6a5e;       /* subtle text */
          --border:#cfe7dc;      /* soft borders */
          --card:#ffffff;        /* card bg */
          --card2:#f1f7f3;       /* subtle gradient partner */
          --chip:#eef5f0;        /* pill/chip bg */
          --chip-border:#cfe7dc;
          --primary-1:#21c58b;   /* CTA gradient */
          --primary-2:#5fb9ff;
        }
        .wrap{ background:var(--bg); color:var(--text); }
        .container{ max-width:900px; margin:0 auto; padding:16px; }
        .hero{
          background:linear-gradient(180deg,var(--card) 0%,var(--card2) 100%);
          border:1px solid var(--border);
          border-radius:20px;
          padding:28px;
          margin-bottom:16px;
        }
        .grid{ display:grid; gap:16px; grid-template-columns:1fr; }
        @media (min-width:760px){ .grid{ grid-template-columns:1fr 1fr; } }
        .card{
          background:var(--card);
          border:1px solid var(--border);
          border-radius:16px;
          padding:20px;
        }
        .price{ font-size:38px; font-weight:800; letter-spacing:.2px; }
        .pill{
          display:inline-block; padding:8px 10px;
          border-radius:10px; background:var(--chip); border:1px solid var(--chip-border);
        }
        .cta{
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 18px; border-radius:12px; font-weight:700; text-decoration:none;
          background:linear-gradient(135deg,var(--primary-1),var(--primary-2));
          color:#08101e; border:1px solid var(--border);
        }
        .muted{ color:var(--muted); }
      `}</style>

      <div className="wrap">
        <div className="container">
          <div className="hero">
            <h1 style={{margin:'0 0 6px'}}>Simple pricing</h1>
            <p className="muted" style={{margin:0}}>
              One plan. Everything you need for your public page. Cancel anytime.
            </p>
          </div>

          <div className="grid">
            <div className="card">
              <div className="price">
                $4.99 <span style={{fontSize:16,fontWeight:600}}>/month</span>
              </div>
              <p className="pill" style={{marginTop:12}}>Start today — 14-day free trial (no card)</p>
              <ul style={{marginTop:14, lineHeight:1.7}}>
                <li>Beautiful public page with your logo, phones, WhatsApp, gallery, hours and more.</li>
                <li>Shareable link that works everywhere (bio, ads, email signatures).</li>
                <li>Fast, mobile-first pages that customers can read in seconds.</li>
                <li>Private dashboard to update details any time.</li>
                <li>SEO-friendly markup & open-graph preview.</li>
                <li>Cancel anytime. No hidden fees.</li>
              </ul>
              <a className="cta" href="/signin">Start free — no card</a>
            </div>

            <div className="card">
              <h3 style={{marginTop:0}}>Why it’s worth it</h3>
              <p className="muted">
                Your TradePage replaces scattered links with a clear, professional hub. Customers find your
                number, WhatsApp and services fast — which means more calls and better jobs won.
              </p>
              <ul style={{marginTop:14, lineHeight:1.7}}>
                <li>Looks great on every phone</li>
                <li>Update in seconds — no web designer</li>
                <li>Built for trades: simple, clean, trustworthy</li>
              </ul>
              <div style={{marginTop:16}}>
                <a className="cta" href="/signin">Create your page</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
