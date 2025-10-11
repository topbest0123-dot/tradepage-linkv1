'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// ---------- helpers ----------
function normalizeSocial(type, raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, '');
  switch (type) {
    case 'facebook':  return `https://facebook.com/${h}`;
    case 'instagram': return `https://instagram.com/${h}`;
    case 'tiktok':    return `https://www.tiktok.com/@${h}`;
    case 'x':         return `https://x.com/${h}`;
    default:          return null;
  }
}

// Avatar helper
const normalizeAvatarSrc = (value) => {
  const v = String(value || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const { data } = supabase.storage.from('avatars').getPublicUrl(v);
  return data?.publicUrl || null;
};

// Theme normalization
const normalizeTheme = (t) =>
  String(t || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');

const THEMES = new Set([
  'deep-navy',
  'porcelain-mint',
  'sandstone',
  'slate-sky',
  'forest-green',
  'amber-sunset',
  'rose-quartz',
  'ocean-blue',
  'graphite',
  'ivory-ink',
]);

const DEFAULT_THEME = 'deep-navy';

// ---------- shared styles ----------
const sectionStyle = {
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--cardGradStart),var(--cardGradEnd))',
  borderRadius: 12,
  padding: 14,
  maxWidth: 720,
  marginTop: 14,
};
const h2Style = { margin: '0 0 10px 0', fontSize: 18, fontWeight: 800 };
const pageWrapStyle = {
  maxWidth: 980,
  margin: '28px auto',
  padding: '0 16px 48px',
  color: 'var(--text)',
  overflowX: 'hidden',
};
const headerNameStyle = { fontWeight: 800, fontSize: 22, lineHeight: '24px' };
const headerSubStyle  = { opacity: 0.75, fontSize: 14, marginTop: 4 };
const headerLeftStyle = { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 };
const btnBaseStyle    = { padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' };
const btnPrimaryStyle = { background: 'var(--btnPrimaryBg)', color: 'var(--btnPrimaryText)' };
const btnNeutralStyle = { background: 'var(--btnNeutralBg)', color: 'var(--btnNeutralText)' };
const imgPlaceholderStyle = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.75 };

