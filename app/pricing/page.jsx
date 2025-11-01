// app/pricing/page.jsx
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <section className="pricing">
      <style>{`
        /* ==== Cream homepage palette (matches your screenshot) ==== */
        .pricing{
          --page-bg: #f6efe3;       /* warm cream */
          --text:    #191714;       /* primary text */
          --muted:   #6f675f;       /* secondary text */
          --card:    #ffffff;       /* cards */
          --card2:   #fbf7f2;       /* soft alt */
          --border:  #eadfcd;       /* subtle borders */
          --chip:    #f2ece1;       /* chips/pills */
          --chip-b:  #eadfcd;

          /* CTA (blue→teal like your homepage button) */
          --cta-1: #3b82f6;
          --cta-2: #10b981;

          --shadow: 0 10px 24px rgba(0,0,0,0.06);
          --shadow-sm: 0 4px 12px rgba(0,0,0,0.05);
          --radius-lg: 22px;
          --radius: 14px;
        }

        .wrap{ background:var(--page-bg); color:var(--text); }
        .container{ max-width: 960px; margin: 0 auto; padding: 20px 16px 40px; }

        .hero{
          border: 1px solid var(--border);
          background: linear-gradient(180deg,var(--card) 0%, var(--card2) 100%);
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: var(--shadow);
          margin-bottom: 18px;
        }
        .hero h1{ margin: 0 0 6px; font-size: clamp(24px, 4vw, 34px); }
        .hero p{ margin: 0; color: var(--muted); }

        .grid{
          display: grid; gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 860px){
          .grid{ grid-template-columns: 1.2fr .8fr; }
        }

        .card{
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }

        /* Value props list */
        .benefits{ display:grid; gap:14px; }
        .benefit{
          display:flex; gap:14px; align-items:flex-start;
          padding: 16px 16px;
          border-radius: var(--radius);
          border:1px solid var(--border);
          background: var(--card);
          box-shadow: var(--shadow-sm);
        }
        .icon{
          flex:0 0 40px; height:40px; width:40px;
          display:grid; place-items:center;
          border-radius: 12px;
          background: var(--chip);
          border:1px solid var(--chip-b);
          font-size:18px;
        }
        .benefit h4{ margin:0 0 4px; font-size:16px; }
        .benefit p{ margin:0; color:var(--muted); font-size:14px; }

        /* Price/CTA panel */
        .priceCard{ padding: 22px; position: sticky; top: 14px; }
        .price{ font-size: 42px; font-weight: 800; letter-spacing:.2px; }
        .per{ font-size: 16px; font-weight: 600; }
        .pill{
          display:inline-block; margin-top:10px;
          background: var(--chip); border:1px solid var(--chip-b);
          padding: 8px 10px; border-radius: 10px; font-size: 13px;
        }
        .cta{
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          margin-top:14px;
          height:44px; padding:0 18px; border-radius: 12px;
          background: linear-gradient(135deg,var(--cta-1),var(--cta-2));
          color:#08101e; font-weight:800; text-decoration:none;
          border:1px solid var(--border);
        }
        .list{ margin: 14px 0 0; padding:0 0 0 18px; line-height:1.75; color:var(--text); }
        .muted{ color:var(--muted); }

        /* Steps */
        .steps{ margin-top:22px; padding:18px; }
        .step{ display:flex; gap:12px; align-items:flex-start; padding:10px 0; }
        .num{
          height:26px; width:26px; border-radius:8px;
          display:grid; place-items:center;
          background: var(--chip); border:1px solid var(--chip-b);
          font-weight:700;
        }
      `}</style>

      <div className="wrap">
        <div className="container">
          {/* Intro */}
          <div className="hero card">
            <h1>All the essentials. One simple price.</h1>
            <p>Built for trades. Built for speed. Your details, gallery, services and buttons—on one clean page that wins jobs.</p>
          </div>

          <div className="grid">
            {/* LEFT: persuasive benefits */}
            <div className="card" style={{padding:18}}>
              <div className="benefits">
                <div className="benefit">
                  <div className="icon">📲</div>
                  <div>
                    <h4>Tap to call or WhatsApp</h4>
                    <p>Buttons are up-front and labeled. No copying numbers—customers act immediately.</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="icon">🗂️</div>
                  <div>
                    <h4>No menus. No maze.</h4>
                    <p>One screen shows it all—contact details, services, prices, photos and socials.</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="icon">⭐</div>
                  <div>
                    <h4>Proof at a glance</h4>
                    <p>Your gallery shows real work, not claims—trust builds without leaving the page.</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="icon">💷</div>
                  <div>
                    <h4>Clear prices & services</h4>
                    <p>Clarity wins jobs. People decide faster when they see what you do and what it costs.</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="icon">🌍</div>
                  <div>
                    <h4>Works anywhere</h4>
                    <p>Share the same link on Facebook, Instagram, flyers, vans, business cards—one link to rule them all.</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="icon">⚡</div>
                  <div>
                    <h4>No app. No logins.</h4>
                    <p>Opens in any browser. Customers don’t need to install or create accounts.</p>
                  </div>
                </div>

                {/* Micro-journey */}
                <div className="card steps">
                  <h4 style={{margin:'0 0 6px'}}>From link to lead in seconds</h4>
                  <div className="step">
                    <div className="num">1</div>
                    <div><b>Open.</b> Your trade, city and contact are visible immediately.</div>
                  </div>
                  <div className="step">
                    <div className="num">2</div>
                    <div><b>Scan.</b> Gallery + services confirm you’re the real deal.</div>
                  </div>
                  <div className="step">
                    <div className="num">3</div>
                    <div><b>Tap.</b> Call or WhatsApp—done. Fewer taps, fewer doubts, more jobs.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: price + CTA */}
            <aside className="card priceCard">
              <div className="price">
                $4.99 <span className="per">/ month</span>
              </div>
              <div className="pill">Start free for 14 days — no card, no commitment</div>

              <ul className="list">
                <li>Professional public page with logo, phones, WhatsApp, email & socials</li>
                <li>Services & prices section customers actually read</li>
                <li>Photo gallery to prove quality without back-and-forth</li>
                <li>Fast, mobile-first, SEO-friendly</li>
                <li>Easy updates in your dashboard—no web designer</li>
                <li>Cancel anytime</li>
              </ul>

              <a className="cta" href="/signin">Start today for free</a>
              <p className="muted" style={{marginTop:10, fontSize:13}}>
                Trial includes every feature. When you’re ready, continue for just $4.99/month.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
