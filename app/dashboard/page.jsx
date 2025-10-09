'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* -------------------- Themes -------------------- */
const THEMES = {
  'deep-navy': {
    name: 'Deep Navy',
    vars: {
      '--bg': '#0a0f14',
      '--text': '#eaf2ff',
      '--muted': '#b8ccff',
      '--border': '#183153',
      '--card-bg-1': '#0f213a',
      '--card-bg-2': '#0b1524',
      '--chip-bg': '#0c1a2e',
      '--chip-border': '#27406e',
      '--btn-primary-1': '#66e0b9',
      '--btn-primary-2': '#8ab4ff',
      '--btn-neutral-bg': '#1f2937',
      '--social-border': '#213a6b',
    },
  },
  'midnight-teal': {
    name: 'Midnight Teal',
    vars: {
      '--bg': '#071417',
      '--text': '#e9fbff',
      '--muted': '#c0e9f2',
      '--border': '#15444a',
      '--card-bg-1': '#0b2a31',
      '--card-bg-2': '#0a1e24',
      '--chip-bg': '#0a2227',
      '--chip-border': '#1e5660',
      '--btn-primary-1': '#51e1c2',
      '--btn-primary-2': '#6db7ff',
      '--btn-neutral-bg': '#122026',
      '--social-border': '#214e56',
    },
  },
  'royal-purple': {
    name: 'Royal Purple',
    vars: {
      '--bg': '#0c0714',
      '--text': '#f0e9ff',
      '--muted': '#d7c9ff',
      '--border': '#3b2b6a',
      '--card-bg-1': '#1b1340',
      '--card-bg-2': '#120e2b',
      '--chip-bg': '#160f33',
      '--chip-border': '#463487',
      '--btn-primary-1': '#8f7bff',
      '--btn-primary-2': '#c48bff',
      '--btn-neutral-bg': '#221a3d',
      '--social-border': '#3d2f72',
    },
  },
  'forest-emerald': {
    name: 'Forest Emerald',
    vars: {
      '--bg': '#07130e',
      '--text': '#eafff5',
      '--muted': '#c8f5e6',
      '--border': '#1c4f3b',
      '--card-bg-1': '#0c2b21',
      '--card-bg-2': '#0a1f18',
      '--chip-bg': '#0a231c',
      '--chip-border': '#1d5f49',
      '--btn-primary-1': '#38e6a6',
      '--btn-primary-2': '#7bd7ff',
      '--btn-neutral-bg': '#0f1d18',
      '--social-border': '#215846',
    },
  },
  'graphite-ember': {
    name: 'Graphite Ember',
    vars: {
      '--bg': '#0a0a0c',
      '--text': '#f3f3f7',
      '--muted': '#d9d9e2',
      '--border': '#34353a',
      '--card-bg-1': '#16171c',
      '--card-bg-2': '#0f1013',
      '--chip-bg': '#121317',
      '--chip-border': '#383a41',
      '--btn-primary-1': '#ffb259',
      '--btn-primary-2': '#ff7e6e',
      '--btn-neutral-bg': '#1b1c21',
      '--social-border': '#3a3b42',
    },
  },
  'sapphire-ice': {
    name: 'Sapphire Ice',
    vars: {
      '--bg': '#051018',
      '--text': '#eaf6ff',
      '--muted': '#cfe6ff',
      '--border': '#1a3f63',
      '--card-bg-1': '#0b2235',
      '--card-bg-2': '#081827',
      '--chip-bg': '#0a1d2c',
      '--chip-border': '#1f4a77',
      '--btn-primary-1': '#6cd2ff',
      '--btn-primary-2': '#77ffa9',
      '--btn-neutral-bg': '#0f1b28',
      '--social-border': '#204a73',
    },
  },
  'cocoa-bronze': {
    name: 'Cocoa Bronze',
    vars: {
      '--bg': '#0f0b09',
      '--text': '#fff3e6',
      '--muted': '#f6dcc4',
      '--border': '#4a2e22',
      '--card-bg-1': '#211510',
      '--card-bg-2': '#170f0c',
      '--chip-bg': '#1a120f',
      '--chip-border': '#523428',
      '--btn-primary-1': '#ffb26b',
      '--btn-primary-2': '#ffd07e',
      '--btn-neutral-bg': '#241813',
      '--social-border': '#523a2e',
    },
  },
  'indigo-blush': {
    name: 'Indigo Blush',
    vars: {
      '--bg': '#0c0a13',
      '--text': '#f1eeff',
      '--muted': '#e0d6ff',
      '--border': '#2f2950',
      '--card-bg-1': '#18143a',
      '--card-bg-2': '#120f2b',
      '--chip-bg': '#130f2f',
      '--chip-border': '#3a3263',
      '--btn-primary-1': '#9ea0ff',
      '--btn-primary-2': '#ff92b0',
      '--btn-neutral-bg': '#1b173d',
      '--social-border': '#362f5a',
    },
  },
  'space-plum': {
    name: 'Space Plum',
    vars: {
      '--bg': '#0c0910',
      '--text': '#fdeeff',
      '--muted': '#f4d0ff',
      '--border': '#3b2245',
      '--card-bg-1': '#1a0f24',
      '--card-bg-2': '#120a19',
      '--chip-bg': '#150c1d',
      '--chip-border': '#4c2b5a',
      '--btn-primary-1': '#c77dff',
      '--btn-primary-2': '#72e4ff',
      '--btn-neutral-bg': '#1c1225',
      '--social-border': '#4a2c59',
    },
  },
  'ocean-umber': {
    name: 'Ocean Umber',
    vars: {
      '--bg': '#081011',
      '--text': '#e9faff',
      '--muted': '#cfeef5',
      '--border': '#254047',
      '--card-bg-1': '#0f2327',
      '--card-bg-2': '#0b191c',
      '--chip-bg': '#0c1d21',
      '--chip-border': '#2f5963',
      '--btn-primary-1': '#78d8c3',
      '--btn-primary-2': '#ffd384',
      '--btn-neutral-bg': '#0f1b1e',
      '--social-border': '#2d545e',
    },
  },
  'ink': {
    name: 'High-Contrast Ink',
    vars: {
      '--bg': '#070809',
      '--text': '#ffffff',
      '--muted': '#cfd4d9',
      '--border': '#2a2d31',
      '--card-bg-1': '#111316',
      '--card-bg-2': '#0b0d10',
      '--chip-bg': '#0e1013',
      '--chip-border': '#32353a',
      '--btn-primary-1': '#ffffff',
      '--btn-primary-2': '#9ad3ff',
      '--btn-neutral-bg': '#1a1d21',
      '--social-border': '#32363b',
    },
  },
};

