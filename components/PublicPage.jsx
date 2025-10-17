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
  const h = v.replace(/^@/, '');
  return `https://www.youtube.com/@${h}`;
};

/* --- Social SVG icons (inherit currentColor) --- */
const ICONS = {
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4v1.8h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm6-2.8a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.7z"/>
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
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.9 4.4 12 4.4 12 4.4s-6.9 0-8.5.5A3 3 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5A3 3 0 0 0 22.6 17c.4-1.6.4-5 .4-5zM10 15.5v-7l6 3.5-6 3.5z"/>
    </svg>
  ),
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
  'amber-carbon':   {'--bg':'#0d0b07','--text':'#fff7e6','--muted':'#f3d5a6','--border':'#4a3b17','--card-bg-1':'#1a150d','--card-bg-2':'#120f0a','--chip-bg':'#17120c','--chip-border':'#5c4a1a','--btn-primary-1':'#f5b04c','--btn-primary-2':'#38e1b9','--btn-neutral-bg':'#1b1712','--social-border':'#5a481b'},
  'crimson-violet': {'--bg':'#0d0610','--text':'#ffeef7','--muted':'#f5c1da','--border':'#452342','--card-bg-1':'#1a0d22','--card-bg-2':'#130919','--chip-bg':'#150b1d','--chip-border':'#5a2c58','--btn-primary-1':'#ff6aa3','--btn-primary-2':'#b07bff','--btn-neutral-bg':'#1e1524','--social-border':'#553060'},
  'pine-copper':    {'--bg':'#070d0a','--text':'#e9fff6','--muted':'#c2ecd9','--border':'#1d3f33','--card-bg-1':'#0d221b','--card-bg-2':'#091712','--chip-bg':'#0b1d17','--chip-border':'#2a5b49','--btn-primary-1':'#2fe39a','--btn-primary-2':'#ffb072','--btn-neutral-bg':'#0f1a15','--social-border':'#255646'},
  'cobalt-sunset':  {'--bg':'#050b16','--text':'#e9f2ff','--muted':'#b8ccff','--border':'#1a355e','--card-bg-1':'#0b1c33','--card-bg-2':'#081326','--chip-bg':'#0a182a','--chip-border':'#274a7a','--btn-primary-1':'#6aa6ff','--btn-primary-2':'#ff8e6b','--btn-neutral-bg':'#0f1a28','--social-border':'#254a78'},
  'pearl-latte':    {'--bg':'#fffaf3','--text':'#191512','--muted':'#6e655e','--border':'#eadfcd','--card-bg-1':'#ffffff','--card-bg-2':'#f6efe3','--chip-bg':'#f4ede2','--chip-border':'#eadfcd','--btn-primary-1':'#c18f5a','--btn-primary-2':'#59c9a9','--btn-neutral-bg':'#efe6da','--social-border':'#e1d6c4'},
  'icy-lilac':      {'--bg':'#fbf7ff','--text':'#121018','--muted':'#6c6880','--border':'#e2d9fa','--card-bg-1':'#ffffff','--card-bg-2':'#f5f1ff','--chip-bg':'#f3efff','--chip-border':'#e2d9fa','--btn-primary-1':'#9f87ff','--btn-primary-2':'#7adfff','--btn-neutral-bg':'#efeafc','--social-border':'#ddd3fa'},
  'citrus-cream':   {'--bg':'#fffef6','--text':'#0f1208','--muted':'#6a6f57','--border':'#ece7c9','--card-bg-1':'#ffffff','--card-bg-2':'#faf7e3','--chip-bg':'#f6f3de','--chip-border':'#ece7c9','--btn-primary-1':'#ffb84d','--btn-primary-2':'#79e66f','--btn-neutral-bg':'#f0eddc','--social-border':'#e6e0c6'},
  'sunset-apricot':  {'--bg':'#0f0b09','--text':'#fff4ec','--muted':'#ffd9c2','--border':'#3a2a22','--card-bg-1':'#2a1b16','--card-bg-2':'#1a120e','--chip-bg':'#231611','--chip-border':'#4a3329','--btn-primary-1':'#ffb86b','--btn-primary-2':'#ff6aa2','--btn-neutral-bg':'#2b1f1a','--social-border':'#4d3a30'},
  'minted-ivory':    {'--bg':'#fbfffd','--text':'#132018','--muted':'#4d6d5e','--border':'#d7eee4','--card-bg-1':'#ffffff','--card-bg-2':'#f3fbf7','--chip-bg':'#eff9f4','--chip-border':'#d7eee4','--btn-primary-1':'#10b981','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#e7f3ed','--social-border':'#cfe7dc'},
  'citrus-cream':    {'--bg':'#fffef7','--text':'#17160f','--muted':'#6b6a55','--border':'#efe9c9','--card-bg-1':'#ffffff','--card-bg-2':'#faf6e4','--chip-bg':'#f7f3df','--chip-border':'#efe9c9','--btn-primary-1':'#f59e0b','--btn-primary-2':'#34d399','--btn-neutral-bg':'#efe9da','--social-border':'#e7dfc3'},

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
  const otherTrades = useMemo(() => toList(p?.other_trades), [p]); // ← added
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
        :root { : var(--bg); color: var(--text); }
        html,body { background: var(--bg); color: var(--text); }

        /* --- Desktop defaults --- */
        .hdr         { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .hdr-left    { display:flex; align-items:center; gap:12px; min-width:0; }
        .hdr-text    { display:flex; flex-direction:column; min-width:0; }
        .hdr-name    { font-size:22px; line-height:24px; font-weight:800; }
        .hdr-sub     { font-size:14px; opacity:.75; margin-top:4px; }
        .hdr-cta a, .hdr-cta button { height:36px; padding:0 14px; border-radius:12px; font-weight:700; }

        /* --- Gallery responsive --- */
        .gallery-grid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; }
        .gallery-item { height:220px; overflow:hidden; border-radius:14px; border:1px solid var(--chip-border); background:var(--chip-bg); }
        .gallery-item img { width:100%; height:100%; object-fit:cover; border-radius:14px; }

        /* --- Mobile tweaks --- */
        @media (max-width: 900px) {
  .hdr { display:grid; grid-template-columns:auto 1fr; grid-template-rows:auto auto auto; align-items:start; row-gap:6px; }
  .hdr-left { grid-column:1 / -1; }
  .hdr-avatar { align-self:start; margin-top:2px; }
  .hdr-name { font-size:18px; line-height:22px; }
  .hdr-sub  { font-size:12px; margin-top:2px; }

  /* === Equal-width buttons in a single row === */
  .hdr-cta{
    grid-column:1 / -1;
    display:flex;
    gap:8px;
    width:100%;
  }
  .hdr-cta a,
  .hdr-cta button{
    flex:1 1 0;          /* each takes an equal fraction */
    width:auto;          /* don’t force a fixed width */
    height:34px;
    padding:0 10px;
    border-radius:10px;
    font-size:12px;
    justify-content:center;
  }

  /* keep gallery mobile layout */
  .gallery-grid{ grid-template-columns:1fr; }
  .gallery-item{ height:auto; }
  .gallery-item img{ height:auto; display:block; }
}


  /* Gallery: single column on mobile (kept from before) */
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-item { height:auto; }
  .gallery-item img { height:auto; display:block; }
}

      `}</style>

      {/* HEADER */}
      <div className="hdr" style={headerCardStyle}>
        <div className="hdr-left" style={headerLeftStyle}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${p.name || p.slug} logo`}
              className="hdr-avatar"
              style={{
                width:48, height:48, borderRadius:14, objectFit:'cover',
                border:'1px solid var(--border)', background:'var(--card-bg-2)'
              }}
            />
          ) : (
            <div className="hdr-avatar" style={logoDotStyle}>★</div>
          )}

          <div className="hdr-text">
            <div className="hdr-name">{p.name || p.slug}</div>
            <div className="hdr-sub">{[p.trade, p.city].filter(Boolean).join(' • ')}</div>
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
    {fb && (
      <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" style={socialBtnStyle}>
        {ICONS.facebook}
      </a>
    )}
    {ig && (
      <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style={socialBtnStyle}>
        {ICONS.instagram}
      </a>
    )}
    {tk && (
      <a href={tk} target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok" style={socialBtnStyle}>
        {ICONS.tiktok}
      </a>
    )}
    {xx && (
      <a href={xx} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)" style={socialBtnStyle}>
        {ICONS.x}
      </a>
    )}
    {yt && (
      <a href={yt} target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube" style={socialBtnStyle}>
        {ICONS.youtube}
      </a>
    )}
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

        {/* OTHER TRADES (optional, same look as services/areas) */}
        {otherTrades.length > 0 && (
          <Card title="Other trades">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {otherTrades.map((t, i) => (<span key={i} style={chipStyle}>{t}</span>))}
            </div>
          </Card>
        )}

        <Card title="Hours"><div style={{ opacity: 0.9 }}>{p.hours || 'Mon–Sat 08:00–18:00'}</div></Card>

        {/* LOCATION (optional block) */}
        {(p?.location || p?.location_url) && (
          <Card title="Location">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
              {p?.location ? (
                <div style={{ opacity: 0.95 }}>{p.location}</div>
              ) : <div />}
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
            <div className="gallery-grid">
              {galleryUrls.map((src, i) => (
                <div key={i} className="gallery-item">
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-grid">
              <div className="gallery-item"><div style={imgPlaceholderStyle}>work photo</div></div>
              <div className="gallery-item"><div style={imgPlaceholderStyle}>work photo</div></div>
              <div className="gallery-item"><div style={imgPlaceholderStyle}>work photo</div></div>
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
  gap: 16, padding: '16px 18px', borderRadius: 16,
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))',
  marginBottom: 12,
};
const headerLeftStyle = { gap: 12, minWidth: 0 };
const logoDotStyle = { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn-primary-1)', color: '#0a0f1c', fontWeight: 800, fontSize: 20 };
const ctaRowStyle     = { display: 'flex', gap: 10, flexWrap: 'wrap' };

const socialBarWrapStyle = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '0 0 12px 0' };
const socialBtnStyle = { width: 36, height: 36, borderRadius: 999, border: '1px solid var(--social-border)', background: 'transparent', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', outline: 'none' };
const socialGlyphStyle = { fontSize: 13, fontWeight: 800, letterSpacing: 0.2, lineHeight: 1, translate: '0 0' };

const btnBaseStyle = { padding: '0 14px', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 700, cursor: 'pointer', height: 36, display:'inline-flex', alignItems:'center' };
const btnPrimaryStyle = { background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))', color: '#08101e', border: '1px solid var(--border)' };
const btnNeutralStyle = { background: 'var(--btn-neutral-bg)', color: 'var(--text)' };

const h2Style = { margin: '0 0 10px 0', fontSize: 18 };
const cardStyle = { padding: 16, borderRadius: 16, border: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--card-bg-1),var(--card-bg-2))', minWidth: 0 };

const grid2Style = { display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 };
const bodyP = { marginTop: 0, marginBottom: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5 };

const chipStyle = { padding: '6px 12px', borderRadius: 999, border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--text)', fontSize: 13 };
const listResetStyle = { margin: 0, padding: 0, listStyle: 'none' };

const imgPlaceholderStyle = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.75 };
