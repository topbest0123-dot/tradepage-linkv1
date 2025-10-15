'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* -------- Premium theme tokens (dark + light) -------- */
const THEMES = {
  // DARK
  'deep-navy':      { name:'Deep Navy', vars:{'--bg':'#0a0f14','--text':'#eaf2ff','--muted':'#b8ccff','--border':'#183153','--card-bg-1':'#0f213a','--card-bg-2':'#0b1524','--chip-bg':'#0c1a2e','--chip-border':'#27406e','--btn-primary-1':'#66e0b9','--btn-primary-2':'#8ab4ff','--btn-neutral-bg':'#1f2937','--social-border':'#213a6b'}},
  'midnight-teal':  { name:'Midnight Teal', vars:{'--bg':'#071417','--text':'#e9fbff','--muted':'#c0e9f2','--border':'#15444a','--card-bg-1':'#0b2a31','--card-bg-2':'#0a1e24','--chip-bg':'#0a2227','--chip-border':'#1e5660','--btn-primary-1':'#51e1c2','--btn-primary-2':'#6db7ff','--btn-neutral-bg':'#122026','--social-border':'#214e56'}},
  'royal-purple':   { name:'Royal Purple', vars:{'--bg':'#0c0714','--text':'#f0e9ff','--muted':'#d7c9ff','--border':'#3b2b6a','--card-bg-1':'#1b1340','--card-bg-2':'#120e2b','--chip-bg':'#160f33','--chip-border':'#463487','--btn-primary-1':'#8f7bff','--btn-primary-2':'#c48bff','--btn-neutral-bg':'#221a3d','--social-border':'#3d2f72'}},
  'graphite-ember': { name:'Graphite Ember', vars:{'--bg':'#0a0a0c','--text':'#f3f3f7','--muted':'#d9d9e2','--border':'#34353a','--card-bg-1':'#16171c','--card-bg-2':'#0f1013','--chip-bg':'#121317','--chip-border':'#383a41','--btn-primary-1':'#ffb259','--btn-primary-2':'#ff7e6e','--btn-neutral-bg':'#1b1c21','--social-border':'#3a3b42'}},
  'sapphire-ice':   { name:'Sapphire Ice', vars:{'--bg':'#051018','--text':'#eaf6ff','--muted':'#cfe6ff','--border':'#1a3f63','--card-bg-1':'#0b2235','--card-bg-2':'#081827','--chip-bg':'#0a1d2c','--chip-border':'#1f4a77','--btn-primary-1':'#6cd2ff','--btn-primary-2':'#77ffa9','--btn-neutral-bg':'#0f1b28','--social-border':'#204a73'}},
  'forest-emerald': { name:'Forest Emerald', vars:{'--bg':'#07130e','--text':'#eafff5','--muted':'#c8f5e6','--border':'#1c4f3b','--card-bg-1':'#0c2b21','--card-bg-2':'#0a1f18','--chip-bg':'#0a231c','--chip-border':'#1d5f49','--btn-primary-1':'#38e6a6','--btn-primary-2':'#7bd7ff','--btn-neutral-bg':'#0f1d18','--social-border':'#215846'}},
  // LIGHT
  'porcelain-mint': { name:'Porcelain Mint', vars:{'--bg':'#f6fbf8','--text':'#0b1b16','--muted':'#4c6a5e','--border':'#cfe7dc','--card-bg-1':'#ffffff','--card-bg-2':'#f1f7f3','--chip-bg':'#eef5f0','--chip-border':'#cfe7dc','--btn-primary-1':'#21c58b','--btn-primary-2':'#5fb9ff','--btn-neutral-bg':'#e9f2ed','--social-border':'#c7e0d4'}},
  'paper-snow':     { name:'Paper Snow', vars:{'--bg':'#ffffff','--text':'#121417','--muted':'#5b6777','--border':'#e5e7ea','--card-bg-1':'#ffffff','--card-bg-2':'#f7f9fb','--chip-bg':'#f3f5f7','--chip-border':'#e5e7ea','--btn-primary-1':'#3b82f6','--btn-primary-2':'#22c55e','--btn-neutral-bg':'#eef2f6','--social-border':'#dfe3e8'}},
  'linen-rose':     { name:'Linen Rose', vars:{'--bg':'#fbf7f5','--text':'#221a16','--muted':'#6d5c54','--border':'#eaded7','--card-bg-1':'#ffffff','--card-bg-2':'#f6efeb','--chip-bg':'#f2eae6','--chip-border':'#eaded7','--btn-primary-1':'#f472b6','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#efe7e3','--social-border':'#e6d9d1'}},
  'sandstone':      { name:'Sandstone', vars:{'--bg':'#faf7f1','--text':'#191714','--muted':'#6f675f','--border':'#eadfcd','--card-bg-1':'#ffffff','--card-bg-2':'#f6f1e7','--chip-bg':'#f2ece1','--chip-border':'#eadfcd','--btn-primary-1':'#f59e0b','--btn-primary-2':'#84cc16','--btn-neutral-bg':'#efe9df','--social-border':'#e6dac7'}},
  'cloud-blue':     { name:'Cloud Blue', vars:{'--bg':'#f6fbff','--text':'#0e141a','--muted':'#526576','--border':'#d8e6f1','--card-bg-1':'#ffffff','--card-bg-2':'#eff6fb','--chip-bg':'#edf4fa','--chip-border':'#d8e6f1','--btn-primary-1':'#60a5fa','--btn-primary-2':'#34d399','--btn-neutral-bg':'#eaf2f8','--social-border':'#d3e2ee'}},
  'ivory-ink':      { name:'Ivory Ink', vars:{'--bg':'#fffdf7','--text':'#101112','--muted':'#5a5e66','--border':'#ebe7db','--card-bg-1':'#ffffff','--card-bg-2':'#faf7ef','--chip-bg':'#f7f4ed','--chip-border':'#ebe7db','--btn-primary-1':'#111827','--btn-primary-2':'#64748b','--btn-neutral-bg':'#f1ede4','--social-border':'#e7e2d6'}},
};

