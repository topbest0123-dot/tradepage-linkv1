'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// tiny helper to turn handles into full URLs
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

// styles for sections / headings
const sectionStyle = {
  border: '1px solid #183153',
  background: 'linear-gradient(180deg,#0f213a,#0b1524)',
  borderRadius: 12,
  padding: 14,
  maxWidth: 720,
  marginTop: 14,
};
const h2Style = { margin: '0 0 10px 0', fontSize: 18, fontWeight: 800 };

// page + header/button styles
const pageWrapStyle = { maxWidth: 980, margin: '28px auto', padding: '0 16px 48px', color: '#eaf2ff', overflowX: 'hidden' };
const headerNameStyle = { fontWeight: 800, fontSize: 22, lineHeight: '24px' };
const headerSubStyle  = { opacity: 0.75, fontSize: 14, marginTop: 4 };
const headerLeftStyle = { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 };
const btnBaseStyle    = { padding: '10px 16px', borderRadius: 12, border: '1px solid #183153', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' };
const btnPrimaryStyle = { background: 'linear-gradient(135deg,#66e0b9,#8ab4ff)', color: '#08101e' };
const btnNeutralStyle = { background: '#1f2937', color: '#fff' };

// placeholder text block for empty gallery cells
const imgPlaceholderStyle = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.75,
};

