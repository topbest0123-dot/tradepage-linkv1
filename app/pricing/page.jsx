// app/pricing/page.jsx
export const dynamic = 'force-dynamic';

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
