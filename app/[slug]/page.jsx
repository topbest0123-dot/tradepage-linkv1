'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* ---- same THEMES + helper as dashboard ---- */
const THEMES = {
  /* keep exactly the same 10 themes from the dashboard file */
  'deep-navy': { name:'Deep Navy', vars:{'--bg':'#0a0f14','--text':'#eaf2ff','--muted':'#b8ccff','--border':'#183153','--card-bg-1':'#0f213a','--card-bg-2':'#0b1524','--chip-bg':'#0c1a2e','--chip-border':'#27406e','--btn-primary-1':'#66e0b9','--btn-primary-2':'#8ab4ff','--btn-neutral-bg':'#1f2937','--social-border':'#213a6b'} },
  'midnight-teal': { name:'Midnight Teal', vars:{'--bg':'#071417','--text':'#e9fbff','--muted':'#c0e9f2','--border':'#15444a','--card-bg-1':'#0b2a31','--card-bg-2':'#0a1e24','--chip-bg':'#0a2227','--chip-border':'#1e5660','--btn-primary-1':'#51e1c2','--btn-primary-2':'#6db7ff','--btn-neutral-bg':'#122026','--social-border':'#214e56'} },
  'royal-purple': { name:'Royal Purple', vars:{'--bg':'#0c0714','--text':'#f0e9ff','--muted':'#d7c9ff','--border':'#3b2b6a','--card-bg-1':'#1b1340','--card-bg-2':'#120e2b','--chip-bg':'#160f33','--chip-border':'#463487','--btn-primary-1':'#8f7bff','--btn-primary-2':'#c48bff','--btn-neutral-bg':'#221a3d','--social-border':'#3d2f72'} },
  'forest-emerald': { name:'Forest Emerald', vars:{'--bg':'#07130e','--text':'#eafff5','--muted':'#c8f5e6','--border':'#1c4f3b','--card-bg-1':'#0c2b21','--card-bg-2':'#0a1f18','--chip-bg':'#0a231c','--chip-border':'#1d5f49','--btn-primary-1':'#38e6a6','--btn-primary-2':'#7bd7ff','--btn-neutral-bg':'#0f1d18','--social-border':'#215846'} },
  'graphite-ember': { name:'Graphite Ember', vars:{'--bg':'#0a0a0c','--text':'#f3f3f7','--muted':'#d9d9e2','--border':'#34353a','--card-bg-1':'#16171c','--card-bg-2':'#0f1013','--chip-bg':'#121317','--chip-border':'#383a41','--btn-primary-1':'#ffb259','--btn-primary-2':'#ff7e6e','--btn-neutral-bg':'#1b1c21','--social-border':'#3a3b42'} },
  'sapphire-ice': { name:'Sapphire Ice', vars:{'--bg':'#051018','--text':'#eaf6ff','--muted':'#cfe6ff','--border':'#1a3f63','--card-bg-1':'#0b2235','--card-bg-2':'#081827','--chip-bg':'#0a1d2c','--chip-border':'#1f4a77','--btn-primary-1':'#6cd2ff','--btn-primary-2':'77ffa9','--btn-neutral-bg':'#0f1b28','--social-border':'#204a73'} },
  'cocoa-bronze': { name:'Cocoa Bronze', vars:{'--bg':'#0f0b09','--text':'#fff3e6','--muted':'#f6dcc4','--border':'#4a2e22','--card-bg-1':'#211510','--card-bg-2':'#170f0c','--chip-bg':'#1a120f','--chip-border':'#523428','--btn-primary-1':'#ffb26b','--btn-primary-2':'#ffd07e','--btn-neutral-bg':'#241813','--social-border':'#523a2e'} },
  'indigo-blush': { name:'Indigo Blush', vars:{'--bg':'#0c0a13','--text':'#f1eeff','--muted':'#e0d6ff','--border':'#2f2950','--card-bg-1':'#18143a','--card-bg-2':'#120f2b','--chip-bg':'#130f2f','--chip-border':'#3a3263','--btn-primary-1':'#9ea0ff','--btn-primary-2':'#ff92b0','--btn-neutral-bg':'#1b173d','--social-border':'#362f5a'} },
  'space-plum': { name:'Space Plum', vars:{'--bg':'#0c0910','--text':'#fdeeff','--muted':'#f4d0ff','--border':'#3b2245','--card-bg-1':'#1a0f24','--card-bg-2':'#120a19','--chip-bg':'#150c1d','--chip-border':'#4c2b5a','--btn-primary-1':'#c77dff','--btn-primary-2':'#72e4ff','--btn-neutral-bg':'#1c1225','--social-border':'#4a2c59'} },
  'ocean-umber': { name:'Ocean Umber', vars:{'--bg':'#081011','--text':'#e9faff','--muted':'#cfeef5','--border':'#254047','--card-bg-1':'#0f2327','--card-bg-2':'#0b191c','--chip-bg':'#0c1d21','--chip-border':'#2f5963','--btn-primary-1':'#78d8c3','--btn-primary-2':'#ffd384','--btn-neutral-bg':'#0f1b1e','--social-border':'#2d545e'} },
  'ink': { name:'High-Contrast Ink', vars:{'--bg':'#070809','--text':'#ffffff','--muted':'#cfd4d9','--border':'#2a2d31','--card-bg-1':'#111316','--card-bg-2':'#0b0d10','--chip-bg':'#0e1013','--chip-border':'#32353a','--btn-primary-1':'#ffffff','--btn-primary-2':'#9ad3ff','--btn-neutral-bg':'#1a1d21','--social-border':'#32363b'} },
};

