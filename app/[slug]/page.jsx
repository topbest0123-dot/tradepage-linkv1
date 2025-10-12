'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// tiny helpers (existing)
const digitsOnly = (v) => String(v || '').replace(/\D+/g, '');
const telHref = (phone) => `tel:${digitsOnly(phone)}`;
const waHref  = (num)   => `https://wa.me/${digitsOnly(num)}`;

// --- SOCIAL USERNAME/URL HELPER ---
const asUrl = (type, v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const clean = s.replace(/^@/, '');
  switch (type) {
    case 'instagram': return `https://instagram.com/${clean}`;
    case 'tiktok':    return `https://tiktok.com/@${clean}`;
    case 'facebook':  return `https://facebook.com/${clean}`;
    case 'youtube':   return `https://youtube.com/${clean}`;
    case 'x':         return `https://x.com/${clean}`;
    case 'website':   return `https://${clean}`;
    default:          return s;
  }
};

/** Small helper: turn any value into a clean list of strings */
const toList = (value) =>
  String(value ?? '')
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

// Build a public URL from a storage path in the 'avatars' bucket (client side)
const publicUrlFor = (path) =>
  path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;

/* --- BRAND ICONS --- */
const ICONS = {
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4v1.8h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 8.1a6.3 6.3 0 0 1-4.3-2V16a6 6 0 1 1-6-6c.3 0 .6 0 .9.1v3.2a3 3 0 1 0 2.1 2.9V2.9h3a6.3 6.3 0 0 0 4.3 3V8z"/>
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 3H21l-6.7 7.7L21.8 21h-5.3l-4.2-5.4L7.4 21H3l7.4-8.5L2.5 3H8l3.8 4.9L18.9 3zM16 19h1.5L7.1 5H5.6L16 19z"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm6-2.8a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.7z"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.9 4.4 12 4.4 12 4.4s-6.9 0-8.5.5A3 3 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5A3 3 0 0 0 22.6 17c.4-1.6.4-5 .4-5zM10 15.5v-7l6 3.5-6 3.5z"/>
    </svg>
  ),
  website: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 2c1.9 0 3.6.7 4.9 1.8l-2.1 2.1A5 5 0 0 0 7 12H5a7 7 0 0 1 7-8zm0 16a7 7 0 0 1-7-7h2a5 5 0 0 0 8.8 3.5l2.1 2.1A6.97 6.97 0 0 1 12 20z"/>
    </svg>
  ),
};

