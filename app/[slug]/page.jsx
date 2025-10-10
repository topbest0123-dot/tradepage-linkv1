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
          .select('slug,name,trade,city,phone,whatsapp,facebook,instagram,tiktok,x,about,prices')
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

  return (
    <div style={{ padding: 16, color: '#eaf2ff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ opacity: 0.9, marginBottom: 12 }}>
        <strong>Route OK</strong> — slug: <strong>{String(slug)}</strong>
      </div>

      {loading && <div style={{ opacity: 0.7 }}>Loading…</div>}
      {err && <div style={{ color: '#f88' }}>Error: {err}</div>}
      {!loading && !err && !row && <div>No profile found.</div>}

      {row && (
        <>
          {/* Header card */}
          <div
            style={{
              border: '1px solid #183153',
              background: 'linear-gradient(180deg,#0f213a,#0b1524)',
              borderRadius: 12,
              padding: 14,
              maxWidth: 720
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800 }}>{row.name || row.slug}</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>
              {[row.trade, row.city].filter(Boolean).join(' • ')}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {callHref && (
                <a
                  href={callHref}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #2d4e82',
                    background: 'linear-gradient(135deg,#66e0b9,#8ab4ff)',
                    color: '#08101e',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Call
                </a>
              )}
              {waHref && (
                <a
                  href={waHref}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #2f3c4f',
                    background: '#1f2937',
                    color: '#fff',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  WhatsApp
                </a>
              )}
            </div>

            {(fb || ig || tk || xx) && (
              <ul style={{ marginTop: 12, paddingLeft: 18, opacity: 0.95 }}>
                {fb && <li><a href={fb} target="_blank" rel="noopener noreferrer">Facebook</a></li>}
                {ig && <li><a href={ig} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
                {tk && <li><a href={tk} target="_blank" rel="noopener noreferrer">TikTok</a></li>}
                {xx && <li><a href={xx} target="_blank" rel="noopener noreferrer">X (Twitter)</a></li>}
              </ul>
            )}
          </div>

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
        </>
      )}
    </div>
  );
}