const themeVarsToStyle = (themeKey) => {
  const t = THEMES[themeKey] || THEMES['deep-navy'];
  const style = {};
  Object.entries(t.vars).forEach(([k, v]) => (style[k] = v));
  return style;
};
/* ------------------------------------------------ */

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const publicUrlFor = (path) =>
    path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;

  const [form, setForm] = useState({
    slug: '',
    name: '',
    trade: '',
    city: '',
    phone: '',
    whatsapp: '',
    about: '',
    areas: '',
    services: '',
    prices: '',
    hours: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    x: '',
    avatar_path: '',
    theme: 'deep-navy', // NEW
    other_info: '',
  });

  useEffect(() => {
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      const me = u?.user;
      if (!me) {
        router.replace('/signin');
        return;
      }
      setUser(me);

      const { data, error } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,facebook,instagram,tiktok,x,avatar_path,theme,other_info')
        .eq('id', me.id)
        .maybeSingle();

      if (error) console.error(error);
      if (data) {
        setForm({
          slug: data.slug ?? '',
          name: data.name ?? '',
          trade: data.trade ?? '',
          city: data.city ?? '',
          phone: data.phone ?? '',
          whatsapp: data.whatsapp ?? '',
          about: data.about ?? '',
          areas: data.areas ?? '',
          services: data.services ?? '',
          prices: data.prices ?? '',
          hours: data.hours ?? '',
          avatar_path: data.avatar_path ?? '',
          facebook: data.facebook ?? '',
          instagram: data.instagram ?? '',
          tiktok: data.tiktok ?? '',
          x: data.x ?? '',
          theme: data.theme ?? 'deep-navy',
          other_info: data.other_info ?? '',
        });
        setAvatarUrl(publicUrlFor(data.avatar_path ?? ''));
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setMsg('');

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    setUploading(false);
    if (error) return setMsg(error.message);

    setForm((prev) => ({ ...prev, avatar_path: filePath }));
    setAvatarUrl(publicUrlFor(filePath));
    setMsg('Logo uploaded — click Save to keep it.');
  };

  const save = async () => {
    setMsg('');

    const slug = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    if (!slug) return setMsg('Please choose a slug.');

    const normalizedServices = (form.services || '')
      .replace(/\n+/g, ',')
      .replace(/,+/g, ',')
      .trim();

    const row = {
      id: user.id,
      slug,
      name: form.name,
      trade: form.trade,
      city: form.city,
      phone: form.phone,
      whatsapp: form.whatsapp,
      about: form.about,
      areas: form.areas,
      services: normalizedServices,
      prices: form.prices,
      hours: form.hours,
      facebook: form.facebook,
      instagram: form.instagram,
      tiktok: form.tiktok,
      x: form.x,
      avatar_path: form.avatar_path,
      theme: form.theme,           // NEW
      other_info: form.other_info, // keep
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
    setMsg(error ? error.message : 'Saved!');
  };

  if (loading) return <p>Loading…</p>;

  const previewHref = (() => {
    const s = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    return s ? `/${s}` : '';
  })();

  /* ---------- Small input helpers ---------- */
  const input = (label, name, placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <input
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: 12,
          width: '100%',
          maxWidth: 520,
          borderRadius: 12,
          border: '1px solid var(--chip-border)',
          background: 'var(--chip-bg)',
          color: 'var(--text)',
        }}
      />
    </label>
  );

  const textarea = (label, name, placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <textarea
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        style={{
          padding: 12,
          width: '100%',
          maxWidth: 520,
          borderRadius: 12,
          border: '1px solid var(--chip-border)',
          background: 'var(--chip-bg)',
          color: 'var(--text)',
        }}
      />
    </label>
  );

  const actionsRowStyle = { display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 };
  const btn = (style) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: '0 18px',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    cursor: 'pointer',
    ...style,
  });

  const themeStyle = themeVarsToStyle(form.theme);

  return (
    // Theme preview wrapper (sets CSS variables)
    <section style={{ ...themeStyle, background: 'var(--bg)', color: 'var(--text)', padding: 1, borderRadius: 8 }}>
      <h2>Dashboard</h2>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Signed in as <b>{user.email}</b>
      </p>

      {/* THEME SELECT (LIVE PREVIEW) */}
      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ opacity: 0.8, marginBottom: 6 }}>Theme</div>
        <select
          name="theme"
          value={form.theme}
          onChange={onChange}
          style={{
            padding: 12,
            width: 260,
            borderRadius: 12,
            border: '1px solid var(--chip-border)',
            background: 'var(--chip-bg)',
            color: 'var(--text)',
          }}
        >
          {Object.entries(THEMES).map(([key, t]) => (
            <option key={key} value={key}>
              {t.name}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          Changes preview instantly. Click <b>Save</b> to keep the selection.
        </div>
      </label>

      {input('Public link (slug)', 'slug', 'e.g. handyman001')}
      {input('Business name', 'name', 'e.g. Pro Cleaners')}

      {/* Logo */}
      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ opacity: 0.8, marginBottom: 6 }}>Logo / profile photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Logo preview"
              style={{
                width: 64,
                height: 64,
                objectFit: 'cover',
                borderRadius: 12,
                border: '1px solid var(--chip-border)',
                background: 'var(--chip-bg)',
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                border: '1px solid var(--chip-border)',
                background: 'var(--chip-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6,
                fontSize: 12,
              }}
            >
              no image
            </div>
          )}
          <input type="file" accept="image/*" onChange={onAvatarFile} disabled={uploading} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
          PNG/JPG, up to ~5 MB. {uploading ? 'Uploading…' : ''}
        </div>
      </label>

      {input('Trade', 'trade', 'e.g. House Cleaning')}
      {input('City', 'city', 'e.g. London')}
      {input('Phone (tap to call)', 'phone', 'e.g. +44 7700 900123')}
      {input('WhatsApp number', 'whatsapp', 'e.g. +44 7700 900123')}

      <div style={{ marginTop: 4, marginBottom: 8, opacity: 0.8 }}>Social (optional)</div>
      {input('Facebook (URL or @)', 'facebook', 'https://facebook.com/yourpage or @yourpage')}
      {input('Instagram (URL or @)', 'instagram', 'https://instagram.com/yourname or @yourname')}
      {input('TikTok (URL or @)', 'tiktok', 'https://tiktok.com/@yourname or @yourname')}
      {input('X / Twitter (URL or @)', 'x', 'https://x.com/yourname or @yourname')}

      {textarea('About (short description)', 'about')}
      {textarea('Zones / Areas (comma separated)', 'areas')}
      {textarea('Services (comma separated)', 'services')}
      {textarea('Prices (one per line optional)', 'prices')}
      {textarea('Opening hours', 'hours')}
      {textarea('Other useful information (optional)', 'other_info')}

      {/* Actions */}
      <div style={actionsRowStyle}>
        <button
          type="button"
          onClick={save}
          style={btn({
            background: `linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))`,
            color: '#08101e',
            border: '1px solid var(--border)',
          })}
        >
          Save
        </button>

        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            style={btn({
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--social-border)',
            })}
          >
            Preview
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Enter a slug to preview"
            style={btn({
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--social-border)',
              opacity: 0.6,
              cursor: 'not-allowed',
            })}
          >
            Preview
          </button>
        )}
      </div>

      {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
    </section>
  );
  }
