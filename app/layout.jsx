// app/layout.jsx
import AuthLinks from '@/components/AuthLinks';
import './globals.css';

export const metadata = {
  // lets you use relative URLs in openGraph/twitter
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradepage.link'
  ),
  title: {
    default: 'TradePage',
    template: '%s — TradePage',
  },
  description: 'Your business in a link',
  openGraph: {
    type: 'website',
    url: '/',                     // resolved against metadataBase
    siteName: 'TradePage',
    title: 'TradePage — Your business in a link',
    description: 'Your business in a link',
    images: [
      {
        url: '/og-default.png',   // ensure this file exists in /public
        width: 1200,
        height: 630,
        alt: 'TradePage',
      },
    ],
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
      <body
        style={{
          fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial',
          padding: 0,
          margin: 0,
          background: '#0a0f14',
          color: '#eaf2ff',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
          <header
            style={{
              padding: '16px 0',
              borderBottom: '1px solid #213a6b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <b>TradePage</b>{' '}
              <span style={{ opacity: 0.7 }}>— Your business in a link</span>
            </div>
            <AuthLinks />
          </header>

          <main style={{ paddingTop: 16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
