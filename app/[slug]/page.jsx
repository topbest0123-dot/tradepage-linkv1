'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Script from 'next/script'; // kept to avoid changing imports

/** Turn any value into a clean list of strings */
const toList = (value) =>
  String(value ?? '')
    .split(/[,\n]+/) // commas OR new lines
    .map((s) => s.trim())
    .filter(Boolean);

/** Build a public URL from a storage path in the 'avatars' bucket */
const publicUrlFor = (path) =>
  path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;

/** Turn "@handle" or partial into a full URL per network */
function normalizeSocial(type, raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v; // already a full URL
  const handle = v.replace(/^@/, '');
  switch (type) {
    case 'facebook':
      return `https://facebook.com/${handle}`;
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${handle}`;
    case 'x':
      return `https://x.com/${handle}`;
    default:
      return null;
  }
}

/* ---------------- THEME SYSTEM (public page) ---------------- */

const normalizeThemeKey = (s) =>
  String(s || 'Midnight')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

/** CSS variables for each theme (rich contrasts, light & dark) */
const THEME_VARS = {
  midnight: {
    '--bg': '#0a0f14',
    '--text': '#eaf2ff',
    '--surface-from': '#0f213a',
    '--surface-to': '#0b1524',
    '--border': '#183153',
    '--chip-bg': '#0c1a2e',
    '--chip-border': '#27406e',
    '--btn-neutral-bg': '#1f2937',
    '--btn-neutral-text': '#ffffff',
    '--btn-primary-from': '#66e0b9',
    '--btn-primary-to': '#8ab4ff',
    '--btn-primary-border': '#2d4e82',
  },

  cocoa_bronze: {
    '--bg': '#1a1410',
    '--text': '#f7efe7',
    '--surface-from': '#2a201a',
    '--surface-to': '#211913',
    '--border': '#4a3a2e',
    '--chip-bg': '#241b15',
    '--chip-border': '#584434',
    '--btn-neutral-bg': '#3a2f26',
    '--btn-neutral-text': '#f7efe7',
    '--btn-primary-from': '#b8845a',
    '--btn-primary-to': '#d6b48f',
    '--btn-primary-border': '#8a674b',
  },

  ivory_sand: {
    '--bg': '#f4efe8',
    '--text': '#1f2430',
    '--surface-from': '#ffffff',
    '--surface-to': '#f3eee7',
    '--border': '#e1d7c7',
    '--chip-bg': '#ffffff',
    '--chip-border': '#e6dccd',
    '--btn-neutral-bg': '#ece8e2',
    '--btn-neutral-text': '#1f2430',
    '--btn-primary-from': '#bcd3ff',
    '--btn-primary-to': '#f0c9a7',
    '--btn-primary-border': '#9db6e6',
  },

  glacier_mist: {
    '--bg': '#eef5fa',
    '--text': '#18202a',
    '--surface-from': '#ffffff',
    '--surface-to': '#ebf2f9',
    '--border': '#d7e3f0',
    '--chip-bg': '#ffffff',
    '--chip-border': '#dfe8f4',
    '--btn-neutral-bg': '#e8f0f8',
    '--btn-neutral-text': '#18202a',
    '--btn-primary-from': '#b3e5fc',
    '--btn-primary-to': '#c7d2fe',
    '--btn-primary-border': '#9cc6de',
  },

  slate_storm: {
    '--bg': '#0e1116',
    '--text': '#e8eef8',
    '--surface-from': '#151a22',
    '--surface-to': '#10151d',
    '--border': '#273246',
    '--chip-bg': '#141a23',
    '--chip-border': '#2c3a52',
    '--btn-neutral-bg': '#1f2632',
    '--btn-neutral-text': '#e8eef8',
    '--btn-primary-from': '#6ddcc9',
    '--btn-primary-to': '#8ab4ff',
    '--btn-primary-border': '#2d4e82',
  },
};

