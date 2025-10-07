'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');

  // NEW: preview + uploading states for the logo
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Helper to construct a public URL from a storage path
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
    // NEW: where we store the storage object path (e.g. userId/1699999999.jpg)
    avatar_path: '',
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('slug,name,trade,city,phone,whatsapp,about,areas,services,prices,hours,avatar_path') // ← added avatar_path
        .eq('id', user.id)
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
        });
        // show preview if there is an existing image
        setAvatarUrl(publicUrlFor(data.avatar_path ?? ''));
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // NEW: upload handler
  const onAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setMsg('');

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    setUploading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setForm(prev => ({ ...prev, avatar_path: filePath }));
    setAvatarUrl(publicUrlFor(filePath));
    setMsg('Logo uploaded — click Save to keep it.');
  };

  const save = async () => {
    setMsg('');

    const slug = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // keep alnum + '-'
      .replace(/-+/g, '-');

    if (!slug) {
      setMsg('Please choose a slug.');
      return;
    }

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
      // NEW: persist the storage path
      avatar_path: form.avatar_path,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(row, { onConflict: 'id' });

    setMsg(error ? error.message : 'Saved!');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) return <p>Loading…</p>;

  // build preview href from whatever is typed in the slug field
  const previewHref = (() => {
    const s = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')  // keep only letters/numbers/dash
      .replace(/-+/g, '-');         // collapse multiple dashes
    return s ? `/${s}` : '';
  })();

  // Build preview path from whatever is currently typed in the slug input
  const previewPath = (() => {
    const s = (form.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    return s ? `/${s}` : '';
  })();

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
          border: '1px solid #27406e',
          background: '#0b1428',
          color: '#eaf2ff',
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
          border: '1px solid #27406e',
          background: '#0b1428',
          color: '#eaf2ff',
        }}
      />
    </label>
  );

  return (
    <section>
      <h2>Dashboard</h2>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Signed in as <b>{user.email}</b>
      </p>

      {input('Public link (slug)', 'slug', 'e.g. handyman001')}
      {input('Business name', 'name', 'e.g. Pro Cleaners')}

      {/* NEW: Logo / profile photo upload */}
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
                border: '1px solid #27406e',
                background: '#0b1428',
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                border: '1px solid #27406e',
                background: '#0b1428',
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

          <input
            type="file"
            accept="image/*"
            onChange={onAvatarFile}
            disabled={uploading}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
          PNG/JPG, up to ~5 MB. {uploading ? 'Uploading…' : ''}
        </div>
      </label>

      {input('Trade', 'trade', 'e.g. House Cleaning')}
      {input('City', 'city', 'e.g. London')}
      {input('Phone (tap to call)', 'phone', 'e.g. +44 7700 900123')}
      {input('WhatsApp number', 'whatsapp', 'e.g. +44 7700 900123')}

      {textarea(
        'About (short description for your public page)',
        'about',
        'e.g. Reliable, friendly and affordable. Free quotes, no hidden fees.'
      )}

      {textarea(
        'Zones / Areas (comma separated)',
        'areas',
        'e.g. Camden, Islington, Hackney'
      )}

      {textarea(
        'Services (comma separated)',
        'services',
        'e.g. Regular clean, Deep clean, End of tenancy'
      )}
      {textarea(
        'Prices (free text, one per line optional)',
        'prices',
        'e.g.\nRegular clean: £18/hr\nDeep clean: from £120'
      )}
      {textarea('Opening hours', 'hours', 'e.g. Mon–Fri 8:00–18:00')}

      {/* Actions: Save + Preview */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <button
          type="button"
          onClick={save}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #27406e',
            background: 'linear-gradient(135deg,#66e0b9,#8ab4ff)',
            color: '#08101e',
            fontWeight: 700,
          }}
        >
          Save
        </button>

        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #213a6b',
              background: 'transparent',
              color: '#eaf2ff',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Preview
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Enter a slug to preview"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #213a6b',
              background: 'transparent',
              color: '#8aa0c8',
              fontWeight: 700,
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            Preview
          </button>
        )}
      </div>

      {/* Flash / Save message */}
      {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
    </section>
  );
}
