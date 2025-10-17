// app/dashboard/page.jsx
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
  'sapphire-ice':   { name:'Sapphire Ice', vars:{'--bg':'#051018','--text':'#eaf6ff','--muted':'#cfe6ff','--border':'#1a3f63','--card-bg-1':'#0b2235','--card-bg-2':'#0b2235','--chip-bg':'#0a1d2c','--chip-border':'#1f4a77','--btn-primary-1':'#6cd2ff','--btn-primary-2':'#77ffa9','--btn-neutral-bg':'#0f1b28','--social-border':'#204a73'}},
  'forest-emerald': { name:'Forest Emerald', vars:{'--bg':'#07130e','--text':'#eafff5','--muted':'#c8f5e6','--border':'#1c4f3b','--card-bg-1':'#0c2b21','--card-bg-2':'#0a1f18','--chip-bg':'#0a231c','--chip-border':'#1d5f49','--btn-primary-1':'#38e6a6','--btn-primary-2':'#7bd7ff','--btn-neutral-bg':'#0f1d18','--social-border':'#215846'}},
  // LIGHT
  'porcelain-mint': { name:'Porcelain Mint', vars:{'--bg':'#f6fbf8','--text':'#0b1b16','--muted':'#4c6a5e','--border':'#cfe7dc','--card-bg-1':'#ffffff','--card-bg-2':'#f1f7f3','--chip-bg':'#eef5f0','--chip-border':'#cfe7dc','--btn-primary-1':'#21c58b','--btn-primary-2':'#5fb9ff','--btn-neutral-bg':'#e9f2ed','--social-border':'#c7e0d4'}},
  'paper-snow':     { name:'Paper Snow', vars:{'--bg':'#ffffff','--text':'#121417','--muted':'#5b6777','--border':'#e5e7ea','--card-bg-1':'#ffffff','--card-bg-2':'#f7f9fb','--chip-bg':'#f3f5f7','--chip-border':'#e5e7ea','--btn-primary-1':'#3b82f6','--btn-primary-2':'#22c55e','--btn-neutral-bg':'#eef2f6','--social-border':'#dfe3e8'}},
  'linen-rose':     { name:'Linen Rose', vars:{'--bg':'#fbf7f5','--text':'#221a16','--muted':'#6d5c54','--border':'#eaded7','--card-bg-1':'#ffffff','--card-bg-2':'#f6efeb','--chip-bg':'#f2eae6','--chip-border':'#eaded7','--btn-primary-1':'#f472b6','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#efe7e3','--social-border':'#e6d9d1'}},
  'sandstone':      { name:'Sandstone', vars:{'--bg':'#faf7f1','--text':'#191714','--muted':'#6f675f','--border':'#eadfcd','--card-bg-1':'#ffffff','--card-bg-2':'#f6f1e7','--chip-bg':'#f2ece1','--chip-border':'#eadfcd','--btn-primary-1':'#f59e0b','--btn-primary-2':'#84cc16','--btn-neutral-bg':'#efe9df','--social-border':'#e6dac7'}},
  'cloud-blue':     { name:'Cloud Blue', vars:{'--bg':'#f6fbff','--text':'#0e141a','--muted':'#526576','--border':'#d8e6f1','--card-bg-1':'#ffffff','--card-bg-2':'#eff6fb','--chip-bg':'#edf4fa','--chip-border':'#d8e6f1','--btn-primary-1':'#60a5fa','--btn-primary-2':'#34d399','--btn-neutral-bg':'#eaf2f8','--social-border':'#d3e2ee'}},
  'ivory-ink':      { name:'Ivory Ink', vars:{'--bg':'#fffdf7','--text':'#101112','--muted':'#5a5e66','--border':'#ebe7db','--card-bg-1':'#ffffff','--card-bg-2':'#faf7ef','--chip-bg':'#f7f4ed','--chip-border':'#ebe7db','--btn-primary-1':'#111827','--btn-primary-2':'#64748b','--btn-neutral-bg':'#f1ede4','--social-border':'#e7e2d6'}},
  'amber-carbon':   { name:'Amber Carbon', vars:{'--bg':'#0d0b07','--text':'#fff7e6','--muted':'#f3d5a6','--border':'#4a3b17','--card-bg-1':'#1a150d','--card-bg-2':'#120f0a','--chip-bg':'#17120c','--chip-border':'#5c4a1a','--btn-primary-1':'#f5b04c','--btn-primary-2':'#38e1b9','--btn-neutral-bg':'#1b1712','--social-border':'#5a481b'}},
  'crimson-violet': { name:'Crimson Violet', vars:{'--bg':'#0d0610','--text':'#ffeef7','--muted':'#f5c1da','--border':'#452342','--card-bg-1':'#1a0d22','--card-bg-2':'#130919','--chip-bg':'#150b1d','--chip-border':'#5a2c58','--btn-primary-1':'#ff6aa3','--btn-primary-2':'#b07bff','--btn-neutral-bg':'#1e1524','--social-border':'#553060'}},
  'pine-copper':    { name:'Pine Copper', vars:{'--bg':'#070d0a','--text':'#e9fff6','--muted':'#c2ecd9','--border':'#1d3f33','--card-bg-1':'#0d221b','--card-bg-2':'#091712','--chip-bg':'#0b1d17','--chip-border':'#2a5b49','--btn-primary-1':'#2fe39a','--btn-primary-2':'#ffb072','--btn-neutral-bg':'#0f1a15','--social-border':'#255646'}},
  'cobalt-sunset':  { name:'Cobalt Sunset', vars:{'--bg':'#050b16','--text':'#e9f2ff','--muted':'#b8ccff','--border':'#1a355e','--card-bg-1':'#0b1c33','--card-bg-2':'#081326','--chip-bg':'#0a182a','--chip-border':'#274a7a','--btn-primary-1':'#6aa6ff','--btn-primary-2':'#ff8e6b','--btn-neutral-bg':'#0f1a28','--social-border':'#254a78'}},
  'pearl-latte':    { name:'Pearl Latte', vars:{'--bg':'#fffaf3','--text':'#191512','--muted':'#6e655e','--border':'#eadfcd','--card-bg-1':'#ffffff','--card-bg-2':'#f6efe3','--chip-bg':'#f4ede2','--chip-border':'#eadfcd','--btn-primary-1':'#c18f5a','--btn-primary-2':'#59c9a9','--btn-neutral-bg':'#efe6da','--social-border':'#e1d6c4'}},
  'icy-lilac':      { name:'Icy Lilac', vars:{'--bg':'#fbf7ff','--text':'#121018','--muted':'#6c6880','--border':'#e2d9fa','--card-bg-1':'#ffffff','--card-bg-2':'#f5f1ff','--chip-bg':'#f3efff','--chip-border':'#e2d9fa','--btn-primary-1':'#9f87ff','--btn-primary-2':'#7adfff','--btn-neutral-bg':'#efeafc','--social-border':'#ddd3fa'}},
  'citrus-cream':   { name:'Citrus Cream', vars:{'--bg':'#fffef6','--text':'#0f1208','--muted':'#6a6f57','--border':'#ece7c9','--card-bg-1':'#ffffff','--card-bg-2':'#faf7e3','--chip-bg':'#f6f3de','--chip-border':'#ece7c9','--btn-primary-1':'#ffb84d','--btn-primary-2':'#79e66f','--btn-neutral-bg':'#f0eddc','--social-border':'#e6e0c6'}},
  'sunset-apricot':  { name:'Sunset Apricot', vars:{'--bg':'#0f0b09','--text':'#fff4ec','--muted':'#ffd9c2','--border':'#3a2a22','--card-bg-1':'#2a1b16','--card-bg-2':'#1a120e','--chip-bg':'#231611','--chip-border':'#4a3329','--btn-primary-1':'#ffb86b','--btn-primary-2':'#ff6aa2','--btn-neutral-bg':'#2b1f1a','--social-border':'#4d3a30'}},
  'minted-ivory':    { name:'Minted Ivory',   vars:{'--bg':'#fbfffd','--text':'#132018','--muted':'#4d6d5e','--border':'#d7eee4','--card-bg-1':'#ffffff','--card-bg-2':'#f3fbf7','--chip-bg':'#eff9f4','--chip-border':'#d7eee4','--btn-primary-1':'#10b981','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#e7f3ed','--social-border':'#cfe7dc'}},
  'citrus-cream':    { name:'Citrus Cream',   vars:{'--bg':'#fffef7','--text':'#17160f','--muted':'#6b6a55','--border':'#efe9c9','--card-bg-1':'#ffffff','--card-bg-2':'#faf6e4','--chip-bg':'#f7f3df','--chip-border':'#efe9c9','--btn-primary-1':'#f59e0b','--btn-primary-2':'#34d399','--btn-neutral-bg':'#efe9da','--social-border':'#e7dfc3'}},
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

  // slug availability state
  const [slugTaken, setSlugTaken] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const publicUrlFor = (path) =>
    path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;

  // form state
  const [form, setForm] = useState({
    slug: '', name: '', trade: '', city: '',
    phone: '', whatsapp: '', about: '',
    contact_email: '',
    areas: '', services: '', prices: '', hours: '',
    facebook: '', instagram: '', tiktok: '', x: '', youtube: '',
    location: '', location_url: '',
    avatar_path: '',
    theme: 'deep-navy',
    other_info: '',
    gallery: [],
    other_trades: '',            // ← added
  });

  /* load profile */
  useEffect(() => {
    const load = async () => {
      const { data: { user: me } } = await supabase.auth.getUser();
      if (!me) { router.replace('/signin'); return; }
      setUser(me);

      const { data } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,contact_email,about,areas,services,prices,hours,facebook,instagram,tiktok,x,youtube,avatar_path,theme,other_info,gallery,location,location_url,other_trades')
        .eq('id', me.id).maybeSingle();

      if (data) {
        setForm(prev => ({
          ...prev,
          slug: data.slug ?? '', name: data.name ?? '', trade: data.trade ?? '', city: data.city ?? '',
          phone: data.phone ?? '', whatsapp: data.whatsapp ?? '',
          contact_email: data.contact_email ?? '', about: data.about ?? '',
          areas: data.areas ?? '', services: data.services ?? '', prices: data.prices ?? '', hours: data.hours ?? '',
          facebook: data.facebook ?? '', instagram: data.instagram ?? '', tiktok: data.tiktok ?? '', x: data.x ?? '', youtube: data.youtube ?? '',
          location: data.location ?? '', location_url: data.location_url ?? '',
          avatar_path: data.avatar_path ?? '', theme: data.theme ?? 'deep-navy', other_info: data.other_info ?? '',
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          other_trades: data.other_trades ?? '',   // ← added
        }));
        setAvatarUrl(publicUrlFor(data.avatar_path ?? ''));
        applyTheme(data.theme ?? 'deep-navy');
      } else {
        applyTheme('deep-navy');
      }

      setLoading(false);
    };
    load();
  }, [router]);

  /* live theme preview */
  useEffect(() => { applyTheme(form.theme); }, [form.theme]);

  /* live slug availability check */
  useEffect(() => {
    const s = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    if (!s || !user) { setSlugTaken(false); return; }

    let alive = true;
    setCheckingSlug(true);

    supabase
      .from('profiles')
      .select('id')
      .eq('slug', s)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setSlugTaken(!!(data && data.id !== user.id));
      })
      .finally(() => { if (alive) setCheckingSlug(false); });

    return () => { alive = false; };
  }, [form.slug, user]);

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

  // gallery helpers
  const publicGalleryUrlFor = (path) =>
    path ? supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl : null;

  const onGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setUploading(true); setMsg('');

    const newPaths = [];
    for (const [i, file] of files.entries()) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${i}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) { setMsg(error.message); continue; }
      newPaths.push(filePath);
    }

    setUploading(false);
    if (newPaths.length) {
      setForm(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...newPaths] }));
      setMsg(`Added ${newPaths.length} photo${newPaths.length > 1 ? 's' : ''}. Click Save to keep them.`);
    }
    e.target.value = '';
  };

  const removeGalleryItem = async (path) => {
    setForm(prev => ({ ...prev, gallery: (prev.gallery || []).filter(p => p !== path) }));
    try { await supabase.storage.from('gallery').remove([path]); } catch {}
  };

  const save = async () => {
    setMsg('');
    const slug = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    if (!slug) return setMsg('Please choose a slug.');

    // prevent saving if taken (double-check server-side)
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (existing && existing.id !== user.id) {
      setMsg('This link is taken. Please try another.');
      return;
    }

    const normalizedServices = (form.services || '').replace(/\n+/g, ',').replace(/,+/g, ',').trim();
    const normalizedOtherTrades = (form.other_trades || '')
      .replace(/\n+/g, ',')
      .replace(/,+/g, ',')
      .trim();

    const row = {
      id: user.id, slug,
      name: form.name, trade: form.trade, city: form.city,
      phone: form.phone, whatsapp: form.whatsapp,
      contact_email: form.contact_email,
      about: form.about, areas: form.areas, services: normalizedServices,
      prices: form.prices, hours: form.hours,
      facebook: form.facebook, instagram: form.instagram, tiktok: form.tiktok, x: form.x, youtube: form.youtube,
      location: form.location, location_url: form.location_url,
      avatar_path: form.avatar_path,
      theme: form.theme, other_info: form.other_info,
      gallery: Array.isArray(form.gallery) ? form.gallery : [],
      other_trades: form.other_trades,   // ← added
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
    if (error) {
      // 23505 = unique violation
      if (error.code === '23505') {
        setMsg('This link is taken. Please try another.');
      } else {
        setMsg(error.message);
      }
      return;
    }
    setMsg('Saved!');
  };

  if (loading) return <p>Loading…</p>;

  const previewHref = (() => {
    const s = (form.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    return s && !slugTaken ? `/${s}` : '';
  })();

  /* UI helpers */
  const fieldBase = {
    padding: 12, width: '100%', maxWidth: 520, borderRadius: 12,
    border: '1px solid var(--chip-border)', background: 'var(--chip-bg)', color: 'var(--text)'
  };
  const input = (label, name, placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <input name={name} value={form[name] ?? ''} onChange={onChange} placeholder={placeholder} style={fieldBase} />
    </label>
  );
  const textarea = (label, name, placeholder = '') => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <textarea name={name} value={form[name] ?? ''} onChange={onChange} placeholder={placeholder} rows={4} style={fieldBase} />
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

      {/* availability hint */}
      {form.slug ? (
        <div style={{ marginTop: -6, marginBottom: 10, fontSize: 12 }}>
          {checkingSlug
            ? 'Checking availability…'
            : slugTaken
              ? <span style={{ color: '#ff6b6b' }}>This link is taken. Try a different one.</span>
              : <span style={{ color: '#78e08f' }}>Available ✓</span>}
        </div>
      ) : null}

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

      {/* Gallery uploader */}
      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ opacity: 0.8, marginBottom: 6 }}>Gallery photos</div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onGalleryFiles}
          disabled={uploading}
          style={{ cursor: 'pointer' }}
        />
        <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
          PNG/JPG. You can upload multiple. {uploading ? 'Uploading…' : ''}
        </div>

        {Array.isArray(form.gallery) && form.gallery.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12, marginTop: 12
          }}>
            {form.gallery.map((p) => {
              const url = publicGalleryUrlFor(p);
              return (
                <div key={p} style={{
                  position: 'relative',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--chip-border)',
                  background: 'var(--chip-bg)',
                  height: 120
                }}>
                  {url ? (
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6
                    }}>no preview</div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(p)}
                    title="Remove"
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      border: '1px solid var(--social-border)',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      borderRadius: 8,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </label>

      {input('Trade', 'trade', 'e.g. House Cleaning')}
      {input('City', 'city', 'e.g. London')}
      {input('Phone (tap to call)', 'phone', 'e.g. +44 7700 900123')}
      {input('WhatsApp number', 'whatsapp', 'e.g. +44 7700 900123')}
      {input('Contact email (for quotes & Contacts popup)', 'contact_email', 'e.g. hello@yourbusiness.com')}


      <div style={{ marginTop: 4, marginBottom: 8, opacity: 0.8 }}>Social (optional)</div>
      {input('Facebook (URL or @)', 'facebook', 'https://facebook.com/yourpage or @yourpage')}
      {input('Instagram (URL or @)', 'instagram', 'https://instagram.com/yourname or @yourname')}
      {input('TikTok (URL or @)', 'tiktok', 'https://tiktok.com/@yourname or @yourname')}
      {input('X / Twitter (URL or @)', 'x', 'https://x.com/yourname or @yourname')}
      {input('YouTube (URL or @handle)', 'youtube', 'https://youtube.com/@yourchannel or @yourhandle')}

      <div style={{ marginTop: 4, marginBottom: 8, opacity: 0.8 }}>Location (optional)</div>
      {input('Location (address or place name)', 'location', 'e.g. 221B Baker St, London')}
      {input('Location link (Google/Apple Maps URL)', 'location_url', 'https://maps.google.com/?q=...')}

      {textarea(
  'About (short description)',
  'about',
  `Tell customers who you are and what you do.
Example: Friendly local handyman with 10+ years’ experience. Reliable, insured, free quotes.`
)}

{textarea(
  'Zones / Areas (comma separated)',
  'areas',
  'e.g. Birmingham City Centre, Digbeth, Edgbaston'
)}

{textarea(
  'Services (comma separated)',
  'services',
  'e.g. Flat-pack assembly, TV mounting, Painting, Minor plumbing'
)}

{textarea(
  'Other trades (comma separated) [optional]',
  'other_trades',
  'e.g. Electrician, Tiler, Plasterer, Painter'
)}

{textarea(
  'Prices (one per line optional)',
  'prices',
  `Call-out — from £25
Hourly rate — from £35
Boiler service — £80`
)}

{textarea(
  'Opening hours',
  'hours',
  `Mon–Fri 08:00–18:00
Sat 09:00–13:00
Sun Closed`
)}

{textarea(
  'Other useful information (optional)',
  'other_info',
  'e.g. Fully insured • DBS checked • Same-day service • Card payments accepted'
)}


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
          disabled={slugTaken || checkingSlug || !(form.slug || '').trim()}
          title={slugTaken ? 'This link is taken' : 'Save'}
          style={btn({
            background: `linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))`,
            color: '#08101e',
            border: '1px solid var(--border)',
            opacity: slugTaken || checkingSlug || !(form.slug || '').trim() ? 0.6 : 1,
            cursor: slugTaken || checkingSlug || !(form.slug || '').trim() ? 'not-allowed' : 'pointer'
          })}
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
            title={slugTaken ? 'This link is taken' : 'Enter a slug to preview'}
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