/* apply theme to <html> (whole app) */
const applyTheme = (key) => {
  const t = THEMES[key] || THEMES['deep-navy'];
  Object.entries(t.vars).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
};
/* ----------------------------------------------------- */

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
    slug: '', name: '', trade: '', city: '',
    phone: '', whatsapp: '', about: '',
    areas: '', services: '', prices: '', hours: '',
    facebook: '', instagram: '', tiktok: '', x: '', youtube: '',
    location: '', location_url: '',
    avatar_path: '',
    theme: 'deep-navy',
    other_info: '',
  });

  /* load profile */
  useEffect(() => {
    const load = async () => {
      const { data: { user: me } } = await supabase.auth.getUser();
      if (!me) { router.replace('/signin'); return; }
      setUser(me);

      const { data } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,facebook,instagram,tiktok,x,youtube,avatar_path,theme,other_info,location,location_url')
        .eq('id', me.id).maybeSingle();

      if (data) {
        setForm(prev => ({ ...prev,
          slug: data.slug ?? '', name: data.name ?? '', trade: data.trade ?? '', city: data.city ?? '',
          phone: data.phone ?? '', whatsapp: data.whatsapp ?? '', about: data.about ?? '',
          areas: data.areas ?? '', services: data.services ?? '', prices: data.prices ?? '', hours: data.hours ?? '',
          facebook: data.facebook ?? '', instagram: data.instagram ?? '', tiktok: data.tiktok ?? '', x: data.x ?? '', youtube: data.youtube ?? '',
          avatar_path: data.avatar_path ?? '', theme: data.theme ?? 'deep-navy', other_info: data.other_info ?? '' , location: data.location ?? '',
          location_url: data.location_url ?? '',

        }));
        setAvatarUrl(publicUrlFor(data.avatar_path ?? ''));
        applyTheme(data.theme ?? 'deep-navy'); // set initial theme on whole page
      } else {
        applyTheme('deep-navy');
      }

      setLoading(false);
    };
    load();
  }, [router]);

  /* live preview on change */
  useEffect(() => { applyTheme(form.theme); }, [form.theme]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true); setMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${user.id}/${fileName}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true });
    setUploading(false);
    if (error) return setMsg(error.message);
    setForm(prev => ({ ...prev, avatar_path: filePath }));
    setAvatarUrl(publicUrlFor(filePath));
    setMsg('Logo uploaded — click Save to keep it.');
  };

  const save = async () => {
    setMsg('');
    const slug = (form.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!slug) return setMsg('Please choose a slug.');
    const normalizedServices = (form.services || '').replace(/\n+/g, ',').replace(/,+/g, ',').trim();

    const row = {
      id: user.id, slug,
      name: form.name, trade: form.trade, city: form.city,
      phone: form.phone, whatsapp: form.whatsapp,
      about: form.about, areas: form.areas, services: normalizedServices,
      prices: form.prices, hours: form.hours,
      facebook: form.facebook, instagram: form.instagram, tiktok: form.tiktok, x: form.x,youtube: form.youtube,
      location: form.location, location_url: form.location_url,
      avatar_path: form.avatar_path,
      theme: form.theme, other_info: form.other_info, location: form.location,location_url: form.location_url,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
    setMsg(error ? error.message : 'Saved!');
  };

  if (loading) return <p>Loading…</p>;

  const previewHref = (() => {
    const s = (form.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    return s ? `/${s}` : '';
  })();

  /* UI helpers */
  const fieldBase = {
    padding: 12, width: '100%', maxWidth: 520, borderRadius: 12,
    border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--text)'
  };
  const input = (label, name, placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <input name={name} value={form[name]} onChange={onChange} placeholder={placeholder} style={fieldBase} />
    </label>
  );
  const textarea = (label, name, placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <textarea name={name} value={form[name]} onChange={onChange} placeholder={placeholder} rows={4} style={fieldBase} />
    </label>
  );

  const actionsRow = { display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' };
  const btn = (style) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: 40, padding: '0 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', cursor: 'pointer', ...style
  });

  return (
    <section>
      <h2>Dashboard</h2>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Signed in as <b>{user.email}</b>
      </p>

      {input('Public link (slug)', 'slug', 'e.g. handyman001')}
      {input('Business name', 'name', 'e.g. Pro Cleaners')}

      {/* Logo / profile photo */}
      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ opacity: 0.8, marginBottom: 6 }}>Logo / profile photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Logo preview"
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--chip-border)', background: 'var(--chip-bg)' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 12, border: '1px solid var(--chip-border)', background: 'var(--chip-bg)',
              display:'flex', alignItems:'center', justifyContent:'center', opacity:0.6, fontSize:12 }}>no image</div>
          )}
          <input type="file" accept="image/*" onChange={onAvatarFile} disabled={uploading} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>PNG/JPG, up to ~5 MB. {uploading ? 'Uploading…' : ''}</div>
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
      {input('YouTube (URL or @handle)', 'youtube', 'https://youtube.com/@yourchannel or @yourhandle')}

      <div style={{ marginTop: 4, marginBottom: 8, opacity: 0.8 }}>Location (optional)</div>
      {input('Location (address or place name)', 'location', 'e.g. 221B Baker St, London')}
      {input('Location link (Google/Apple Maps URL)', 'location_url', 'https://maps.google.com/?q=...')}

      {textarea('About (short description)', 'about')}
      {textarea('Zones / Areas (comma separated)', 'areas')}
      {textarea('Services (comma separated)', 'services')}
      {textarea('Prices (one per line optional)', 'prices')}
      {textarea('Opening hours', 'hours')}
      {textarea('Other useful information (optional)', 'other_info')}

      {/* Actions row: THEME PICKER + SAVE + PREVIEW */}
      <div style={actionsRow}>
        <select
          name="theme"
          value={form.theme}
          onChange={onChange}
          aria-label="Theme"
          style={{
            ...btn({ background: 'transparent', color: 'var(--text)', border: '1px solid var(--social-border)' }),
            height: 40, paddingRight: 26, appearance: 'none'
          }}
        >
          {Object.entries(THEMES).map(([key, t]) => (
            <option key={key} value={key}>{t.name}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={save}
          style={btn({ background: `linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))`, color: '#08101e', border: '1px solid var(--border)' })}
        >
          Save
        </button>

        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            style={btn({ background: 'transparent', color: 'var(--text)', border: '1px solid var(--social-border)' })}
          >
            Preview
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Enter a slug to preview"
            style={btn({ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--social-border)', opacity: 0.6, cursor: 'not-allowed' })}
          >
            Preview
          </button>
        )}
      </div>

      {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
    </section>
  );
                  }
