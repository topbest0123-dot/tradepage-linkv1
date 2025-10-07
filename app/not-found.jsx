import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>404 — Page not found</h1>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link href="/" style={{ padding: '10px 16px', border: '1px solid #213a6b', borderRadius: 12, textDecoration: 'none' }}>
          Go home
        </Link>
      </div>
    </main>
  );
}
