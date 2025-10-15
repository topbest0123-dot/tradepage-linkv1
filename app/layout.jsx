// app/layout.jsx
import './globals.css';
import AuthLinks from '@/components/AuthLinks';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link'),
  title: { default: 'TradePage', template: '%s — TradePage' },
  description: 'Your business in a link',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'TradePage',
    title: 'TradePage — Your business in a link',
    description: 'Your business in a link',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'TradePage' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradePage',
    description: 'Your business in a link',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({ children }) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || 'local';
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let supaHost = 'missing';
  try { supaHost = new URL(supaUrl).host || 'missing'; } catch {}

  return (
    <html lang="en">
      {/* Default (deep-navy) variables for first paint */}
      <style>{`
        :root{
          --bg:#0a0f14; --text:#eaf2ff; --muted:#b8ccff;
          --border:#183153; --card-bg-1:#0f213a; --card-bg-2:#0b1524;
          --chip-bg:#0c1a2e; --chip-border:#27406e;
          --btn-primary-1:#66e0b9; --btn-primary-2:#8ab4ff;
          --btn-neutral-bg:#1f2937; --social-border:#213a6b;
        }
      `}</style>

      <body
        style={{
          fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial',
          margin: 0,
          padding: 0,
          background: 'var(--bg)',     // was hard-coded #0a0f14
          color: 'var(--text)',        // follow theme text
        }}
      >

        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
          <header
            style={{
              padding: '16px 0',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <b>TradePageLink</b>
              <div style={{ opacity: 0.7, fontSize: 16, lineHeight: '18px' }}>
                Your business in a link
              </div>
            </div>
            <AuthLinks />
          </header>
          <main style={{ paddingTop: 16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