// minimal Card wrapper to match the example API
function Card({ title, children/*, wide*/ }) {
  return (
    <section style={sectionStyle}>
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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      setRow(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('slug,name,trade,city,phone,whatsapp,facebook,instagram,tiktok,x,about,prices,areas,services,hours,other_info')
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

  const callHref = row?.phone ? `tel:${String(row.phone).replace(/\s+/g, '')}` : null;
  const waHref  = row?.whatsapp ? `https://wa.me/${String(row.whatsapp).replace(/\D/g, '')}` : null;

  const fb = normalizeSocial('facebook',  row?.facebook);
  const ig = normalizeSocial('instagram', row?.instagram);
  const tk = normalizeSocial('tiktok',    row?.tiktok);
  const xx = normalizeSocial('x',         row?.x);

  // prepare price lines
  const priceLines = useMemo(
    () =>
      String(row?.prices ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [row]
  );

  // parse areas
  const areas = String(row?.areas || '')
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  // parse services
  const services = String(row?.services || '')
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  // avatar (placeholder unless you add avatar_path + public URL)
  const avatarUrl = null;

  // share handler (mobile + desktop fallback)
  const handleShare = async () => {
    const shareData = {
      title: row?.name || row?.slug || 'Profile',
      text: `Check out ${row?.name || row?.slug}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } else {
        prompt('Copy this link:', shareData.url);
      }
    } catch {
      /* ignore user cancel */
    }
  };

  return (
    <div style={pageWrapStyle}>
      <style>{`
        /* hero = header card */
        .tp-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: start;
          margin: 8px 0 6px;
        }

        .tp-header {
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid #183153;
          background: linear-gradient(180deg,#0f213a,#0b1524);
        }
        .tp-cta { display:flex; gap:8px; flex-wrap:wrap; }
        .tp-cta a, .tp-cta button { font-weight:700; }

        /* inline avatar next to the heading */
        .tp-avatar-inline{
          width: 56px;
          height: 56px;
          border-radius: 14px;
          border: 1px solid #183153;
          background: #0b1524;
          object-fit: cover;
          margin-right: 12px;
          flex: 0 0 auto;
        }
        .tp-avatar-inline.is-fallback{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #63d3e0;
          font-weight: 800;
          font-size: 22px;
        }
        @media (max-width: 480px){
          .tp-avatar-inline{ width: 48px; height: 48px; }
        }

        /* social icon row */
        .tp-social { display:flex; gap:10px; align-items:center; margin: 8px 0 14px; }
        .tp-social a {
          width: 36px; height: 36px; border-radius: 999px;
          border: 1px solid #213a6b; background: transparent; color:#eaf2ff;
          display:inline-flex; align-items:center; justify-content:center;
          text-decoration:none;
        }
        .tp-glyph { font-size: 13px; font-weight: 800; letter-spacing: .2px; }

        /* content grid (cards) */
        .tp-grid { display:grid; grid-template-columns: 1fr; gap:16px; margin-top: 6px; }

        /* Gallery: 1 col mobile, 2 col tablet, 3 col desktop (at 980px page width) */
        .tp-gallery{
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          /* prevent children from forcing extra width */
          min-width: 0;
        }
        .tp-gallery > *{
          min-width: 0;               /* critical: stops items pushing to a new row */
          box-sizing: border-box;
        }
        @media (min-width: 720px){
          .tp-gallery{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 980px){     /* match your pageWrap maxWidth */
          .tp-gallery{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        /* optional cosmetics */
        .tp-gallery .item{
          height: 220px;
          border-radius: 14px;
          border: 1px solid #27406e;
          background: #0b1627;
          overflow: hidden;
        }
        .tp-gallery .item img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 14px;
        }

        /* desktop tweaks */
        @media (min-width: 980px) {
          .tp-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {loading && <div style={{ opacity: 0.7 }}>Loading…</div>}
      {err && <div style={{ color: '#f88' }}>Error: {err}</div>}
      {!loading && !err && !row && <div>No profile found.</div>}

      {row && (
        <>
          {/* HERO: header card with inline avatar */}
          <div className="tp-hero">
            <div className="tp-header">
              <div style={headerLeftStyle}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`${row.name || row.slug} logo`} className="tp-avatar-inline" />
                ) : (
                  <div className="tp-avatar-inline is-fallback">★</div>
                )}
                <div>
                  <div style={headerNameStyle}>{row.name || row.slug}</div>
                  <div style={headerSubStyle}>
                    {[row.trade, row.city].filter(Boolean).join(' • ')}
                  </div>
                </div>
              </div>

              <div className="tp-cta">
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
                  onClick={handleShare}
                  style={{
                    ...btnBaseStyle,
                    border: '1px solid #213a6b',
                    background: 'transparent',
                    color: '#eaf2ff',
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Round social icons */}
          {(fb || ig || tk || xx) && (
            <div className="tp-social">
              {fb && (
                <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
                  <span className="tp-glyph">f</span>
                </a>
              )}
              {ig && (
                <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                  <span className="tp-glyph">IG</span>
                </a>
              )}
              {tk && (
                <a href={tk} target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok">
                  <span className="tp-glyph">t</span>
                </a>
              )}
              {xx && (
                <a href={xx} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)">
                  <span className="tp-glyph">X</span>
                </a>
              )}
            </div>
          )}

          {/* Cards grid */}
          <div className="tp-grid">
            {/* About */}
            <div style={sectionStyle}>
              <h2 style={h2Style}>About</h2>
              <p
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                }}
              >
                {row?.about?.trim()
                  ? row.about
                  : 'Reliable, friendly and affordable. Free quotes, no hidden fees.'}
              </p>
            </div>

            {/* Prices */}
            <div style={sectionStyle}>
              <h2 style={h2Style}>Prices</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {priceLines.length === 0 ? (
                  <li style={{ opacity: 0.8 }}>Please ask for a quote.</li>
                ) : (
                  priceLines.map((ln, i) => <li key={i}>{ln}</li>)
                )}
              </ul>
            </div>

            {/* Areas we cover */}
            <div style={sectionStyle}>
              <h2 style={h2Style}>Areas we cover</h2>
              {areas.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {areas.map((a, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: '1px solid #27406e',
                        background: '#0c1a2e',
                        color: '#d1e1ff',
                        fontSize: 13,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ opacity: 0.8 }}>No areas listed yet.</div>
              )}
            </div>

            {/* Services */}
            <div style={sectionStyle}>
              <h2 style={h2Style}>Services</h2>
              {services.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: '1px solid #27406e',
                        background: '#0c1a2e',
                        color: '#d1e1ff',
                        fontSize: 13,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ opacity: 0.8 }}>No services listed yet.</div>
              )}
            </div>

            {/* Hours */}
            <div style={sectionStyle}>
              <h2 style={h2Style}>Hours</h2>
              <div style={{ opacity: 0.9 }}>
                {row?.hours || 'Mon–Sat 08:00–18:00'}
              </div>
            </div>

            {/* Other useful information (optional) */}
            {(row?.other_info ?? '').trim() && (
              <div style={sectionStyle}>
                <h2 style={h2Style}>Other useful information</h2>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {row.other_info}
                </p>
              </div>
            )}

            {/* Gallery (now uses className grid and Card wrapper) */}
            <Card title="Gallery" wide>
              <div className="tp-gallery">
                <div className="item"><div style={imgPlaceholderStyle}>work photo</div></div>
                <div className="item"><div style={imgPlaceholderStyle}>work photo</div></div>
                <div className="item">
                  <img
                    src="https://images.unsplash.com/photo-1581091870673-1e7e1c1a5b1d?q=80&w=1200&auto=format&fit=crop"
                    alt="work"
                  />
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
