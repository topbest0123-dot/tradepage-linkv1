'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* ---------- helpers ---------- */
const toList = (v) => String(v ?? '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
const publicUrlFor = (p) => (p ? supabase.storage.from('avatars').getPublicUrl(p).data.publicUrl : null);
const normalizeSocial = (t, raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, '');
  return t === 'facebook'  ? `https://facebook.com/${h}` :
         t === 'instagram' ? `https://instagram.com/${h}` :
         t === 'tiktok'    ? `https://www.tiktok.com/@${h}` :
         t === 'x'         ? `https://x.com/${h}` : null;
};

/* ---------- themes ---------- */
const THEMES = {
  // dark
  'deep-navy':      {'--bg':'#0a0f14','--text':'#eaf2ff','--muted':'#b8ccff','--border':'#183153','--card-bg-1':'#0f213a','--card-bg-2':'#0b1524','--chip-bg':'#0c1a2e','--chip-border':'#27406e','--btn-primary-1':'#66e0b9','--btn-primary-2':'#8ab4ff','--btn-neutral-bg':'#1f2937','--social-border':'#213a6b'},
  'midnight-teal':  {'--bg':'#071417','--text':'#e9fbff','--muted':'#c0e9f2','--border':'#15444a','--card-bg-1':'#0b2a31','--card-bg-2':'#0a1e24','--chip-bg':'#0a2227','--chip-border':'#1e5660','--btn-primary-1':'#51e1c2','--btn-primary-2':'#6db7ff','--btn-neutral-bg':'#122026','--social-border':'#214e56'},
  'royal-purple':   {'--bg':'#0c0714','--text':'#f0e9ff','--muted':'#d7c9ff','--border':'#3b2b6a','--card-bg-1':'#1b1340','--card-bg-2':'#120e2b','--chip-bg':'#160f33','--chip-border':'#463487','--btn-primary-1':'#8f7bff','--btn-primary-2':'#c48bff','--btn-neutral-bg':'#221a3d','--social-border':'#3d2f72'},
  'graphite-ember': {'--bg':'#0a0a0c','--text':'#f3f3f7','--muted':'#d9d9e2','--border':'#34353a','--card-bg-1':'#16171c','--card-bg-2':'#0f1013','--chip-bg':'#121317','--chip-border':'#383a41','--btn-primary-1':'#ffb259','--btn-primary-2':'#ff7e6e','--btn-neutral-bg':'#1b1c21','--social-border':'#3a3b42'},
  'sapphire-ice':   {'--bg':'#051018','--text':'#eaf6ff','--muted':'#cfe6ff','--border':'#1a3f63','--card-bg-1':'#0b2235','--card-bg-2':'#081827','--chip-bg':'#0a1d2c','--chip-border':'#1f4a77','--btn-primary-1':'#6cd2ff','--btn-primary-2':'#77ffa9','--btn-neutral-bg':'#0f1b28','--social-border':'#204a73'},
  'forest-emerald': {'--bg':'#07130e','--text':'#eafff5','--muted':'#c8f5e6','--border':'#1c4f3b','--card-bg-1':'#0c2b21','--card-bg-2':'#0a1f18','--chip-bg':'#0a231c','--chip-border':'#1d5f49','--btn-primary-1':'#38e6a6','--btn-primary-2':'#7bd7ff','--btn-neutral-bg':'#0f1d18','--social-border':'#215846'},
  // light
  'paper-snow':     {'--bg':'#ffffff','--text':'#121417','--muted':'#5b6777','--border':'#e5e7ea','--card-bg-1':'#ffffff','--card-bg-2':'#f7f9fb','--chip-bg':'#f3f5f7','--chip-border':'#e5e7ea','--btn-primary-1':'#3b82f6','--btn-primary-2':'#22c55e','--btn-neutral-bg':'#eef2f6','--social-border':'#dfe3e8'},
  'porcelain-mint': {'--bg':'#f6fbf8','--text':'#0b1b16','--muted':'#4c6a5e','--border':'#cfe7dc','--card-bg-1':'#ffffff','--card-bg-2':'#f1f7f3','--chip-bg':'#eef5f0','--chip-border':'#cfe7dc','--btn-primary-1':'#21c58b','--btn-primary-2':'#5fb9ff','--btn-neutral-bg':'#e9f2ed','--social-border':'#c7e0d4'},
  'linen-rose':     {'--bg':'#fbf7f5','--text':'#221a16','--muted':'#6d5c54','--border':'#eaded7','--card-bg-1':'#ffffff','--card-bg-2':'#f6efeb','--chip-bg':'#f2eae6','--chip-border':'#eaded7','--btn-primary-1':'#f472b6','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#efe7e3','--social-border':'#e6d9d1'},
  'sandstone':      {'--bg':'#faf7f1','--text':'#191714','--muted':'#6f675f','--border':'#eadfcd','--card-bg-1':'#ffffff','--card-bg-2':'#f6f1e7','--chip-bg':'#f2ece1','--chip-border':'#eadfcd','--btn-primary-1':'#f59e0b','--btn-primary-2':'#84cc16','--btn-neutral-bg':'#efe9df','--social-border':'#e6dac7'},
  'cloud-blue':     {'--bg':'#f6fbff','--text':'#0e141a','--muted':'#526576','--border':'#d8e6f1','--card-bg-1':'#ffffff','--card-bg-2':'#eff6fb','--chip-bg':'#edf4fa','--chip-border':'#d8e6f1','--btn-primary-1':'#60a5fa','--btn-primary-2':'#34d399','--btn-neutral-bg':'#eaf2f8','--social-border':'#d3e2ee'},
  'ivory-ink':      {'--bg':'#fffdf7','--text':'#101112','--muted':'#5a5e66','--border':'#ebe7db','--card-bg-1':'#ffffff','--card-bg-2':'#faf7ef','--chip-bg':'#f7f4ed','--chip-border':'#ebe7db','--btn-primary-1':'#111827','--btn-primary-2':'#64748b','--btn-neutral-bg':'#f1ede4','--social-border':'#e7e2d6'},
};

