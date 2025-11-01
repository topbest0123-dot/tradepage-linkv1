// app/pricing/page.jsx
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <section className="pricing">
      <style>{`
        /* Match the cream/light homepage theme */
        .wrap{ --bg:#f6efe3; --text:#191714; --muted:#6f675f;
               --card:#ffffff; --border:#eadfcd; --chip:#f2ece1; --chip-b:#eadfcd;
               --cta1:#3b82f6; --cta2:#10b981; }
        .wrap{ background:var(--bg); color:var(--text); }
        .container{ max-width:900px; margin:0 auto; padding:24px 16px 40px; }

        .card{ background:var(--card); border:1px solid var(--border); border-radius:18px; box-shadow:0 8px 20px rgba(0,0,0,.05); }

        .hero{ text-align:center; padding:28px; }
        .pill{ display:inline-block; background:var(--chip); border:1px solid var(--chip-b);
               padding:8px 10px; border-radius:10px; font-size:13px; margin-bottom:10px; }
        .price{ font-size: clamp(36px,6.5vw,56px); margin:4px 0; font-weight:900; letter-spacing:.2px; }
        .per{ font-size: clamp(14px,1.8vw,18px); font-weight:700; margin-left:6px; }
        .sub{ margin:6px 0 14px; color:var(--muted); }

        .cta{ display:inline-flex; align-items:center; justify-content:center;
              height:48px; padding:0 20px; border-radius:12px; font-weight:800;
              text-decoration:none; border:1px solid var(--border);
              background:linear-gradient(135deg,var(--cta1),var(--cta2)); color:#08101e; }

        .benefits{ margin-top:18px; display:grid; gap:12px; }
        @media(min-width:780px){ .benefits{ grid-template-columns:1fr 1fr; } }
        .benefit{ display:flex; gap:12px; align-items:flex-start; padding:14px; border-radius:12px;
                  border:1px solid var(--border); background:var(--card); }
        .icon{ width:34px; height:34px; border-radius:10px; display:grid; place-items:center;
               background:var(--chip); border:1px solid var(--chip-b); font-size:18px; }
        .benefit b{ display:block; margin-bottom:2px; }
        .benefit p{ margin:0; color:var(--muted); font-size:14px; }
      `}</style>

      <div className="wrap">
        <div className="container">
          {/* Price first */}
          <div className="card hero">
            <span className="pill">14-day free trial</span>
            <h1 className="price">$4.99 <span className="per">/ month</span></h1>
            <p className="sub">One simple price. Cancel anytime.</p>
            <a className="cta" href="/signin">Start free — no card</a>
          </div>

          {/* Only the most important benefits */}
          <div className="benefits">
            <div className="benefit">
              <div className="icon">📲</div>
              <div>
                <b>Tap to call or WhatsApp</b>
                <p>Buttons up-front so customers act instantly.</p>
              </div>
            </div>

            <div className="benefit">
              <div className="icon">🗂️</div>
              <div>
                <b>Everything on one clean page</b>
                <p>Contact, services, prices, photos—no maze.</p>
              </div>
            </div>

            <div className="benefit">
              <div className="icon">💷</div>
              <div>
                <b>Clear prices build trust</b>
                <p>People decide faster when they see the cost.</p>
              </div>
            </div>

            <div className="benefit">
              <div className="icon">🌍</div>
              <div>
                <b>Share one link everywhere</b>
                <p>Facebook, Instagram, flyers, vans, business cards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
