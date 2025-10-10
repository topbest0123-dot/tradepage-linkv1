'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PublicPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [row, setRow] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      setRow(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('slug,name,trade,city')
          .eq('slug', String(slug))
          .maybeSingle();

        if (cancelled) return;

        if (error) setErr(error.message);
        else setRow(data);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (slug) run();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div style={{ padding: 16, color: '#eaf2ff', fontFamily: 'system-ui, sans-serif' }}>
      <div>Route OK — slug: <strong>{String(slug)}</strong></div>
      {loading && <div style={{ opacity: 0.7, marginTop: 12 }}>Loading…</div>}
      {err && <div style={{ marginTop: 12, color: '#f88' }}>Error: {err}</div>}
      {!loading && !err && !row && <div style={{ marginTop: 12 }}>No profile found.</div>}
      {row && (
        <pre style={{ marginTop: 12, background: '#0b1524', padding: 12, borderRadius: 8 }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      )}
    </div>
  );
}
