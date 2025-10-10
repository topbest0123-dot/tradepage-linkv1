'use client';

import { useParams } from 'next/navigation';

export default function PublicPage() {
  const { slug } = useParams();
  return (
    <div style={{ padding: 16, color: '#eaf2ff' }}>
      Route OK — slug: <strong>{String(slug)}</strong>
    </div>
  );
}
