'use client';

import { useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

/* ---------- helpers ---------- */
const toList = (v) => String(v ?? '').split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
const normalizeSocial = (t, raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, '');
  return t === 'facebook'  ? `https://facebook.com/${h}`
       : t === 'instagram' ? `https://instagram.com/${h}`
       : t === 'tiktok'    ? `https://www.tiktok.com/@${h}`
       : t === 'x'         ? `https://x.com/${h}`
       : null;
};
const normalizeYouTube = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, '');        // allow @handle
  return `https://www.youtube.com/@${h}`;
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
const ALIAS = {
  'midnight':'deep-navy','cocoa-bronze':'graphite-ember','cocoa bronze':'graphite-ember',
  'ivory-sand':'paper-snow','ivory sand':'paper-snow','glacier-mist':'cloud-blue','glacier mist':'cloud-blue',
};
const normalizeThemeKey = (raw) => {
  const k = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return THEMES[k] ? k : (ALIAS[k] || 'deep-navy');
};
const applyTheme = (key) => {
  const vars = THEMES[key] || THEMES['deep-navy'];
  const r = document.documentElement;
  for (const [cssVar, val] of Object.entries(vars)) r.style.setProperty(cssVar, val);
};

/* make a tel: href from phone or whatsapp */
const getDialHref = (p) => {
  const raw = p?.phone ?? p?.tel ?? p?.whatsapp ?? '';
  const cleaned = String(raw).replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');
  return digits.length >= 6 ? `tel:${cleaned}` : null;
};

