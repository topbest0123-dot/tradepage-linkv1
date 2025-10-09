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

// ----- Header styles -----
const topBarStyle = {
  padding: '12px 0 14px',
  borderBottom: '1px solid #213a6b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const brandWrap = {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 1.05,
  minWidth: 0,
};

const brandTitle = {
  fontWeight: 800,
  fontSize: 'clamp(18px, 4.8vw, 24px)', // bigger on mobile & desktop
  letterSpacing: 0.2,
};

const brandTagline = {
  fontSize: 'clamp(11px, 3.2vw, 13px)',  // smaller, tucked under title
  opacity: 0.75,
  marginTop: 2,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial',
          margin: 0,
          padding: 0,
          background: '#0a0f14',
          color: '#eaf2ff',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
          <header style={topBarStyle}>
            {/* LEFT: stacked brand */}
            <div style={brandWrap}>
              <div style={brandTitle}>TradePage</div>
              <div style={brandTagline}>Your business in a link</div>
            </div>

            {/* RIGHT: auth links (Dashboard / Sign out) */}
            <AuthLinks />
          </header>

          <main style={{ paddingTop: 16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