/* accept friendly names from the dashboard too */
const ALIAS = {
  'midnight': 'deep-navy',
  'cocoa-bronze': 'graphite-ember',
  'cocoa bronze': 'graphite-ember',
  'ivory-sand': 'paper-snow',
  'ivory sand': 'paper-snow',
  'glacier-mist': 'cloud-blue',
  'glacier mist': 'cloud-blue',
};

const normalizeThemeKey = (raw) => {
  const k = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (THEMES[k]) return k;
  if (ALIAS[k]) return ALIAS[k];
  return 'deep-navy';
};

const applyTheme = (key) => {
  const vars = THEMES[key] || THEMES['deep-navy'];
  const r = document.documentElement;
  for (const [cssVar, val] of Object.entries(vars)) r.style.setProperty(cssVar, val);
};

/* make a tel: href from phone or whatsapp */
const getDialHref = (profile) => {
  const raw =
    profile?.phone ??
    profile?.phone_number ??
    profile?.tel ??
    profile?.whatsapp ??
    '';
  const cleaned = String(raw).replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');
  return digits.length >= 6 ? `tel:${cleaned}` : null;
};

/* ---------- page ---------- */
export default function PublicPage() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,facebook,instagram,tiktok,x,avatar_path,other_info')
        .ilike('slug', slug)
        .maybeSingle();

      if (error) console.error(error);
      if (!data) setNotFound(true);
      else setP(data);
    };
    load();
  }, [slug]);

  // apply theme when data arrives
  useEffect(() => {
    if (p?.theme !== undefined) applyTheme(normalizeThemeKey(p.theme));
  }, [p?.theme]);

  if (notFound) return <div style={pageWrapStyle}><p>This page doesn’t exist yet.</p></div>;
  if (!p) return <div style={pageWrapStyle}><p>Loading…</p></div>;

  // buttons + avatar
  const callHref = getDialHref(p);
  const waHref = p?.whatsapp ? `https://wa.me/${String(p.whatsapp).replace(/\D/g, '')}` : null;
  const avatarUrl = publicUrlFor(p?.avatar_path);

  // Social links
  const fb = normalizeSocial('facebook',  p?.facebook);
  const ig = normalizeSocial('instagram', p?.instagram);
  const tk = normalizeSocial('tiktok',    p?.tiktok);
  const xx = normalizeSocial('x',         p?.x);

  // memoized price lines
  const priceLines = useMemo(
    () =>
      String(p?.prices ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [p]
  );

  // parse areas
  const areas = String(p?.areas || '')
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  // parse services
  const services = String(p?.services || '')
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  // --- Tiny placeholder render (bypasses full JSX) ---
  return (
    <div style={{ padding: 16, color: '#eaf2ff' }}>
      Baseline OK — render stage reached.
    </div>
  );
}

/* ---------- components & styles ---------- */
function Card({ title, children }) {
  return (
    <section
      style={{
        padding: 16,
        borderRadius: 16,
        border: '1px solid #183153',
        background: 'linear-gradient(180deg,#0f213a,#0b1524)',
        minWidth: 0,
      }}
    >
      {title && (
        <h2 style={{ margin: '0 0 10px 0', fontSize: 18 }}>{title}</h2>
      )}
      {children}
    </section>
  );
}

/* (existing constants kept) */
const pageWrapStyle = { maxWidth: 980, margin: '28px auto', padding: '0 16px 48px', color: 'var(--text)', background: 'var(--bg)', overflowX: 'hidden' };
const headerCardStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 18px', borderRadius: 16, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))', marginBottom: 12 };
const headerNameStyle = { fontWeight: 800, fontSize: 22, lineHeight: '24px' };
const headerSubStyle  = { opacity: 0.75, fontSize: 14, marginTop: 4 };
const btnBaseStyle = { padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' };
const btnPrimaryStyle = { background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))', color: '#08101e', border: '1px solid var(--border)' };
const btnNeutralStyle = { background: 'var(--btn-neutral-bg)', color: 'var(--text)' };
const listResetStyle = { margin: 0, padding: 0, listStyle: 'none' };
