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
  return (
    <html lang="en">
      <body style={{ fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Arial', margin:0, padding:0 }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px' }}>
          {/* Header with stacked tagline to leave room for action links */}
          <header
            style={{
              padding: '16px 0',
              borderBottom: '1px solid var(--social-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: '22px' }}>TradePage</div>
              <div style={{ opacity: 0.7, fontSize: 12, marginTop: 2 }}>Your business in a link</div>
            </div>
            <AuthLinks />
          </header>

          <main style={{ paddingTop: 16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
