'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// ---------- helpers ----------
function normalizeSocial(type: string, raw: unknown) {
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
const normalizeAvatarSrc = (value: unknown) => {
  const v = String(value || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v; // already a public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(v);
  return data?.publicUrl || null;
};

// ---------- design tokens via CSS vars ----------
// Every inline style below uses var(--…) so switching themes is instant.
const sectionStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--cardGradStart),var(--cardGradEnd))',
  borderRadius: 12,
  padding: 14,
  maxWidth: 720,
  marginTop: 14,
};
const h2Style: React.CSSProperties = { margin: '0 0 10px 0', fontSize: 18, fontWeight: 800 };

const pageWrapStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: '28px auto',
  padding: '0 16px 48px',
  color: 'var(--text)',
  overflowX: 'hidden',
};

const headerNameStyle: React.CSSProperties = { fontWeight: 800, fontSize: 22, lineHeight: '24px' };
const headerSubStyle:  React.CSSProperties = { opacity: 0.75, fontSize: 14, marginTop: 4 };
const headerLeftStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 };

const btnBaseStyle:    React.CSSProperties = { padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' };
const btnPrimaryStyle: React.CSSProperties = { background: 'linear-gradient(135deg,#66e0b9,#8ab4ff)', color: 'var(--btnPrimaryText)' };
const btnNeutralStyle: React.CSSProperties = { background: 'var(--btnNeutralBg)', color: 'var(--btnNeutralText)' };

const imgPlaceholderStyle: React.CSSProperties = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.75,
};