export default function PublicPage({ profile: p }) {
  // theme
  useEffect(() => { if (p?.theme !== undefined) applyTheme(normalizeThemeKey(p.theme)); }, [p?.theme]);

  // build fields
  const areas      = useMemo(() => toList(p?.areas), [p]);
  const services   = useMemo(() => toList(p?.services), [p]);
  const priceLines = useMemo(
    () => String(p?.prices ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    [p]
  );

  const callHref = getDialHref(p);
  const waHref   = p?.whatsapp ? `https://wa.me/${String(p.whatsapp).replace(/\D/g, '')}` : null;

  // public avatar URL from storage
  const avatarUrl = p?.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${encodeURIComponent(p.avatar_path)}`
    : null;

  // Build a Maps link that prefers an explicit URL; else use the address ONLY
  const mapsHref = useMemo(() => {
    const explicit = String(p?.location_url || '').trim();
    if (explicit && /^https?:\/\//i.test(explicit)) return explicit;

    const addr = String(p?.location || '').trim();
    if (!addr) return null;

    // Search by the exact address the user entered (no business name)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  }, [p?.location_url, p?.location]);

  // Gallery public URLs from the "gallery" bucket
  const galleryUrls = useMemo(() => {
    const arr = Array.isArray(p?.gallery) ? p.gallery : [];
    return arr
      .map(path => supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl)
      .filter(Boolean);
  }, [p]);

  const fb = normalizeSocial('facebook',  p?.facebook);
  const ig = normalizeSocial('instagram', p?.instagram);
  const tk = normalizeSocial('tiktok',    p?.tiktok);
  const xx = normalizeSocial('x',         p?.x);
  const yt = normalizeYouTube(p?.youtube);

  const handleShare = () => {
    const url = window.location.href;
    const title = document.title || 'TradePage';
    if (navigator.share) navigator.share({ title, url }).catch(() => {});
    else {
      try {
        navigator.clipboard.writeText(url).then(
          () => alert('Link copied to clipboard'),
          () => window.prompt('Copy this link:', url)
        );
      } catch { window.prompt('Copy this link:', url); }
    }
  };

  return (
    <div style={pageWrapStyle}>
      <style>{`
        :root { background: var(--bg); color: var(--text); }
        html,body { background: var(--bg); color: var(--text); }
        @media (max-width:480px){
          .hdr-name{ font-size:16px; line-height:20px; }
          .hdr-sub{ font-size:12px; }
          .hdr-cta a, .hdr-cta button{ padding:6px 10px; border-radius:10px; font-size:12px; }
          .hdr-cta{ gap:8px; }
        }

        /* ---- Responsive gallery ---- */
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr;       /* mobile: single, full width */
          gap: 16px;
        }
        @media (min-width: 700px) {
          .gallery-grid { grid-template-columns: 1fr 1fr; } /* tablet: 2 cols */
        }
        @media (min-width: 1024px) {
          .gallery-grid { grid-template-columns: 1fr 1fr 1fr; } /* desktop: 3 cols */
        }
        .gallery-item {
          border-radius: 14px;
          border: 1px solid var(--chip-border);
          background: var(--chip-bg);
          overflow: hidden;
        }
        .gallery-item img {
          width: 100%;
          height: auto;         /* mobile/tablet: natural height */
          display: block;
          border-radius: 14px;
        }
        /* On larger screens, unify card heights */
        @media (min-width: 1024px) {
          .gallery-item { height: 220px; }
          .gallery-item img { height: 100%; object-fit: cover; }
        }
      `}</style>

      {/* HEADER */}
      <div style={headerCardStyle}>
        <div style={headerLeftStyle}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${p.name || p.slug} logo`}
              style={{
                width:48, height:48, borderRadius:14, objectFit:'cover',
                border:'1px solid var(--border)', background:'var(--card-bg-2)'
              }}
            />
          ) : (
            <div style={logoDotStyle}>★</div>
          )}
          <div>
            <div className="hdr-name" style={headerNameStyle}>{p.name || p.slug}</div>
            <div className="hdr-sub"  style={headerSubStyle}>{[p.trade, p.city].filter(Boolean).join(' • ')}</div>
          </div>
        </div>

        <div className="hdr-cta" style={ctaRowStyle}>
          {callHref && <a href={callHref} style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>Call</a>}
          {waHref   && <a href={waHref}  style={{ ...btnBaseStyle, ...btnNeutralStyle }}>WhatsApp</a>}
          <button
            type="button"
            onClick={handleShare}
            style={{ ...btnBaseStyle, border:'1px solid var(--social-border)', background:'transparent', color:'var(--text)' }}
          >
            Share
          </button>
        </div>
      </div>

      {/* SOCIAL */}
      {(fb || ig || tk || xx || yt) && (
        <div style={socialBarWrapStyle}>
          {fb && <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook"  title="Facebook"  style={socialBtnStyle}><span style={socialGlyphStyle}>f</span></a>}
          {ig && <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style={socialBtnStyle}><span style={socialGlyphStyle}>IG</span></a>}
          {tk && <a href={tk} target="_blank" rel="noopener noreferrer" aria-label="TikTok"    title="TikTok"    style={socialBtnStyle}><span style={socialGlyphStyle}>t</span></a>}
          {xx && <a href={xx} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)" style={socialBtnStyle}><span style={socialGlyphStyle}>X</span></a>}
          {yt &&  <a href={yt}  target="_blank" rel="noopener noreferrer" aria-label="YouTube"  title="YouTube"  style={socialBtnStyle}><span style={socialGlyphStyle}>YT</span></a>}
        </div>
      )}

      {/* GRID */}
      <div style={grid2Style}>
        <Card title="About">
          <p style={bodyP}>
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
              {areas.map((a, i) => (<span key={i} style={chipStyle}>{a}</span>))}
            </div>
          ) : (<div style={{ opacity: 0.7 }}>No areas listed yet.</div>)}
        </Card>

        <Card title="Services">
          {services.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {services.map((s, i) => (<span key={i} style={chipStyle}>{s}</span>))}
            </div>
          ) : (<div style={{ opacity: 0.7 }}>No services listed yet.</div>)}
        </Card>

        <Card title="Hours"><div style={{ opacity: 0.9 }}>{p.hours || 'Mon–Sat 08:00–18:00'}</div></Card>

        {/* LOCATION (optional block) */}
        {(p?.location || p?.location_url) && (
          <Card title="Location">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
              {/* only show address text if provided */}
              {p?.location ? (
                <div style={{ opacity: 0.95 }}>{p.location}</div>
              ) : <div />}

              {/* show button only when we have a URL */}
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnBaseStyle, ...btnNeutralStyle }}
                >
                  Open in Maps
                </a>
              )}
            </div>
          </Card>
        )}

        {p.other_info && p.other_info.trim().length > 0 && (
          <Card title="Other useful information" wide>
            <p style={{ ...bodyP, opacity: 0.95 }}>{p.other_info}</p>
          </Card>
        )}

        {/* GALLERY */}
        <Card title="Gallery" wide>
          {galleryUrls.length ? (
            <div className="gallery-grid" style={galleryGridStyle}>
              {galleryUrls.map((src, i) => (
                <div key={i} className="gallery-item" style={galleryItemStyle}>
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-grid" style={galleryGridStyle}>
              <div className="gallery-item" style={galleryItemStyle}><div style={imgPlaceholderStyle}>work photo</div></div>
              <div className="gallery-item" style={galleryItemStyle}><div style={imgPlaceholderStyle}>work photo</div></div>
              <div className="gallery-item" style={galleryItemStyle}><div style={imgPlaceholderStyle}>work photo</div></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- components & styles ---------- */
function Card({ title, wide=false, children }) {
  return (
    <section style={{ ...cardStyle, gridColumn: wide ? '1 / -1' : 'auto' }}>
      {title && <h2 style={h2Style}>{title}</h2>}
      {children}
    </section>
  );
}

const pageWrapStyle = { maxWidth: 980, margin: '28px auto', padding: '0 16px 48px', color: 'var(--text)', background: 'var(--bg)', overflowX: 'hidden' };

const headerCardStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 16, padding: '16px 18px', borderRadius: 16,
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))',
  marginBottom: 12,
};
const headerLeftStyle = { display: 'flex', alignItems: 'center', gap: 12 };
const logoDotStyle = { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn-primary-1)', color: '#0a0f1c', fontWeight: 800, fontSize: 20 };
const headerNameStyle = { fontWeight: 800, fontSize: 22, lineHeight: '24px' };
const headerSubStyle  = { opacity: 0.75, fontSize: 14, marginTop: 4 };
const ctaRowStyle     = { display: 'flex', gap: 10, flexWrap: 'wrap' };

const socialBarWrapStyle = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '0 0 12px 0' };
const socialBtnStyle = { width: 36, height: 36, borderRadius: 999, border: '1px solid var(--social-border)', background: 'transparent', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', outline: 'none' };
const socialGlyphStyle = { fontSize: 13, fontWeight: 800, letterSpacing: 0.2, lineHeight: 1, translate: '0 0' };

const btnBaseStyle = { padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' };
const btnPrimaryStyle = { background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))', color: '#08101e', border: '1px solid var(--border)' };
const btnNeutralStyle = { background: 'var(--btn-neutral-bg)', color: 'var(--text)' };

const h2Style = { margin: '0 0 10px 0', fontSize: 18 };
const cardStyle = { padding: 16, borderRadius: 16, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))', minWidth: 0 };

const grid2Style = { display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 };
const bodyP = { marginTop: 0, marginBottom: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5 };

const chipStyle = { padding: '6px 12px', borderRadius: 999, border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--text)', fontSize: 13 };
const listResetStyle = { margin: 0, padding: 0, listStyle: 'none' };

/* NOTE: columns/height now controlled by CSS classes above */
const galleryGridStyle = { display: 'grid', gap: 16 };
const galleryItemStyle = { borderRadius: 14, border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', overflow: 'hidden' };
const imgPlaceholderStyle = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.75 };
