'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Script from 'next/script'; // kept, even though not required, to avoid changing imports

/** Small helper: turn any value into a clean list of strings */
const toList = (value) =>
  String(value ?? '') // safe coerce (handles numbers/null/undefined)
    .split(/[,\n]+/)  // commas OR new lines
    .map((s) => s.trim())
    .filter(Boolean);
// Build a public URL from a storage path in the 'avatars' bucket
const publicUrlFor = (path) =>
  path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;

export default function PublicPage() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,avatar_path')
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

  if (notFound) return <div style={pageWrapStyle}><p>This page doesn’t exist yet.</p></div>;
  if (!p) return <div style={pageWrapStyle}><p>Loading…</p></div>;

  const callHref = p?.phone ? `tel:${p.phone.replace(/\s+/g, '')}` : null;
  const waHref = p?.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, '')}` : null;
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

      {/* GRID */}
      <div style={grid2Style}>
        {/* About = text only, wraps properly */}
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

        {/* Gallery */}
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
  marginBottom: 20,
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
  fontWeight: 700,
};
const btnPrimaryStyle = {
  background: 'linear-gradient(135deg,#66e0b9,#8ab4ff)',
  color: '#08101e',
  border: '1px solid #2d4e82',
};
const btnNeutralStyle = {
  background: '#1f2937',
  color: '#ffffff',
};

const h2Style = { margin: '0 0 10px 0', fontSize: 18 };
const cardStyle = {
  padding: 16,
  borderRadius: 16,
  border: '1px solid #183153',
  background: 'linear-gradient(180deg,#0f213a,#0b1524)',
  minWidth: 0, // important so long content can wrap inside grid
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