const themeVarsToStyle = (key) => {
  const t = THEMES[key] || THEMES['deep-navy'];
  const s = {};
  Object.entries(t.vars).forEach(([k, v]) => (s[k] = v));
  return s;
};

const toList = (value) =>
  String(value ?? '')
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const publicUrlFor = (path) =>
  path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;

const normalizeSocial = (type, raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, '');
  switch (type) {
    case 'facebook': return `https://facebook.com/${handle}`;
    case 'instagram': return `https://instagram.com/${handle}`;
    case 'tiktok': return `https://www.tiktok.com/@${handle}`;
    case 'x': return `https://x.com/${handle}`;
    default: return null;
  }
};

export default function PublicPage() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,facebook,instagram,tiktok,x,avatar_path,other_info,theme')
        .ilike('slug', slug)
        .maybeSingle();
      if (error) console.error(error);
      if (!data) setNotFound(true);
      else setP(data);
    };
    load();
  }, [slug]);

  const areas = useMemo(() => toList(p?.areas), [p]);
  const services = useMemo(() => toList(p?.services), [p]);
  const priceLines = useMemo(
    () => String(p?.prices ?? '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    [p]
  );

  if (notFound) return <div style={pageWrapStyle}><p>This page doesn’t exist yet.</p></div>;
  if (!p) return <div style={pageWrapStyle}><p>Loading…</p></div>;

  const callHref = p?.phone ? `tel:${p.phone.replace(/\s+/g, '')}` : null;
  const waHref = p?.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, '')}` : null;
  const avatarUrl = publicUrlFor(p?.avatar_path);

  const fb = normalizeSocial('facebook', p?.facebook);
  const ig = normalizeSocial('instagram', p?.instagram);
  const tk = normalizeSocial('tiktok', p?.tiktok);
  const xx = normalizeSocial('x', p?.x);

  const themeStyle = themeVarsToStyle(p?.theme || 'deep-navy');

  return (
    <div style={{ ...themeStyle, background: 'var(--bg)', color: 'var(--text)' }}>
      {/* HEADER */}
      <div style={headerCardStyle}>
        <div style={headerLeftStyle}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${p.name || p.slug} logo`}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                objectFit: 'cover',
                border: '1px solid var(--border)',
                background: 'var(--card-bg-2)',
                marginRight: 10,
              }}
            />
          ) : (
            <div style={logoDotStyle}>★</div>
          )}
          <div>
            <div style={headerNameStyle}>{p.name || p.slug}</div>
            <div style={headerSubStyle}>{[p.trade, p.city].filter(Boolean).join(' • ')}</div>
          </div>
        </div>

        <div style={ctaRowStyle}>
          {callHref && (
            <a href={callHref} style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>
              Call
            </a>
          )}
          {waHref && (
            <a href={waHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
              WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              const url = window.location.href;
              const title = document.title || 'TradePage';
              if (navigator.share) navigator.share({ title, url }).catch(() => {});
              else navigator.clipboard?.writeText(url) ?? window.prompt('Copy this link:', url);
            }}
            style={{
              ...btnBaseStyle,
              border: '1px solid var(--social-border)',
              background: 'transparent',
              color: 'var(--text)',
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* Social bar */}
      {(fb || ig || tk || xx) && (
        <div style={socialBarWrapStyle}>
          {fb && <a href={fb} target="_blank" rel="noopener noreferrer" style={socialBtnStyle}><span style={socialGlyphStyle}>f</span></a>}
          {ig && <a href={ig} target="_blank" rel="noopener noreferrer" style={socialBtnStyle}><span style={socialGlyphStyle}>IG</span></a>}
          {tk && <a href={tk} target="_blank" rel="noopener noreferrer" style={socialBtnStyle}><span style={socialGlyphStyle}>t</span></a>}
          {xx && <a href={xx} target="_blank" rel="noopener noreferrer" style={socialBtnStyle}><span style={socialGlyphStyle}>X</span></a>}
        </div>
      )}

      {/* One-column sections on mobile, two on desktop */}
      <div style={gridStyle}>
        <Card title="About">
          <p style={pStyle}>
            {p.about?.trim()?.length ? p.about
              : (services[0] ? `${services[0]}. Reliable, friendly and affordable. Free quotes, no hidden fees.`
                : 'Reliable, friendly and affordable. Free quotes, no hidden fees.')}
          </p>
        </Card>

        <Card title="Prices">
          <ul style={listResetStyle}>
            {priceLines.length === 0 && <li style={{ opacity: 0.7 }}>Please ask for a quote.</li>}
            {priceLines.map((ln, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{ln}</li>
            ))}
          </ul>
        </Card>

        <Card title="Areas we cover">
          {areas.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {areas.map((a, i) => (
                <span key={i} style={chipStyle}>{a}</span>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>No areas listed yet.</div>
          )}
        </Card>

        <Card title="Services">
          {services.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {services.map((s, i) => (
                <span key={i} style={chipStyle}>{s}</span>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>No services listed yet.</div>
          )}
        </Card>

        <Card title="Hours">
          <div style={{ opacity: 0.9 }}>{p.hours || 'Mon–Sat 08:00–18:00'}</div>
        </Card>

        {p.other_info?.trim()?.length > 0 && (
          <Card title="Other useful information" wide>
            <p style={pStyle}>{p.other_info}</p>
          </Card>
        )}

        <Card title="Gallery" wide>
          <div style={galleryGridStyle}>
            <div style={galleryItemStyle}><div style={imgPlaceholderStyle}>work photo</div></div>
            <div style={galleryItemStyle}><div style={imgPlaceholderStyle}>work photo</div></div>
            <div style={galleryItemStyle}>
              <img
                src="https://images.unsplash.com/photo-1581091870673-1e7e1c1a5b1d?q=80&w=1200&auto=format&fit=crop"
                alt="work"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- components & styles ---------- */
function Card({ title, wide = false, children }) {
  return (
    <section style={{ ...cardStyle, gridColumn: wide ? '1 / -1' : 'auto' }}>
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

const pageWrapStyle = {
  maxWidth: 980,
  margin: '28px auto',
  padding: '0 16px 48px',
  color: 'var(--text)',
  overflowX: 'hidden',
};

const headerCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 16,
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))',
  margin: '16px auto 8px',
  maxWidth: 980,
};

const headerLeftStyle = { display: 'flex', alignItems: 'center' };
const logoDotStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--btn-primary-1)',
  color: '#0a0f1c',
  fontWeight: 800,
  fontSize: 18,
  marginRight: 10,
};
const headerNameStyle = { fontWeight: 800, fontSize: 20, lineHeight: '22px' };
const headerSubStyle = { opacity: 0.75, fontSize: 13, marginTop: 3 };
const ctaRowStyle = { display: 'flex', gap: 8, flexWrap: 'wrap' };

const btnBaseStyle = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
};
const btnPrimaryStyle = {
  background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
  color: '#08101e',
};
const btnNeutralStyle = {
  background: 'var(--btn-neutral-bg)',
  color: '#ffffff',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 16,
  margin: '16px auto',
  maxWidth: 980,
};
const h2Style = { margin: '0 0 10px 0', fontSize: 18 };
const cardStyle = {
  padding: 16,
  borderRadius: 16,
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))',
  minWidth: 0,
};
const pStyle = {
  marginTop: 0,
  marginBottom: 0,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  lineHeight: 1.5,
};

const chipStyle = {
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid var(--chip-border)',
  background: 'var(--chip-bg)',
  color: 'var(--text)',
  fontSize: 13,
};

const listResetStyle = { margin: 0, padding: 0, listStyle: 'none' };

const galleryGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 };
const galleryItemStyle = {
  height: 220,
  borderRadius: 14,
  border: '1px solid var(--chip-border)',
  background: 'var(--card-bg-2)',
  overflow: 'hidden',
};
const imgPlaceholderStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.75,
};

const socialBarWrapStyle = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap',
  margin: '0 0 12px 0',
};
const socialBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: '1px solid var(--social-border)',
  background: 'transparent',
  color: 'var(--text)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  outline: 'none',
  transition: 'transform 120ms ease, background 120ms ease, border-color 120ms ease',
};
const socialGlyphStyle = { fontSize: 13, fontWeight: 800, letterSpacing: 0.2, lineHeight: 1 };
