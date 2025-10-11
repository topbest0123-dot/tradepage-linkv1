'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* ---------- helpers ---------- */
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

// Accept either a full URL or a path in the 'avatars' bucket
const normalizeAvatarSrc = (value) => {
  const v = String(value || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const { data } = supabase.storage.from('avatars').getPublicUrl(v);
  return data?.publicUrl || null;
};

/* ---------- theme normalization ---------- */
const THEME_KEYS = [
  'deep-navy',
  'midnight-teal',
  'royal-purple',
  'graphite-ember',
  'sapphire-ice',
  'forest-emerald',
  'paper-snow',
  'porcelain-mint',
  'linen-rose',
  'sandstone',
  'cloud-blue',
  'ivory-ink',
];
const THEME_SET = new Set(THEME_KEYS);

const ALIAS = {
  'midnight': 'deep-navy',
  'cocoa-bronze': 'graphite-ember',
  'cocoa bronze': 'graphite-ember',
  'ivory-sand': 'paper-snow',
  'ivory sand': 'paper-snow',
  'glacier-mist': 'cloud-blue',
  'glacier mist': 'cloud-blue',

  // common variations
  'porcelain mint': 'porcelain-mint',
  'forest emerald': 'forest-emerald',
  'royal purple': 'royal-purple',
  'graphite ember': 'graphite-ember',
  'sapphire ice': 'sapphire-ice',
  'paper snow': 'paper-snow',
  'linen rose': 'linen-rose',
  'cloud blue': 'cloud-blue',
  'ivory ink': 'ivory-ink',
};

function normalizeThemeKey(raw) {
  const k = String(raw ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (THEME_SET.has(k)) return k;
  if (ALIAS[k]) return ALIAS[k];
  return 'deep-navy';
}

/* ---------- styles using CSS variables ---------- */
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

const imgPlaceholderStyle = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.75,
};

// Card wrapper
function Card({ title, wide = false, className, children }) {
  return (
    <section className={className} style={{ ...sectionStyle, gridColumn: wide ? '1 / -1' : 'auto' }}>
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

const DEFAULT_THEME = 'deep-navy';

export default function PublicPage() {
  const { slug } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // fetch profile (includes theme)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      setRow(null);
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
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // apply theme to html + body with normalization & aliases
  useEffect(() => {
    const key = normalizeThemeKey(row?.theme ?? DEFAULT_THEME);
    document.documentElement.setAttribute('data-theme', key);
    document.body.setAttribute('data-theme', key);
    return () => {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    };
  }, [row?.theme]);

  // links
  const callHref = row?.phone ? `tel:${String(row.phone).replace(/\s+/g, '')}` : null;
  const waHref  = row?.whatsapp ? `https://wa.me/${String(row.whatsapp).replace(/\D/g, '')}` : null;

  const fb = normalizeSocial('facebook',  row?.facebook);
  const ig = normalizeSocial('instagram', row?.instagram);
  const tk = normalizeSocial('tiktok',    row?.tiktok);
  const xx = normalizeSocial('x',         row?.x);

  // pricing lines
  const priceLines = useMemo(
    () => String(row?.prices ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    [row]
  );

  // tags
  const areas = String(row?.areas || '').split(/[,\n]+/).map(s=>s.trim()).filter(Boolean);
  const services = String(row?.services || '').split(/[,\n]+/).map(s=>s.trim()).filter(Boolean);

  const avatarSrc = normalizeAvatarSrc(row?.avatar_path || row?.avatar_url);

  const handleShare = async () => {
    const shareData = {
      title: row?.name || row?.slug || 'Profile',
      text: `Check out ${row?.name || row?.slug}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(shareData.url); alert('Link copied to clipboard!'); }
      else { prompt('Copy this link:', shareData.url); }
    } catch {}
  };

  return (
    <div style={pageWrapStyle}>
      <style>{`
        /* Make sure page background & text always follow the active theme */
        html, body { background: var(--bg) !important; color: var(--text) !important; }

        /* ========== Theme tokens (12 themes) ========== */
        html[data-theme="deep-navy"], body[data-theme="deep-navy"] {
          --bg:#0b1524; --text:#eaf2ff; --border:#183153;
          --cardGradStart:#0f213a; --cardGradEnd:#0b1524;
          --chipBorder:#27406e; --chipBg:#0c1a2e; --chipText:#d1e1ff;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#66e0b9,#8ab4ff);
          --glyphBorder:#213a6b; --glyphText:#eaf2ff; --avatarBg:#0b1524;
        }
        html[data-theme="midnight-teal"], body[data-theme="midnight-teal"] {
          --bg:#071417; --text:#e9fbff; --border:#15444a;
          --cardGradStart:#0b2a31; --cardGradEnd:#0a1e24;
          --chipBorder:#1e5660; --chipBg:#0a2227; --chipText:#c0e9f2;
          --btnNeutralBg:#122026; --btnNeutralText:#ffffff;
          --btnPrimaryText:#031012; --btnPrimaryBg:linear-gradient(135deg,#51e1c2,#6db7ff);
          --glyphBorder:#214e56; --glyphText:#e9fbff; --avatarBg:#0a1e24;
        }
        html[data-theme="royal-purple"], body[data-theme="royal-purple"] {
          --bg:#0c0714; --text:#f0e9ff; --border:#3b2b6a;
          --cardGradStart:#1b1340; --cardGradEnd:#120e2b;
          --chipBorder:#463487; --chipBg:#160f33; --chipText:#d7c9ff;
          --btnNeutralBg:#221a3d; --btnNeutralText:#ffffff;
          --btnPrimaryText:#120e2b; --btnPrimaryBg:linear-gradient(135deg,#8f7bff,#c48bff);
          --glyphBorder:#3d2f72; --glyphText:#f0e9ff; --avatarBg:#120e2b;
        }
        html[data-theme="graphite-ember"], body[data-theme="graphite-ember"] {
          --bg:#0a0a0c; --text:#f3f3f7; --border:#34353a;
          --cardGradStart:#16171c; --cardGradEnd:#0f1013;
          --chipBorder:#383a41; --chipBg:#121317; --chipText:#d9d9e2;
          --btnNeutralBg:#1b1c21; --btnNeutralText:#ffffff;
          --btnPrimaryText:#0f1013; --btnPrimaryBg:linear-gradient(135deg,#ffb259,#ff7e6e);
          --glyphBorder:#3a3b42; --glyphText:#f3f3f7; --avatarBg:#0f1013;
        }
        html[data-theme="sapphire-ice"], body[data-theme="sapphire-ice"] {
          --bg:#051018; --text:#eaf6ff; --border:#1a3f63;
          --cardGradStart:#0b2235; --cardGradEnd:#081827;
          --chipBorder:#1f4a77; --chipBg:#0a1d2c; --chipText:#cfe6ff;
          --btnNeutralBg:#0f1b28; --btnNeutralText:#ffffff;
          --btnPrimaryText:#06131c; --btnPrimaryBg:linear-gradient(135deg,#6cd2ff,#77ffa9);
          --glyphBorder:#204a73; --glyphText:#eaf6ff; --avatarBg:#081827;
        }
        html[data-theme="forest-emerald"], body[data-theme="forest-emerald"] {
          --bg:#07130e; --text:#eafff5; --border:#1c4f3b;
          --cardGradStart:#0c2b21; --cardGradEnd:#0a1f18;
          --chipBorder:#1d5f49; --chipBg:#0a231c; --chipText:#c8f5e6;
          --btnNeutralBg:#0f1d18; --btnNeutralText:#ffffff;
          --btnPrimaryText:#06140e; --btnPrimaryBg:linear-gradient(135deg,#38e6a6,#7bd7ff);
          --glyphBorder:#215846; --glyphText:#eafff5; --avatarBg:#0a1f18;
        }
        html[data-theme="paper-snow"], body[data-theme="paper-snow"] {
          --bg:#ffffff; --text:#121417; --border:#e5e7ea;
          --cardGradStart:#ffffff; --cardGradEnd:#f7f9fb;
          --chipBorder:#e5e7ea; --chipBg:#f3f5f7; --chipText:#121417;
          --btnNeutralBg:#eef2f6; --btnNeutralText:#121417;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#3b82f6,#22c55e);
          --glyphBorder:#dfe3e8; --glyphText:#121417; --avatarBg:#ffffff;
        }
        html[data-theme="porcelain-mint"], body[data-theme="porcelain-mint"] {
          --bg:#f6fbf8; --text:#0b1b16; --border:#cfe7dc;
          --cardGradStart:#ffffff; --cardGradEnd:#f1f7f3;
          --chipBorder:#cfe7dc; --chipBg:#eef5f0; --chipText:#0b1b16;
          --btnNeutralBg:#e9f2ed; --btnNeutralText:#0b1b16;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#21c58b,#5fb9ff);
          --glyphBorder:#c7e0d4; --glyphText:#0b1b16; --avatarBg:#ffffff;
        }
        html[data-theme="linen-rose"], body[data-theme="linen-rose"] {
          --bg:#fbf7f5; --text:#221a16; --border:#eaded7;
          --cardGradStart:#ffffff; --cardGradEnd:#f6efeb;
          --chipBorder:#eaded7; --chipBg:#f2eae6; --chipText:#221a16;
          --btnNeutralBg:#efe7e3; --btnNeutralText:#221a16;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#f472b6,#60a5fa);
          --glyphBorder:#e6d9d1; --glyphText:#221a16; --avatarBg:#ffffff;
        }
        html[data-theme="sandstone"], body[data-theme="sandstone"] {
          --bg:#faf7f1; --text:#191714; --border:#eadfcd;
          --cardGradStart:#ffffff; --cardGradEnd:#f6f1e7;
          --chipBorder:#eadfcd; --chipBg:#f2ece1; --chipText:#191714;
          --btnNeutralBg:#efe9df; --btnNeutralText:#191714;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#f59e0b,#84cc16);
          --glyphBorder:#e6dac7; --glyphText:#191714; --avatarBg:#ffffff;
        }
        html[data-theme="cloud-blue"], body[data-theme="cloud-blue"] {
          --bg:#f6fbff; --text:#0e141a; --border:#d8e6f1;
          --cardGradStart:#ffffff; --cardGradEnd:#eff6fb;
          --chipBorder:#d8e6f1; --chipBg:#edf4fa; --chipText:#0e141a;
          --btnNeutralBg:#eaf2f8; --btnNeutralText:#0e141a;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#60a5fa,#34d399);
          --glyphBorder:#d3e2ee; --glyphText:#0e141a; --avatarBg:#ffffff;
        }
        html[data-theme="ivory-ink"], body[data-theme="ivory-ink"] {
          --bg:#fffdf7; --text:#101112; --border:#ebe7db;
          --cardGradStart:#ffffff; --cardGradEnd:#faf7ef;
          --chipBorder:#ebe7db; --chipBg:#f7f4ed; --chipText:#101112;
          --btnNeutralBg:#f1ede4; --btnNeutralText:#101112;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#111827,#64748b);
          --glyphBorder:#e7e2d6; --glyphText:#101112; --avatarBg:#ffffff;
        }

        /* --------- layout (unchanged) --------- */
        .tp-hero { display:grid; grid-template-columns:1fr; gap:12px; align-items:start; margin:8px 0 6px; }
        .tp-header {
          display:flex; flex-direction:column; gap:10px; padding:12px 14px;
          border-radius:16px; border:1px solid var(--border);
          background: linear-gradient(180deg,var(--cardGradStart),var(--cardGradEnd));
          margin-bottom:8px;
        }
        .tp-head-top { display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; }
        .tp-cta { display:flex; gap:8px; flex-wrap:wrap; }
        .tp-cta a, .tp-cta button { font-weight:700; }

        .tp-avatar-inline{
          width:56px; height:56px; border-radius:14px; border:1px solid var(--border);
          background:var(--avatarBg); object-fit:cover; margin-right:12px; flex:0 0 auto;
        }
        .tp-avatar-inline.is-fallback{ display:inline-flex; align-items:center; justify-content:center; color:#63d3e0; font-weight:800; font-size:22px; }
        @media (max-width:480px){ .tp-avatar-inline{ width:48px; height:48px; } }

        .tp-social { display:flex; gap:10px; align-items:center; margin:8px 0 8px; }
        .tp-social a{
          width:36px; height:36px; border-radius:999px; border:1px solid var(--glyphBorder);
          background:transparent; color:var(--glyphText); display:inline-flex; align-items:center; justify-content:center; text-decoration:none;
        }
        .tp-glyph { font-size:13px; font-weight:800; letter-spacing:.2px; }

        .tp-grid { display:grid; grid-template-columns:1fr; gap:16px; margin-top:16px; }
        @media (min-width:820px){
          .tp-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .tp-grid > .tp-gallery-card { grid-column:1 / -1 !important; width:100%; }
        }
        .tp-grid > section { min-width:0; }

        .tp-gallery { display:grid; gap:16px; }
        @media (min-width:820px){ .tp-gallery { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media (max-width:819.98px){ .tp-gallery { grid-template-columns:1fr; gap:12px; } }

        .tp-gallery .item{
          height:220px; border-radius:14px; border:1px solid var(--chipBorder); background:var(--chipBg); overflow:hidden;
        }
        .tp-gallery .item img{ width:100%; height:100%; object-fit:cover; border-radius:14px; }

        .tp-chip{
          padding:6px 12px; border-radius:999px; border:1px solid var(--chipBorder);
          background:var(--chipBg); color:var(--chipText); font-size:13px;
        }

        @media (max-width:768px){
          .tp-hero{ grid-template-columns:1fr; gap:12px; align-items:start; margin-bottom:8px; }
          .tp-header{ padding:12px 14px !important; }
          .tp-head-top{ flex-direction:column; align-items:flex-start; gap:8px; }
          .tp-head-titles{ display:grid; gap:2px; }
          .tp-cta{ gap:8px; width:100%; }
          .tp-cta .tp-btn{ flex:1 1 0; min-width:120px; padding:8px 14px; border-radius:12px; border:1px solid var(--border); text-align:center; font-weight:700; text-decoration:none; }
          .tp-share{ display:block; width:100%; height:36px; margin-top:10px; border-radius:12px; border:1px solid var(--glyphBorder); background:transparent; color:var(--text); font-weight:700; }
          .tp-cta-outside, .tp-share-outside{ display:none !important; }
          .tp-social{ margin:8px 0 12px 0; }
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
                  {waHref  && <a href={waHref}  className="tp-btn" style={{ ...btnBaseStyle, ...btnNeutralStyle }}>WhatsApp</a>}
                </div>
              </div>

              <button type="button" className="tp-share" onClick={handleShare} style={{ ...btnBaseStyle, border: '1px solid var(--glyphBorder)', background: 'transparent', color: 'var(--text)' }}>
                Share
              </button>
            </div>
          </div>

          {/* Social icons */}
          {(fb || ig || tk || xx) && (
            <div className="tp-social">
              {fb && <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><span className="tp-glyph">f</span></a>}
              {ig && <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><span className="tp-glyph">IG</span></a>}
              {tk && <a href={tk} target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok"><span className="tp-glyph">t</span></a>}
              {xx && <a href={xx} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)"><span className="tp-glyph">X</span></a>}
            </div>
          )}

          {/* Cards grid */}
          <div className="tp-grid">
            <div style={sectionStyle}>
              <h2 style={h2Style}>About</h2>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5 }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {areas.map((a, i) => (<span key={i} className="tp-chip">{a}</span>))}
                </div>
              ) : (<div style={{ opacity: 0.8 }}>No areas listed yet.</div>)}
            </div>

            <div style={sectionStyle}>
              <h2 style={h2Style}>Services</h2>
              {services.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services.map((s, i) => (<span key={i} className="tp-chip">{s}</span>))}
                </div>
              ) : (<div style={{ opacity: 0.8 }}>No services listed yet.</div>)}
            </div>

            <div style={sectionStyle}>
              <h2 style={h2Style}>Hours</h2>
              <div style={{ opacity: 0.9 }}>{row?.hours || 'Mon–Sat 08:00–18:00'}</div>
            </div>

            {(row?.other_info ?? '').trim() && (
              <div style={sectionStyle}>
                <h2 style={h2Style}>Other useful information</h2>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{row.other_info}</p>
              </div>
            )}

            <Card title="Gallery" className="tp-gallery-card" wide>
              <div className="tp-gallery">
                <div className="item"><div style={imgPlaceholderStyle}>work photo</div></div>
                <div className="item"><div style={imgPlaceholderStyle}>work photo</div></div>
                <div className="item">
                  <img src="https://images.unsplash.com/photo-1581091870673-1e7e1c1a5b1d?q=80&w=1200&auto=format&fit=crop" alt="work"/>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
