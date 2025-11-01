// app/pricing/page.jsx  (SERVER COMPONENT)
export const metadata = {
  title: 'Pricing — TradePage',
  description: 'Simple pricing: $4.99/month. Start free — no card required.',
};

export default function PricingPage() {
  const card = {
    border: '1px solid var(--border)',
    background: 'var(--card-bg-1)',
    borderRadius: 16,
    padding: 20,
  };

  const pill = {
    display: 'inline-block',
    border: '1px solid var(--chip-border)',
    background: 'var(--chip-bg)',
    color: 'var(--text)',
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 12,
    opacity: 0.9,
  };

  const cta = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    padding: '0 18px',
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
    textDecoration: 'none',
    background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
    color: '#08101e',
    border: '1px solid var(--border)',
  };

  const ghost = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    padding: '0 16px',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    border: '1px solid var(--social-border)',
    color: 'var(--text)',
    background: 'transparent',
  };

  return (
    <section>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <span style={pill}>Simple, honest pricing</span>
        <h1 style={{ margin: '12px 0 8px' }}>Just $4.99/month</h1>
        <p style={{ opacity: 0.85, margin: 0 }}>
          A clean, professional public page for your trade — share one link everywhere.
        </p>
      </div>

      {/* Plan card */}
      <div style={{ ...card, marginTop: 18 }}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            flex: '1 1 260px',
            border: '1px solid var(--border)',
            background: 'var(--card-bg-2)',
            borderRadius: 14,
            padding: 18,
          }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Plan</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>$4.99<span style={{ fontSize: 14, opacity: 0.8 }}>/month</span></div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>14-day free trial • cancel anytime</div>
          </div>

          <ul style={{ flex: '2 1 380px', listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Your own public link & page (SEO-friendly slug)',
              'Call & WhatsApp buttons + contact email',
              'About, services, prices & hours',
              'Photo gallery',
              'Social links (Facebook, Instagram, TikTok, X, YouTube, website)',
              'Location & maps link',
              'Beautiful themes with great readability',
              'Quote requests delivered to your email',
            ].map((t, i) => (
              <li key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                border: '1px solid var(--chip-border)', background: 'var(--chip-bg)',
                borderRadius: 10, padding: '10px 12px', marginBottom: 8
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 999,
                  background: 'var(--btn-primary-1)', marginTop: 6, flex: '0 0 auto'
                }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <a href="/signin" style={cta}>Start today for free — no card, no commitment</a>
          <a href="/contact" style={ghost}>Questions? Contact us</a>
        </div>
      </div>

      {/* Tiny FAQ */}
      <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        <details style={{ ...card }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Do I need a website?</summary>
          <p style={{ opacity: 0.85, marginTop: 8 }}>
            No. TradePage gives you a clean single-page profile you can share anywhere — messages,
            email, social, ads, business cards — all in one link.
          </p>
        </details>
        <details style={{ ...card }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Can I cancel anytime?</summary>
          <p style={{ opacity: 0.85, marginTop: 8 }}>
            Yes. There’s a 14-day free trial and you can cancel any time. No contracts.
          </p>
        </details>
      </div>
    </section>
  );
}