// Card wrapper — accepts className and supports wide spanning
function Card({ title, wide = false, className, children }:{
  title?: string; wide?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <section
      className={className}
      style={{ ...sectionStyle, gridColumn: wide ? '1 / -1' : 'auto' }}
    >
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

// ========== Component ==========
const DEFAULT_THEME = 'deep-navy';

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // fetch profile (NOTE: theme is selected)
  useEffect(() => {
    let cancelled = false;

    async function run() {
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
      } catch (e: any) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (slug) run();
    return () => { cancelled = true; };
  }, [slug]);

  // Apply theme to <html data-theme="…">
  useEffect(() => {
    const theme = (row?.theme || DEFAULT_THEME) as string;
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      // restore default on unmount
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
    };
  }, [row?.theme]);

  const callHref = row?.phone ? `tel:${String(row.phone).replace(/\s+/g, '')}` : null;
  const waHref  = row?.whatsapp ? `https://wa.me/${String(row.whatsapp).replace(/\D/g, '')}` : null;

  const fb = normalizeSocial('facebook',  row?.facebook);
  const ig = normalizeSocial('instagram', row?.instagram);
  const tk = normalizeSocial('tiktok',    row?.tiktok);
  const xx = normalizeSocial('x',         row?.x);

  const priceLines = useMemo(
    () =>
      String(row?.prices ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [row]
  );

  const areas = String(row?.areas || '')
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const services = String(row?.services || '')
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const avatarSrc = normalizeAvatarSrc(row?.avatar_path || row?.avatar_url);

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
    } catch { /* cancelled */ }
  };

  return (
    <div style={pageWrapStyle}>
      {/* THEME TOKENS */}
      <style>{`
        /* ---------- default + deep-navy ---------- */
        :root,
        [data-theme="deep-navy"] {
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

          --glyphBorder: #213a6b;
          --glyphText:   #eaf2ff;

          --avatarBg: #0b1524;
        }

        /* ---------- ivory-ink (light) ---------- */
        [data-theme="ivory-ink"] {
          --bg: #f9f7f2;
          --text: #1d2433;

          --border: #e6e2d9;
          --cardGradStart: #ffffff;
          --cardGradEnd:   #f3efe7;

          --chipBorder: #ddd6c8;
          --chipBg:     #faf7f1;
          --chipText:   #24324a;

          --btnNeutralBg:   #1f2937; /* keep strong contrast for CTA */
          --btnNeutralText: #ffffff;
          --btnPrimaryText: #08101e;

          --glyphBorder: #d4cfc3;
          --glyphText:   #1d2433;

          --avatarBg: #ffffff;
        }

        body { background: var(--bg); color: var(--text); }

        /* hero = header card */
        .tp-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: start;
          margin: 8px 0 6px;
        }

        .tp-header {
          display:flex; flex-direction: column; gap:10px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: linear-gradient(180deg,var(--cardGradStart),var(--cardGradEnd));
          margin-bottom: 8px;
        }

        .tp-head-top { display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; }
        .tp-cta { display:flex; gap:8px; flex-wrap:wrap; }
        .tp-cta a, .tp-cta button { font-weight:700; }

        /* inline avatar next to the heading */
        .tp-avatar-inline{
          width: 56px;
          height: 56px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--avatarBg);
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

        /* social row */
        .tp-social { display:flex; gap:10px; align-items:center; margin: 8px 0 8px; }
        .tp-social a {
          width: 36px; height: 36px; border-radius: 999px;
          border: 1px solid var(--glyphBorder);
          background: transparent; color: var(--glyphText);
          display:inline-flex; align-items:center; justify-content:center;
          text-decoration:none;
        }
        .tp-glyph { font-size: 13px; font-weight: 800; letter-spacing: .2px; }

        /* grid */
        .tp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        @media (min-width: 820px) {
          .tp-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .tp-grid > .tp-gallery-card { grid-column: 1 / -1 !important; width: 100%; }
        }
        .tp-grid > section { min-width: 0; }

        /* gallery */
        .tp-gallery { display: grid; gap: 16px; }
        @media (min-width: 820px) { .tp-gallery { grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 819.98px) { .tp-gallery { grid-template-columns: 1fr; gap: 12px; } }

        .tp-gallery .item{
          height: 220px;
          border-radius: 14px;
          border: 1px solid var(--chipBorder);
          background: var(--chipBg);
          overflow: hidden;
        }
        .tp-gallery .item img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 14px;
        }

        /* chips (areas/services) */
        .tp-chip {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid var(--chipBorder);
          background: var(--chipBg);
          color: var(--chipText);
          font-size: 13px;
        }

        /* mobile header layout */
        @media (max-width: 768px) {
          .tp-hero {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            align-items: start;
            margin-bottom: 8px;
          }

          .tp-avatar { width: 96px; height: 96px; margin: 0 auto; border-radius: 14px; overflow: hidden; transform: translateY(-6px); }
          .tp-avatar img { width: 100%; height: 100%; object-fit: cover; }

          .tp-header {
            padding: 12px 14px !important;
            border-radius: 16px;
            border: 1px solid var(--border);
            background: linear-gradient(180deg,var(--cardGradStart),var(--cardGradEnd));
          }

          .tp-head-top { display:flex; flex-direction: column; align-items:flex-start; gap: 8px; }
          .tp-head-titles { display:grid; gap:2px; }

          .tp-cta { display:flex; gap:8px; width:100%; }
          .tp-cta .tp-btn {
            flex: 1 1 0;
            min-width: 120px;
            padding: 8px 14px;
            border-radius: 12px;
            border: 1px solid var(--border);
            text-align: center;
            font-weight: 700;
            text-decoration: none;
          }

          .tp-share {
            display: block;
            width: 100%;
            height: 36px;
            margin-top: 10px;
            border-radius: 12px;
            border: 1px solid var(--glyphBorder);
            background: transparent;
            color: var(--text);
            font-weight: 700;
          }

          .tp-cta-outside, .tp-share-outside { display: none !important; }
          .tp-social { margin: 8px 0 12px 0; }
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
                  {callHref && (
                    <a href={callHref} className="tp-btn" style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>
                      Call
                    </a>
                  )}
                  {waHref && (
                    <a href={waHref} className="tp-btn" style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="tp-share"
                onClick={handleShare}
                style={{
                  ...btnBaseStyle,
                  border: '1px solid var(--glyphBorder)',
                  background: 'transparent',
                  color: 'var(--text)',
                }}
              >
                Share
              </button>
            </div>
          </div>

          {/* Social icons */}
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
                style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5 }}
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
                  priceLines.map((ln: string, i: number) => <li key={i}>{ln}</li>)
                )}
              </ul>
            </div>

            {/* Areas we cover */}
            <div style={sectionStyle}>
              <h2 style={h2Style}>Areas we cover</h2>
              {areas.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {areas.map((a, i) => (
                    <span key={i} className="tp-chip">{a}</span>
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
                    <span key={i} className="tp-chip">{s}</span>
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

            {/* Other useful information */}
            {(row?.other_info ?? '').trim() && (
              <div style={sectionStyle}>
                <h2 style={h2Style}>Other useful information</h2>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {row.other_info}
                </p>
              </div>
            )}

            {/* Gallery — span both columns */}
            <Card title="Gallery" className="tp-gallery-card" wide>
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