export default function Page({ params }) {
  const slug = params?.slug;
  const [p, setP] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,avatar_path,instagram,tiktok,facebook,youtube,x,website'
        )
        .ilike('slug', slug)
        .maybeSingle();

      if (error) console.error(error);
      if (!data) setNotFound(true);
      else setP(data);
    };
    load();
  }, [slug]);

  /** Safe parsed lists */
  const areas = useMemo(() => toList(p?.areas), [p]);
  const services = useMemo(() => toList(p?.services), [p]);
  const priceLines = useMemo(
    () =>
      String(p?.prices ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [p]
  );

  // Build round-icon social buttons list once profile is loaded
  const socials = useMemo(() => ([
    ['instagram', asUrl('instagram', p?.instagram), 'IG'],
    ['tiktok',    asUrl('tiktok',    p?.tiktok),    't'],
    ['facebook',  asUrl('facebook',  p?.facebook),  'f'],
    ['youtube',   asUrl('youtube',   p?.youtube),   'YT'],
    ['x',         asUrl('x',         p?.x),         'X'],
    ['website',   asUrl('website',   p?.website),   '🌐'],
  ].filter(([, url]) => !!url)), [p]);

  if (notFound) return <div style={pageWrapStyle}><p>This page doesn’t exist yet.</p></div>;
  if (!p) return <div style={pageWrapStyle}><p>Loading…</p></div>;

  const avatarUrl = publicUrlFor(p?.avatar_path);

  // --- Share handler (native share on mobile, clipboard fallback on desktop) ---
  const handleShare = () => {
    const url = window.location.href;
    const title = document.title || 'TradePage';
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      try {
        navigator.clipboard.writeText(url).then(
          () => alert('Link copied to clipboard'),
          () => window.prompt('Copy this link:', url)
        );
      } catch (e) {
        window.prompt('Copy this link:', url);
      }
    }
  };

  return (
    <div style={pageWrapStyle}>
      {/* CANARY label (debug) */}
      <div style={{position:'fixed',top:8,right:8,fontSize:12,opacity:.7,background:'rgba(0,0,0,.4)',color:'#fff',padding:'4px 6px',borderRadius:6,zIndex:9999}}>
        CANARY-A
      </div>

      {/* desktop-only tweak: make only Gallery span both columns on desktop */}
      <style>{`
        @media (min-width: 900px) {
          section.gallery-wide { grid-column: 1 / -1 !important; }
        }
      `}</style>

      {/* HEADER CARD */}
      <div style={headerCardStyle}>
        <div style={headerLeftStyle}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${p.name || p.slug} logo`}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                objectFit: 'cover',
                border: '1px solid #183153',
                background: '#0b1524',
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
          {/* Phone */}
          {p?.phone && (
            <a
              href={telHref(p.phone)}
              style={{ ...btnBaseStyle, ...btnPrimaryStyle }}
              className="underline"
            >
              Call {p.phone}
            </a>
          )}

          {/* WhatsApp */}
          {p?.whatsapp && (
            <a
              href={waHref(p.whatsapp)}
              style={{ ...btnBaseStyle, ...btnNeutralStyle }}
              className="underline"
            >
              WhatsApp {p.whatsapp}
            </a>
          )}

          {/* Share button */}
          <button
            type="button"
            id="share-btn"
            onClick={handleShare}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid #213a6b',
              background: 'transparent',
              color: '#eaf2ff',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 8,
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* Socials row — place between </header> and <main> */}
      {socials.length > 0 && (
        <nav className="max-w-4xl mx-auto mt-3 mb-1">
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {socials.map(([key, url, label]) => (
              <li key={key}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '9999px',
                    border: '1px solid var(--border)',
                    background: 'var(--chip-bg)',
                    color: 'var(--chip-text)',
                    textDecoration: 'none',
                  }}
                >
                  {ICONS[key] || label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* GRID (acts as main content) */}
      <div style={grid2Style}>
        {/* About */}
        <Card title="About">
          <p
            style={{
              marginTop: 0,
              marginBottom: 0,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              lineHeight: 1.5,
              maxWidth: '100%',
            }}
          >
            {p.about && p.about.trim().length > 0
              ? p.about
              : (services[0]
                  ? `${services[0]}. Reliable, friendly and affordable. Free quotes, no hidden fees.`
                  : 'Reliable, friendly and affordable. Free quotes, no hidden fees.')}
          </p>
        </Card>

        {/* Prices */}
        <Card title="Prices">
          <ul style={listResetStyle}>
            {priceLines.length === 0 && (
              <li style={{ opacity: 0.7 }}>Please ask for a quote.</li>
            )}
            {priceLines.map((ln, i) => (
              <li
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
              >
                <span style={tagStyle}>from</span>
                <span>{ln}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Areas / Zones */}
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

        {/* Services as chips */}
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

        {/* Hours */}
        <Card title="Hours">
          <div style={{ opacity: 0.9 }}>{p.hours || 'Mon–Sat 08:00–18:00'}</div>
        </Card>

        {/* Gallery — desktop-only wide */}
        <Card title="Gallery" className="gallery-wide">
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

/* ---------- Components ---------- */
function Card({ title, wide = false, className, children }) {
  return (
    <section
      className={className}
      style={{ ...cardStyle, gridColumn: wide ? '1 / -1' : 'auto' }}
    >
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

/* ---------- Styles ---------- */
const pageWrapStyle = {
  maxWidth: 980,
  margin: '28px auto',
  padding: '0 16px 48px',
  color: '#eaf2ff',
  overflowX: 'hidden',
};

const headerCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 18px',
  borderRadius: 16,
  border: '1px solid #183153',
  background: 'linear-gradient(180deg,#0f213a,#0b1524)',
  marginBottom: 12, // tighten to make room for socials row
};
const headerLeftStyle = { display: 'flex', alignItems: 'center', gap: 12 };
const logoDotStyle = {
  width: 48,
  height: 48,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#63d3e0',
  color: '#0a0f1c',
  fontWeight: 800,
  fontSize: 20,
};
const headerNameStyle = { fontWeight: 800, fontSize: 22, lineHeight: '24px' };
const headerSubStyle = { opacity: 0.75, fontSize: 14, marginTop: 4 };
const ctaRowStyle = { display: 'flex', gap: 10, flexWrap: 'wrap' };

const btnBaseStyle = {
  padding: '10px 16px',
  borderRadius: 12,
  border: '1px solid #2f3c4f',
  textDecoration: 'none',
};
const btnPrimaryStyle = {
  background: 'linear-gradient(135deg,#66e0b9,#8ab4ff)',
  color: '#08101e',
  border: '1px solid #2d4e82',
  fontWeight: 700,
};
const btnNeutralStyle = {
  background: '#1f2937',
  color: '#ffffff',
  fontWeight: 700,
};

const h2Style = { margin: '0 0 10px 0', fontSize: 18 };
const cardStyle = {
  padding: 16,
  borderRadius: 16,
  border: '1px solid #183153',
  background: 'linear-gradient(180deg,#0f213a,#0b1524)',
  minWidth: 0,
};
const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 };

const chipStyle = {
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid #27406e',
  background: '#0c1a2e',
  color: '#d1e1ff',
  fontSize: 13,
};
const tagStyle = {
  fontSize: 12,
  padding: '2px 8px',
  borderRadius: 999,
  border: '1px solid #27406e',
  background: '#0c1a2e',
  color: '#b8ccff',
};
const listResetStyle = { margin: 0, padding: 0, listStyle: 'none' };

const galleryGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 };
const galleryItemStyle = {
  height: 220,
  borderRadius: 14,
  border: '1px solid #27406e',
  background: '#0b1627',
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
