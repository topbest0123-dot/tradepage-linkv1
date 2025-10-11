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

// Accept either a full URL or a path in the 'avatars' bucket
const normalizeAvatarSrc = (value) => {
  const v = String(value || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const { data } = supabase.storage.from('avatars').getPublicUrl(v);
  return data?.publicUrl || null;
};

// ---------- styles using CSS variables ----------
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

// Optional: keep a whitelist to avoid typos breaking themes
const THEMES = new Set([
  'deep-navy','ivory-ink','sandstone','porcelain-mint','ocean-teal',
  'sunset-peach','plum-noir','slate-sky','emerald-fog','charcoal-gold'
]);

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

  // apply theme to html + body
  useEffect(() => {
    const raw = (row?.theme || DEFAULT_THEME).trim();
    const theme = THEMES.has(raw) ? raw : DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
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
        /* Base tokens (fallback to deep-navy) */
        :root {
          --bg: #0b1524;
          --text: #eaf2ff;
          --border: #183153;
          --cardGradStart: #0f213a;
          --cardGradEnd:   #0b1524;
          --chipBorder: #27406e;
          --chipBg:     #0c1a2e;
          --chipText:   #d1e1ff;
          --btnNeutralBg:   #1f2937;
          --btnNeutralText: #ffffff;
          --btnPrimaryText: #08101e;
          --btnPrimaryBg:   linear-gradient(135deg,#66e0b9,#8ab4ff);
          --glyphBorder: #213a6b;
          --glyphText:   #eaf2ff;
          --avatarBg: #0b1524;
        }

        /* Theme blocks — scoped to html/body so either attribute works */
        html[data-theme="deep-navy"], body[data-theme="deep-navy"] {
          --bg:#0b1524; --text:#eaf2ff; --border:#183153;
          --cardGradStart:#0f213a; --cardGradEnd:#0b1524;
          --chipBorder:#27406e; --chipBg:#0c1a2e; --chipText:#d1e1ff;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#66e0b9,#8ab4ff);
          --glyphBorder:#213a6b; --glyphText:#eaf2ff; --avatarBg:#0b1524;
        }

        html[data-theme="ivory-ink"], body[data-theme="ivory-ink"] {
          --bg:#f9f7f2; --text:#1d2433; --border:#e6e2d9;
          --cardGradStart:#ffffff; --cardGradEnd:#f3efe7;
          --chipBorder:#ddd6c8; --chipBg:#faf7f1; --chipText:#24324a;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#08101e; --btnPrimaryBg:linear-gradient(135deg,#4dd0b5,#6aa9ff);
          --glyphBorder:#d4cfc3; --glyphText:#1d2433; --avatarBg:#ffffff;
        }

        html[data-theme="sandstone"], body[data-theme="sandstone"] {
          --bg:#171411; --text:#f7efe6; --border:#3a2f27;
          --cardGradStart:#2a221c; --cardGradEnd:#1c1713;
          --chipBorder:#4b3c32; --chipBg:#231c17; --chipText:#f1e7db;
          --btnNeutralBg:#2a2622; --btnNeutralText:#ffffff;
          --btnPrimaryText:#0d0a07; --btnPrimaryBg:linear-gradient(135deg,#f3c07a,#f0a16b);
          --glyphBorder:#4b3c32; --glyphText:#f7efe6; --avatarBg:#221c17;
        }

        html[data-theme="porcelain-mint"], body[data-theme="porcelain-mint"] {
          --bg:#f6fffb; --text:#0f1a15; --border:#cfeee3;
          --cardGradStart:#ffffff; --cardGradEnd:#eef9f4;
          --chipBorder:#c7eadf; --chipBg:#f2fcf8; --chipText:#153126;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#0d1b14; --btnPrimaryBg:linear-gradient(135deg,#7de2c3,#6cc4ff);
          --glyphBorder:#cfeee3; --glyphText:#0f1a15; --avatarBg:#ffffff;
        }

        html[data-theme="ocean-teal"], body[data-theme="ocean-teal"] {
          --bg:#0b1616; --text:#e8fffb; --border:#103a3a;
          --cardGradStart:#0f2626; --cardGradEnd:#0b1616;
          --chipBorder:#174b4b; --chipBg:#0c1b1b; --chipText:#d7fffb;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#031311; --btnPrimaryBg:linear-gradient(135deg,#68e0c2,#6fb8ff);
          --glyphBorder:#184e4e; --glyphText:#e8fffb; --avatarBg:#0f2020;
        }

        html[data-theme="sunset-peach"], body[data-theme="sunset-peach"] {
          --bg:#fff7f2; --text:#241a18; --border:#f3d7cc;
          --cardGradStart:#ffffff; --cardGradEnd:#fdebe3;
          --chipBorder:#f0c9bc; --chipBg:#fff3ec; --chipText:#2a1f1d;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#2a110d; --btnPrimaryBg:linear-gradient(135deg,#ffb199,#ffa26b);
          --glyphBorder:#efd2c7; --glyphText:#241a18; --avatarBg:#ffffff;
        }

        html[data-theme="plum-noir"], body[data-theme="plum-noir"] {
          --bg:#140b16; --text:#f3e9ff; --border:#2b1633;
          --cardGradStart:#1d0f24; --cardGradEnd:#140b16;
          --chipBorder:#3a1d45; --chipBg:#160b1a; --chipText:#efe4ff;
          --btnNeutralBg:#2a2230; --btnNeutralText:#ffffff;
          --btnPrimaryText:#180b1d; --btnPrimaryBg:linear-gradient(135deg,#c48bff,#8ea0ff);
          --glyphBorder:#3a1d45; --glyphText:#f3e9ff; --avatarBg:#1a0e1f;
        }

        html[data-theme="slate-sky"], body[data-theme="slate-sky"] {
          --bg:#0f131a; --text:#e9f2ff; --border:#1e2a3a;
          --cardGradStart:#142033; --cardGradEnd:#0f131a;
          --chipBorder:#293a52; --chipBg:#0f1723; --chipText:#d5e6ff;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#09111a; --btnPrimaryBg:linear-gradient(135deg,#7fb4ff,#7ee0d3);
          --glyphBorder:#263750; --glyphText:#e9f2ff; --avatarBg:#101724;
        }

        html[data-theme="emerald-fog"], body[data-theme="emerald-fog"] {
          --bg:#f3fbf4; --text:#132018; --border:#cde7d2;
          --cardGradStart:#ffffff; --cardGradEnd:#ebf6ee;
          --chipBorder:#c3e1c8; --chipBg:#f2faf4; --chipText:#183222;
          --btnNeutralBg:#1f2937; --btnNeutralText:#ffffff;
          --btnPrimaryText:#0d1510; --btnPrimaryBg:linear-gradient(135deg,#8de3b5,#7ad1b0);
          --glyphBorder:#cde7d2; --glyphText:#132018; --avatarBg:#ffffff;
        }

        html[data-theme="charcoal-gold"], body[data-theme="charcoal-gold"] {
          --bg:#0f0f10; --text:#f8f6ed; --border:#2b2b2d;
          --cardGradStart:#1a1a1c; --cardGradEnd:#0f0f10;
          --chipBorder:#3a3a3d; --chipBg:#121213; --chipText:#f2f0e6;
          --btnNeutralBg:#2a2a2e; --btnNeutralText:#ffffff;
          --btnPrimaryText:#1a1403; --btnPrimaryBg:linear-gradient(135deg,#f0d274,#f2b55e);
          --glyphBorder:#3a3a3d; --glyphText:#f8f6ed; --avatarBg:#141416;
        }

        /* Force page base colors to win */
        body { background: var(--bg) !important; color: var(--text) !important; }

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
                  {waHref && <a href={waHref} className="tp-btn" style={{ ...btnBaseStyle, ...btnNeutralStyle }}>WhatsApp</a>}
                </div>
              </div>

              <button type="button" className="tp-share" onClick={handleShare} style={{ ...btnBaseStyle, border: '1px solid var(--glyphBorder)', background: 'transparent', color: 'var(--text)' }}>
                Share
              </button>
            </div>
          </div>

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
