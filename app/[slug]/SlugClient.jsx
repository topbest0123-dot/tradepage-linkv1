'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Script from 'next/script'; // if you actually need it

export default function SlugClient({ slug }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (error) throw error;
        if (!ignore) setProfile(data);
      } catch (e) {
        console.error(e);
        if (!ignore) setProfile(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [slug]);

  if (loading) return <div>Loading…</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="px-4 py-6">
      {/* Put your previous slug-page UI here */}
      <h1 className="text-2xl font-bold">{profile.display_name || slug}</h1>
      {profile.bio && <p className="mt-2">{profile.bio}</p>}

      {/* Example if you actually needed a script previously: */}
      {/* <Script src="..." strategy="afterInteractive" /> */}
    </div>
  );
}