/** Apply vars to :root so body background also changes */
function applyThemeVars(themeKey) {
  const key = normalizeThemeKey(themeKey);
  const vars = THEME_VARS[key] || THEME_VARS.midnight;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export default function PublicPage() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          // NOTE: theme is fetched here
          'slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,facebook,instagram,tiktok,x,avatar_path,other_info,theme'
        )
        .ilike('slug', slug)
        .maybeSingle();

      if (error) console.error(error);
      if (!data) setNotFound(true);
      else setP(data);
    };
    load();
  }, [slug]);

  // Whenever profile or theme changes, apply theme to the whole page
  useEffect(() => {
    if (p?.theme) applyThemeVars(p.theme);
  }, [p?.theme]);

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

  if (notFound) return <div style={pageWrapStyle}><p>This page doesn’t exist yet.</p></div>;
  if (!p) return <div style={pageWrapStyle}><p>Loading…</p></div>;

  const callHref = p?.phone ? `tel:${p.phone.replace(/\s+/g, '')}` : null;
  const waHref = p?.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, '')}` : null;
  const avatarUrl = publicUrlFor(p?.avatar_path);

  // Social links (show only if present)
  const fb = normalizeSocial('facebook', p?.facebook);
  const ig = normalizeSocial('instagram', p?.instagram);
  const tk = normalizeSocial('tiktok', p?.tiktok);
  const xx = normalizeSocial('x', p?.x);

  // --- Share handler ---
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
      {/* Ensure body uses the theme background & text */}
      <style>{`
        body { background: var(--bg); color: var(--text); }
        /* Mobile-only header sizing tweaks (avatar + buttons) */
        @media (max-width: 480px) {
          .tp-header-card { padding: 10px 12px; gap: 8px; }
          .tp-header-left { gap: 8px; }
          .tp-avatar-in   { width: 40px !important; height: 40px !important; border-radius: 12px !important; }
          .tp-title       { font-size: 18px !important; line-height: 22px !important; }
          .tp-sub         { font-size: 12px !important; opacity: .8 !important; }

          .tp-ctas { width: 100%; gap: 6px; }
          .tp-ctas .tp-btn {
            padding: 8px 10px !important;
            border-radius: 10px !important;
            font-size: 13px !important;
            line-height: 1 !important;
          }
        }

        /* Content grid: 1 col on mobile, 2 cols desktop */
        .tp-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
        @media (min-width: 820px) { .tp-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* HEADER CARD (avatar inside) */}
      <div className="tp-header-card" style={headerCardStyle}>
        <div className="tp-header-left" style={headerLeftStyle}>
          {avatarUrl ? (
            <img
              className="tp-avatar-in"
              src={avatarUrl}
              alt={`${p.name || p.slug} logo`}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                objectFit: 'cover',
                border: '1px solid var(--border)',
                background: 'var(--surface-to)',
              }}
            />
          ) : (
            <div className="tp-avatar-in" style={logoDotStyle}>★</div>
          )}

          <div>
            <div className="tp-title" style={headerNameStyle}>{p.name || p.slug}</div>
            <div className="tp-sub" style={headerSubStyle}>
              {[p.trade, p.city].filter(Boolean).join(' • ')}
            </div>
          </div>
        </div>

        <div className="tp-ctas" style={ctaRowStyle}>
          {callHref && (
            <a className="tp-btn" href={callHref} style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>
              Call
            </a>
          )}
          {waHref && (
            <a className="tp-btn" href={waHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
              WhatsApp
            </a>
          )}
          <button
            className="tp-btn"
            type="button"
            onClick={handleShare}
            style={{
              ...btnBaseStyle,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* SOCIAL BAR */}
      {(fb || ig || tk || xx) && (
        <div style={socialBarWrapStyle}>
          {fb && <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" style={socialBtnStyle}><span style={socialGlyphStyle}>f</span></a>}
          {ig && <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style={socialBtnStyle}><span style={socialGlyphStyle}>IG</span></a>}
          {tk && <a href={tk} target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok" style={socialBtnStyle}><span style={socialGlyphStyle}>t</span></a>}
          {xx && <a href={xx} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)" style={socialBtnStyle}><span style={socialGlyphStyle}>X</span></a>}
        </div>
      )}

      {/* CONTENT GRID */}
      <div className="tp-grid">
        <Card title="About">
          <p style={{ marginTop: 0, marginBottom: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5 }}>
            {p.about && p.about.trim().length > 0
              ? p.about
              : (services[0]
                  ? `${services[0]}. Reliable, friendly and affordable. Free quotes, no hidden fees.`
                  : 'Reliable, friendly and affordable. Free quotes, no hidden fees.')}
          </p>
        </Card>

        <Card title="Prices">
          <ul style={listResetStyle}>
            {priceLines.length === 0 && <li style={{ opacity: 0.7 }}>Please ask for a quote.</li>}
            {priceLines.map((ln, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span>{ln}</span>
              </li>
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

        {p.other_info && p.other_info.trim().length > 0 && (
          <Card title="Other useful information" wide>
            <p style={{ marginTop: 0, marginBottom: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5, opacity: 0.95 }}>
              {p.other_info}
            </p>
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

/* ---------- Components ---------- */
function Card({ title, wide = false, children }) {
  return (
    <section style={{ ...cardStyle, gridColumn: wide ? '1 / -1' : 'auto' }}>
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

/* ---------- Styles (now use CSS variables) ---------- */
const pageWrapStyle = {
  maxWidth: 980,
  margin: '28px auto',
  padding: '8px 16px 48px',
  color: 'var(--text)',
  background: 'var(--bg)',
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
  background: 'linear-gradient(180deg,var(--surface-from),var(--surface-to))',
  marginBottom: 8,
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

const headerNameStyle = {
  fontWeight: 800,
  fontSize: 'clamp(18px, 5vw, 22px)',
  lineHeight: '24px',
};

const headerSubStyle = {
  opacity: 0.8,
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  marginTop: 4,
};

const ctaRowStyle = { display: 'flex', gap: 8, flexWrap: 'wrap' };

const btnBaseStyle = {
  padding: 'clamp(6px, 1.2vw, 10px) clamp(10px, 2.4vw, 16px)',
  borderRadius: 10,
  border: '1px solid #2f3c4f', // overridden for outline button
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: 'clamp(12px, 3.2vw, 14px)',
  cursor: 'pointer',
  color: 'var(--text)',
};

const btnPrimaryStyle = {
  background: 'linear-gradient(135deg,var(--btn-primary-from),var(--btn-primary-to))',
  color: '#08101e',
  border: '1px solid var(--btn-primary-border)',
};

const btnNeutralStyle = {
  background: 'var(--btn-neutral-bg)',
  color: 'var(--btn-neutral-text)',
};

const h2Style = { margin: '0 0 10px 0', fontSize: 18 };
const cardStyle = {
  padding: 16,
  borderRadius: 16,
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--surface-from),var(--surface-to))',
  minWidth: 0,
  color: 'var(--text)',
};

const chipStyle = {
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid var(--chip-border)',
  background: 'var(--chip-bg)',
  color: 'var(--text)',
  fontSize: 13,
};

const tagStyle = {
  fontSize: 12,
  padding: '2px 8px',
  borderRadius: 999,
  border: '1px solid var(--chip-border)',
  background: 'var(--chip-bg)',
  color: 'var(--text)',
};

const listResetStyle = { margin: 0, padding: 0, listStyle: 'none' };

const galleryGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 };
const galleryItemStyle = {
  height: 220,
  borderRadius: 14,
  border: '1px solid var(--chip-border)',
  background: 'var(--surface-to)',
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
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  outline: 'none',
  transition: 'transform 120ms ease, background 120ms ease, border-color 120ms ease',
};

const socialGlyphStyle = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 0.2,
  lineHeight: 1,
  translate: '0 0',
};