// Card wrapper
function Card({ title, wide = false, className, children }) {
  return (
    <section className={className} style={{ ...sectionStyle, gridColumn: wide ? '1 / -1' : 'auto' }}>
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

export default function PublicPage() {
  const { slug } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // fetch profile (only `theme`)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            slug,name,trade,city,phone,whatsapp,
            facebook,instagram,tiktok,x,
            about,prices,areas,services,hours,other_info,
            avatar_path,avatar_url,
            theme
          `)
          .eq('slug', String(slug || ''))
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

  // apply theme to <html data-theme="...">
  const themeKey = (() => {
    const raw = row?.theme ?? DEFAULT_THEME;
    const n = normalizeTheme(raw);
    return THEMES.has(n) ? n : DEFAULT_THEME;
  })();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKey);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [themeKey]);

  const callHref = row?.phone ? `tel:${String(row.phone).replace(/\s+/g, '')}` : null;
  const waHref  = row?.whatsapp ? `https://wa.me/${String(row.whatsapp).replace(/\D/g, '')}` : null;
  const fb = normalizeSocial('facebook',  row?.facebook);
  const ig = normalizeSocial('instagram', row?.instagram);
  const tk = normalizeSocial('tiktok',    row?.tiktok);
  const xx = normalizeSocial('x',         row?.x);
  const priceLines = useMemo(() =>
    String(row?.prices ?? '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean), [row]);
  const areas = String(row?.areas || '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  const services = String(row?.services || '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  const avatarSrc = normalizeAvatarSrc(row?.avatar_path || row?.avatar_url);

  const handleShare = async () => {
    const shareData = {
      title: row?.name || row?.slug || 'Profile',
      text: `Check out ${row?.name || row?.slug}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } else prompt('Copy this link:', shareData.url);
    } catch {}
  };

  return (
    <div style={pageWrapStyle}>
      {/* THEME TOKENS (10 full themes, all like Porcelain Mint) */}
      <style>{`
        body { background: var(--bg); color: var(--text); }
        [data-theme="deep-navy"] {
          --bg:#0b1524;--text:#eaf2ff;--border:#183153;--cardGradStart:#0f213a;--cardGradEnd:#0b1524;
          --chipBorder:#27406e;--chipBg:#0c1a2e;--chipText:#d1e1ff;
          --btnNeutralBg:#1f2937;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#66e0b9,#8ab4ff);
          --glyphBorder:#213a6b;--glyphText:#eaf2ff;--avatarBg:#0b1524;
        }
        [data-theme="porcelain-mint"] {
          --bg:#f5faf7;--text:#18212f;--border:#cfe7de;--cardGradStart:#ffffff;--cardGradEnd:#eef7f2;
          --chipBorder:#c6e1d7;--chipBg:#f3fbf7;--chipText:#1f2b3a;
          --btnNeutralBg:#1f2937;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#53e6c0,#8dbdff);
          --glyphBorder:#cfe7de;--glyphText:#18212f;--avatarBg:#ffffff;
        }
        [data-theme="sandstone"] {
          --bg:#f6f1ea;--text:#1f2430;--border:#e2d6c7;--cardGradStart:#fff;--cardGradEnd:#f2e9de;
          --chipBorder:#e2d6c7;--chipBg:#fbf6ee;--chipText:#273248;
          --btnNeutralBg:#303644;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#ffd47a,#ffaf8b);
          --glyphBorder:#e2d6c7;--glyphText:#1f2430;--avatarBg:#fff;
        }
        [data-theme="slate-sky"] {
          --bg:#0f1623;--text:#e7f0ff;--border:#203052;--cardGradStart:#121b2b;--cardGradEnd:#0f1623;
          --chipBorder:#314569;--chipBg:#101b2e;--chipText:#d6e6ff;
          --btnNeutralBg:#273248;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#5ed0ff,#a6b4ff);
          --glyphBorder:#203052;--glyphText:#e7f0ff;--avatarBg:#0f1623;
        }
        [data-theme="forest-green"] {
          --bg:#0f1a14;--text:#e7ffee;--border:#1e3b2e;--cardGradStart:#14251d;--cardGradEnd:#0f1a14;
          --chipBorder:#2a5b45;--chipBg:#0f2018;--chipText:#d6ffe5;
          --btnNeutralBg:#21302a;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#6af2a8,#a6ffcc);
          --glyphBorder:#1e3b2e;--glyphText:#e7ffee;--avatarBg:#0f1a14;
        }
        [data-theme="amber-sunset"] {
          --bg:#1e1410;--text:#fff3e6;--border:#4a2a1e;--cardGradStart:#2a1a13;--cardGradEnd:#1e1410;
          --chipBorder:#5a3525;--chipBg:#221711;--chipText:#ffe7cf;
          --btnNeutralBg:#2f2a26;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#ffbe70,#ff8870);
          --glyphBorder:#4a2a1e;--glyphText:#fff3e6;--avatarBg:#1e1410;
        }
        [data-theme="rose-quartz"] {
          --bg:#faf6f7;--text:#221d23;--border:#eedbe0;--cardGradStart:#fff;--cardGradEnd:#f6ecef;
          --chipBorder:#e8d2da;--chipBg:#fcf5f7;--chipText:#2a2230;
          --btnNeutralBg:#2f2a33;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#ffb5d1,#b7b2ff);
          --glyphBorder:#e8d2da;--glyphText:#221d23;--avatarBg:#fff;
        }
        [data-theme="ocean-blue"] {
          --bg:#06131f;--text:#e8f4ff;--border:#16314a;--cardGradStart:#0a1d2e;--cardGradEnd:#06131f;
          --chipBorder:#234a6a;--chipBg:#0a1a28;--chipText:#d6ecff;
          --btnNeutralBg:#1e2a38;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#5ed0ff,#79ffe1);
          --glyphBorder:#16314a;--glyphText:#e8f4ff;--avatarBg:#06131f;
        }
        [data-theme="graphite"] {
          --bg:#0f1115;--text:#eef2ff;--border:#232736;--cardGradStart:#141722;--cardGradEnd:#0f1115;
          --chipBorder:#2e3550;--chipBg:#121522;--chipText:#d9e1ff;
          --btnNeutralBg:#222632;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#8ab4ff,#66e0b9);
          --glyphBorder:#232736;--glyphText:#eef2ff;--avatarBg:#0f1115;
        }
        [data-theme="ivory-ink"] {
          --bg:#f9f7f2;--text:#1d2433;--border:#e6e2d9;--cardGradStart:#fff;--cardGradEnd:#f3efe7;
          --chipBorder:#ddd6c8;--chipBg:#faf7f1;--chipText:#24324a;
          --btnNeutralBg:#1f2937;--btnNeutralText:#fff;--btnPrimaryText:#08101e;--btnPrimaryBg:linear-gradient(135deg,#4dd0b5,#6aa9ff);
          --glyphBorder:#d4cfc3;--glyphText:#1d2433;--avatarBg:#fff;
        }
      `}</style>

      {loading && <div style={{ opacity: 0.7 }}>Loading…</div>}
      {err && <div style={{ color: '#f88' }}>Error: {err}</div>}
      {!loading && !err && !row && <div>No profile found.</div>}

      {row && (
        <>
          {/* HERO */}
          <div className="tp-hero">
            <div className="tp-header">
              <div className="tp-head-top">
                <div style={headerLeftStyle}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={`${row.name || row.slug} logo`} className="tp-avatar-inline" loading="lazy" />
                  ) : (
                    <div className="tp-avatar-inline is-fallback">★</div>
                  )}
                  <div className="tp-head-titles">
                    <div style={headerNameStyle}>{row.name || row.slug}</div>
                    <div style={headerSubStyle}>
                      {[row.trade, row.city].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="tp-cta">
                  {callHref && <a href={callHref} className="tp-btn" style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>Call</a>}
                  {waHref && <a href={waHref} className="tp-btn" style={{ ...btnBaseStyle, ...btnNeutralStyle }}>WhatsApp</a>}
                </div>
              </div>

              <button
                type="button"
                className="tp-share"
                onClick={handleShare}
                style={{ ...btnBaseStyle, border: '1px solid var(--glyphBorder)', background: 'transparent', color: 'var(--text)' }}
              >
                Share
              </button>
            </div>
          </div>

          {/* Social icons */}
          {(fb || ig || tk || xx) && (
            <div className="tp-social">
              {fb && <a href={fb} target="_blank" rel="noopener noreferrer"><span className="tp-glyph">f</span></a>}
              {ig && <a href={ig} target="_blank" rel="noopener noreferrer"><span className="tp-glyph">IG</span></a>}
              {tk && <a href={tk} target="_blank" rel="noopener noreferrer"><span className="tp-glyph">t</span></a>}
              {xx && <a href={xx} target="_blank" rel="noopener noreferrer"><span className="tp-glyph">X</span></a>}
            </div>
          )}

          {/* Cards grid */}
          <div className="tp-grid">
            <div style={sectionStyle}>
              <h2 style={h2Style}>About</h2>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.5 }}>
                {row?.about?.trim() ? row.about : 'Reliable, friendly and affordable. Free quotes, no hidden fees.'}
              </p>
            </div>
            <div style={sectionStyle}>
              <h2 style={h2Style}>Prices</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {priceLines.length === 0 ? <li style={{ opacity: 0.8 }}>Please ask for a quote.</li> : priceLines.map((ln, i) => <li key={i}>{ln}</li>)}
              </ul>
            </div>
            <div style={sectionStyle}>
              <h2 style={h2Style}>Areas we cover</h2>
              {areas.length ? (
