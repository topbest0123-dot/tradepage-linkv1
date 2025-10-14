'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DebugSlug() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,facebook,instagram,tiktok,x,avatar_path,other_info,theme')
        .ilike('slug', slug)
        .maybeSingle();

      if (cancelled) return;
      if (error) setErr(error.message || String(error));
      setData(data || null);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (err) return <pre style={{ padding: 24, color: 'tomato' }}>ERROR: {err}</pre>;
  if (!data) return <div style={{ padding: 24 }}>Loading…</div>;
  return (
    <pre style={{ padding: 24, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
