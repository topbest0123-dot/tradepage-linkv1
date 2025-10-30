// app/preview/unavailable/page.jsx
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Temporarily unavailable — TradePage',
  description: 'Preview of the suspended profile page.',
  robots: { index: false, follow: false }, // keep previews out of search
};

export default function PreviewUnavailable() {
  const ui = {
    wrap: {
      minHeight: '70vh',
      display: 'grid',
      placeItems: 'center',
      padding: '48px 20px',
      background: 'var(--bg)',
      color: 'var(--text)',
    },
    card: {
      width: '100%',
      maxWidth: 760,
      border: '1px solid var(--chip-border)',
      background: 'var(--card-bg-1)',
      borderRadius: 16,
      padding: 28,
      boxShadow: '0 10px 30px rgba(0,0,0,.2)',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      borderRadius: 12,
      border: '1px solid var(--border)',
      background: 'var(--chip-bg)',
      fontSize: 22,
      marginBottom: 12,
    },
    h1: { fontSize: 28, lineHeight: 1.2, margin: '6px 0 10px' },
    p: { opacity: .9, margin: '6px 0 14px' },
    small: { opacity: .6, fontSize: 13, marginTop: 6 },
    row: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 },
    primary: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      padding: '0 18px',
      borderRadius: 12,
      fontWeight: 700,
      background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
      color: '#08101e',
      border: '1px solid var(--border)',
      textDecoration: 'none',
    },
    secondary: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      padding: '0 16px',
      borderRadius: 12,
      border: '1px solid var(--social-border)',
      color: 'var(--text)',
      textDecoration: 'none',
      background: 'transparent',
    },
    code: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      padding: '2px 6px',
      borderRadius: 6,
      border: '1px solid var(--chip-border)',
      background: 'var(--chip-bg)',
    },
  };

  return (
    <main style={ui.wrap}>
      <section style={ui.card}>
        <div style={ui.badge} aria-hidden>🚧</div>
        <h1 style={ui.h1}>This page is temporarily unavailable</h1>
        <p style={ui.p}>
          The owner’s free trial ended or the subscription is currently inactive. Once the
          subscription is reactivated, this page will be back online.
        </p>

        <p style={ui.small}>
          In production this state is served with <b>HTTP 503</b> and{' '}
          <code style={ui.code}>Retry-After</code>, plus <code style={ui.code}>noindex</code>.
        </p>

        <div style={ui.row}>
          <Link href="/" style={ui.primary}>Go to homepage</Link>
          <a href="mailto:owner@example.com" style={ui.secondary}>Contact owner</a>
        </div>
      </section>
    </main>
  );
}
