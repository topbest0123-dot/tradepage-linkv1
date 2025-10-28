'use client';

import { useEffect, useMemo, useState } from 'react';
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

const normalizeWebsite = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
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

  website: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18M12 3c3.5 3.5 3.5 14 0 18M12 3c-3.5 3.5-3.5 14 0 18"/>
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
  'latte-ink':        {'--bg':'#f6efe3','--text':'#171311','--muted':'#6b5e50','--border':'#dccdb5','--card-bg-1':'#ebe1cf','--card-bg-2':'#e6d8c4','--chip-bg':'#ede3d3','--chip-border':'#d9c9b0','--btn-primary-1':'#111827','--btn-primary-2':'#64748b','--btn-neutral-bg':'#efe6d6','--social-border':'#d6c6ae'},
  'ocean-fog':        {'--bg':'#f2f6fa','--text':'#10151a','--muted':'#4d6275','--border':'#cbd8e6','--card-bg-1':'#e1e9f1','--card-bg-2':'#d9e3ee','--chip-bg':'#e7eff6','--chip-border':'#cbd8e6','--btn-primary-1':'#3b82f6','--btn-primary-2':'#22c55e','--btn-neutral-bg':'#eaf2f8','--social-border':'#c6d6e6'},
  'sage-stone':       {'--bg':'#f3f7f2','--text':'#101412','--muted':'#4d6457','--border':'#c7d7c9','--card-bg-1':'#e3eadf','--card-bg-2':'#dae4d6','--chip-bg':'#e8efe7','--chip-border':'#c7d7c9','--btn-primary-1':'#21c58b','--btn-primary-2':'#5fa8ff','--btn-neutral-bg':'#e7efe9','--social-border':'#c3d4c6'},
  'peach-slate':      {'--bg':'#fff6f0','--text':'#221814','--muted':'#6f5a50','--border':'#ead3c4','--card-bg-1':'#f3e1d6','--card-bg-2':'#edd6c9','--chip-bg':'#f7e6db','--chip-border':'#ead3c4','--btn-primary-1':'#f472b6','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#f3e8df','--social-border':'#e5cfc0'},
  'cobalt-cream':     {'--bg':'#fffdf8','--text':'#111214','--muted':'#5a5e66','--border':'#e3dccf','--card-bg-1':'#eee9df','--card-bg-2':'#e7e0d6','--chip-bg':'#f1ebe2','--chip-border':'#e3dccf','--btn-primary-1':'#2563eb','--btn-primary-2':'#22c55e','--btn-neutral-bg':'#f2ece3','--social-border':'#ddd4c7'},
  'skyline-graphite': {'--bg':'#f6f8fb','--text':'#0f1318','--muted':'#4d5a6b','--border':'#ccd7e5','--card-bg-1':'#e3e8f0','--card-bg-2':'#dce3ec','--chip-bg':'#e9eff6','--chip-border':'#cfd9e6','--btn-primary-1':'#0ea5e9','--btn-primary-2':'#10b981','--btn-neutral-bg':'#e7eef5','--social-border':'#c8d4e2'},
  'midnight-lime':    {'--bg':'#0a1210','--text':'#ecfff6','--muted':'#b5e1cf','--border':'#234137','--card-bg-1':'#121c19','--card-bg-2':'#0f1714','--chip-bg':'#111b17','--chip-border':'#2a4b3f','--btn-primary-1':'#34d399','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#131c19','--social-border':'#2a4b3f'},
  'ink-rose':         {'--bg':'#0f0a0b','--text':'#ffeef2','--muted':'#f1c3cf','--border':'#4a2832','--card-bg-1':'#1a1215','--card-bg-2':'#140e11','--chip-bg':'#171015','--chip-border':'#56303c','--btn-primary-1':'#ff6aa3','--btn-primary-2':'#a78bfa','--btn-neutral-bg':'#1b1417','--social-border':'#53303b'},
  'charcoal-ice':     {'--bg':'#0b0f14','--text':'#eef6ff','--muted':'#cbdaf0','--border':'#243446','--card-bg-1':'#141a22','--card-bg-2':'#10161d','--chip-bg':'#121820','--chip-border':'#2a3b4f','--btn-primary-1':'#60a5fa','--btn-primary-2':'#34d399','--btn-neutral-bg':'#151b22','--social-border':'#2a3a4d'},
  'ember-ash':        {'--bg':'#0f0e0c','--text':'#fff7e8','--muted':'#f3d9a8','--border':'#4a4023','--card-bg-1':'#18150f','--card-bg-2':'#13100c','--chip-bg':'#15120d','--chip-border':'#5a4d26','--btn-primary-1':'#f59e0b','--btn-primary-2':'#84cc16','--btn-neutral-bg':'#18150f','--social-border':'#5a4d26'},
  'aurora-mist':{'--bg':'#f4fbff','--text':'#0e1418','--muted':'#4c6272','--border':'#cfe0ea','--card-bg-1':'#e2edf5','--card-bg-2':'#dbe7f1','--chip-bg':'#eaf2f8','--chip-border':'#cfe0ea','--btn-primary-1':'#22c55e','--btn-primary-2':'#3b82f6','--btn-neutral-bg':'#e8f1f6','--social-border':'#c9dae5'},
  'honey-slate':{'--bg':'#fff7e8','--text':'#1a1410','--muted':'#6b5a46','--border':'#e8d6b8','--card-bg-1':'#f0e4cf','--card-bg-2':'#ead9c3','--chip-bg':'#f4e9d6','--chip-border':'#e6d2b3','--btn-primary-1':'#f59e0b','--btn-primary-2':'#10b981','--btn-neutral-bg':'#efe3cf','--social-border':'#e1ceb0'},
  'neon-noir':{'--bg':'#0b0b12','--text':'#eaffff','--muted':'#a8dbd6','--border':'#233347','--card-bg-1':'#141a26','--card-bg-2':'#101520','--chip-bg':'#121826','--chip-border':'#2a3d55','--btn-primary-1':'#22d3ee','--btn-primary-2':'#a78bfa','--btn-neutral-bg':'#131924','--social-border':'#2b3f57'},
  'forest-bronze':{'--bg':'#0c1210','--text':'#fef7ec','--muted':'#e5d4b4','--border':'#3b3a24','--card-bg-1':'#171c18','--card-bg-2':'#121814','--chip-bg':'#141914','--chip-border':'#4a472e','--btn-primary-1':'#84cc16','--btn-primary-2':'#f59e0b','--btn-neutral-bg':'#141a15','--social-border':'#4a452c'},
  'glacier-sunrise':{'--bg':'#f8fbff','--text':'#0f141a','--muted':'#506175','--border':'#d6e3f0','--card-bg-1':'#e6eef7','--card-bg-2':'#dee8f3','--chip-bg':'#ebf2f9','--chip-border':'#d3e1ee','--btn-primary-1':'#60a5fa','--btn-primary-2':'#f59e0b','--btn-neutral-bg':'#e9f0f7','--social-border':'#cfe0ee'},
  'coral-ink':{'--bg':'#fff5f6','--text':'#1d1012','--muted':'#6e4d53','--border':'#efccd2','--card-bg-1':'#f1dbe0','--card-bg-2':'#ebced5','--chip-bg':'#f6e4e8','--chip-border':'#efccd2','--btn-primary-1':'#fb7185','--btn-primary-2':'#22c55e','--btn-neutral-bg':'#f3e1e6','--social-border':'#e9c3cb'},
  'jade-charcoal':{'--bg':'#071312','--text':'#e8fff8','--muted':'#b7e3d5','--border':'#1d3b36','--card-bg-1':'#0f1d1b','--card-bg-2':'#0b1715','--chip-bg':'#0e1a18','--chip-border':'#25463f','--btn-primary-1':'#10b981','--btn-primary-2':'#60a5fa','--btn-neutral-bg':'#101d1a','--social-border':'#274840'},
  'royal-snow':{'--bg':'#f6f8ff','--text':'#0f1220','--muted':'#4a557a','--border':'#d1d7ee','--card-bg-1':'#e4e8f6','--card-bg-2':'#dde2f4','--chip-bg':'#eaedf9','--chip-border':'#cdd5ec','--btn-primary-1':'#6366f1','--btn-primary-2':'#06b6d4','--btn-neutral-bg':'#e9ecf7','--social-border':'#c7cfee'},
  'cocoa-mint':{'--bg':'#0f0a07','--text':'#f6fff9','--muted':'#cceadd','--border':'#3c3123','--card-bg-1':'#19130e','--card-bg-2':'#140f0b','--chip-bg':'#16110c','--chip-border':'#4a3b2c','--btn-primary-1':'#10b981','--btn-primary-2':'#f59e0b','--btn-neutral-bg':'#19130e','--social-border':'#4a3b2c'},
  'plum-amber':{'--bg':'#0a0812','--text':'#fff7ea','--muted':'#f3d7a9','--border':'#3f2f3a','--card-bg-1':'#151124','--card-bg-2':'#110e1b','--chip-bg':'#120f1d','--chip-border':'#4a3946','--btn-primary-1':'#fbbf24','--btn-primary-2':'#8b5cf6','--btn-neutral-bg':'#151225','--social-border':'#4a3a47'},
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

  // --- Contacts modal state ---
  const [contactsOpen, setContactsOpen] = useState(false);

  // --- Quote modal state + form ---
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [qForm, setQForm] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    files: [],        // File[]
  });

  const onQuoteFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 10); // cap at 10
    setQForm((prev) => ({ ...prev, files }));
  };

  const onQChange = (e) => {
    const { name, value } = e.target;
    setQForm((prev) => ({ ...prev, [name]: value }));
  };

  // Try to read a public contact email if you have one in the profile.
  // (Supports either `email` or `contact_email` if you later add it to the table.)
  const contactEmail = String(p?.email || p?.contact_email || '').trim();
  const emailHref = contactEmail ? `mailto:${contactEmail}` : null;

  // Request button target: prefer WhatsApp, else email, else call (fallback '#')
  const REQUEST_LABEL = 'Get a quote';
  const requestHref =
    waHref
      || (emailHref ? `${emailHref}?subject=${encodeURIComponent('Request')}` : null)
      || callHref
      || '#';

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
  const wb = normalizeWebsite(p?.website);

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

  // --- Save button state (chooser + iOS tip + deferred prompt) ---
  const [chooserOpen, setChooserOpen] = useState(false);
  const [iosTipOpen, setIosTipOpen]   = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    const onBIP = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  // Build & download a .vcf contact
  const buildVCard = () => {
    const fullName = p?.name || p?.slug || 'Trade Contact';
    const org      = p?.name || '';
    const title    = [p?.trade, p?.city].filter(Boolean).join(' • ');
    const tel      = (p?.phone || p?.whatsapp || '').toString().replace(/[^\d+]/g, '');
    const email    = p?.email || '';
    const addr     = p?.location || '';
    const url      = typeof window !== 'undefined' ? window.location.href : '';

    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      `ORG:${org}`,
      title ? `TITLE:${title}` : null,
      tel ? `TEL;TYPE=CELL:${tel}` : null,
      email ? `EMAIL:${email}` : null,
      addr ? `ADR;TYPE=WORK:;;${addr};;;;;` : null,
      url ? `URL:${url}` : null,
      'END:VCARD'
    ].filter(Boolean).join('\r\n');
  };

  const saveVCard = () => {
    const text = buildVCard();
    const blob = new Blob([text], { type: 'text/vcard;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const base = (p?.name || p?.slug || 'contact').toString().toLowerCase().replace(/\s+/g, '-');
    a.href = url;
    a.download = `${base}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    // hook your toast here if desired
    // showToast('Contact saved');
  };

  const addToHome = async () => {
    setChooserOpen(false);

    if (installPrompt) {
      try {
        installPrompt.prompt();
        await installPrompt.userChoice;
      } catch {}
      setInstallPrompt(null);
      return;
    }

    if (isIOS) {
      setIosTipOpen(true);
      return;
    }

    alert('Use your browser menu to “Add to Home Screen”.');
  };
  // --------------------------------------------------------------

  // Submit handler (quote form)
  const submitQuote = async (e) => {
    e.preventDefault();
    if (!qForm.name.trim() || !qForm.description.trim()) {
      alert('Please enter your name and job description.');
      return;
    }

    setSendingQuote(true);
    try {
      // Use the actual bucket name you created in Supabase:
      const BUCKET = 'quotes'; // <- if your bucket is "quote_uploads", change this

      const uploadedUrls = [];
      for (const [i, file] of qForm.files.entries()) {
        const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const uniq = `${Date.now()}-${i}-${Math.random().toString(36).slice(2,8)}`;
        const path = `${p?.slug || 'unknown'}/${uniq}.${ext}`;

        console.log('[UPLOAD] start', {
          bucket: BUCKET,
          path,
          name: file.name,
          type: file.type,
          sizeKB: Math.round((file.size || 0) / 1024),
        });

        const { data, error } = await supabase
          .storage
          .from(BUCKET)
          .upload(path, file, {
            upsert: false,
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
          });

        if (error) {
          console.error('[UPLOAD] failed', { path, error });
          const hint =
            error.status === 404 ? 'Bucket name is wrong or missing.'
          : error.status === 401 || error.status === 403 ? 'Storage policy/RLS is blocking uploads.'
          : error.status === 409 ? 'Filename already exists; try again.'
          : error.status === 413 ? 'File too large.'
          : 'See console for details.';
          alert(`Photo upload failed (${error.status}). ${hint}`);
          throw error;
        }

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (pub?.publicUrl) {
          console.log('[UPLOAD] success', { path, publicUrl: pub.publicUrl });
          uploadedUrls.push(pub.publicUrl);
        } else {
          console.warn('[UPLOAD] no publicUrl (bucket may not be Public)', { path });
        }
      }

      // Save the request
      await supabase.from('quotes').insert({
        profile_slug: p?.slug || null,
        business_name: p?.name || null,
        to_email: p?.email || null,
        customer_name: qForm.name,
        customer_phone: qForm.phone,
        customer_email: qForm.email,
        description: qForm.description,
        image_urls: uploadedUrls,
      });
      // Tell the API to email the business (JSON path your route.js expects)
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: p?.email || 'YOUR-TEST-EMAIL@example.com',
            businessName: p?.name || null,
            profileSlug: p?.slug || null,
            name: qForm.name,
            phone: qForm.phone,
            email: qForm.email,
            description: qForm.description,
            imageUrls: uploadedUrls,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Email API error:', err);
        }
      } catch (e) {
        console.error('Email send failed:', e);
      }

      alert('Thanks! Your quote request was sent, we will get back to you very soon.');
      setQuoteOpen(false);
      setQForm({ name: '', phone: '', email: '', description: '', files: [] });
    } catch (err) {
      console.error('Quote submit error:', err);
      alert('Could not send your request. Please try again.');
    } finally {
      setSendingQuote(false);
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
/* Hide Save FAB on desktop/laptop; keep it on mobile */
@media (min-width: 900px){
  .save-fab { display: none !important; }
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
          {(callHref || waHref || emailHref) && (
            <button
              type="button"
              onClick={() => setContactsOpen(true)}
              style={{ ...btnBaseStyle, ...btnPrimaryStyle }}
              title="Contacts"
            >
              Contacts
            </button>
          )}

          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            style={{ ...btnBaseStyle, ...btnNeutralStyle }}
          >
            Quote
          </button>

          <button
            type="button"
            onClick={handleShare}
            style={{ ...btnBaseStyle, border:'1px solid var(--social-border)', background:'transparent', color:'var(--text)' }}
          >
            Share
          </button>
        </div>

        {/* Save (bookmark) – small, top-right */}
        <button
          type="button"
          onClick={() => setChooserOpen(true)}
          aria-label="Save"
          title="Save"
          className="save-fab"  //added to show it on mobile only
          style={saveBtnFabStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#08101e" aria-hidden="true">
            <path d="M6 3a1 1 0 0 0-1 1v17l7-4 7 4V4a1 1 0 0 0-1-1H6z"/>
          </svg>
          
          
        </button>

        {contactsOpen && (
          <div
            style={modalOverlayStyle}
            onClick={() => setContactsOpen(false)}
            aria-modal="true"
            role="dialog"
          >
            <section
              style={modalCardStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setContactsOpen(false)}
                style={modalCloseBtnStyle}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>

              <h2 style={h2Style}>Contacts</h2>

              <div style={modalListStyle}>
                {callHref && (
                  <a href={callHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                    Phone {p?.phone ? `— ${p.phone}` : ''}
                  </a>
                )}

                {waHref && (
                  <a href={waHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                    WhatsApp {p?.whatsapp ? `— ${p.whatsapp}` : ''}
                  </a>
                )}

                {contactEmail && (
                  <a href={emailHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                    Email {contactEmail}
                  </a>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* QUOTE MODAL */}
      {quoteOpen && (
        <div
          style={modalOverlayStyle}
          onClick={(e) => e.target === e.currentTarget && setQuoteOpen(false)}
        >
          <form onSubmit={submitQuote} style={modalCardStyle}>
            <button
              type="button"
              onClick={() => setQuoteOpen(false)}
              aria-label="Close"
              style={modalCloseBtnStyle}
            >
              ×
            </button>

            <h2 style={h2Style}>Request a Quote</h2>

            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ opacity: .85 }}>Your name</span>
                <input
                  name="name"
                  value={qForm.name}
                  onChange={onQChange}
                  required
                  style={btnBaseStyle}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ opacity: .85 }}>Phone</span>
                <input
                  name="phone"
                  value={qForm.phone}
                  onChange={onQChange}
                  style={btnBaseStyle}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ opacity: .85 }}>Email</span>
                <input
                  type="email"
                  name="email"
                  value={qForm.email}
                  onChange={onQChange}
                  style={btnBaseStyle}
                  placeholder="you@example.com"
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ opacity: .85 }}>Job description</span>
                <textarea
                  name="description"
                  value={qForm.description}
                  onChange={onQChange}
                  rows={4}
                  required
                  style={{ ...btnBaseStyle, height: 'auto' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ opacity: .85 }}>Photos (up to 10)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onQuoteFiles}
                />
                <div style={{ fontSize: 12, opacity: .7 }}>
                  {qForm.files.length} / 10 selected
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="submit" disabled={sendingQuote} style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>
                {sendingQuote ? 'Sending…' : 'Send Request'}
              </button>
              <button type="button" onClick={() => setQuoteOpen(false)} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTACTS POPUP */}
      {contactsOpen && (
        <div style={modalOverlayStyle} onClick={() => setContactsOpen(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <Card title="Contacts" wide>
              <div style={{ display:'grid', gap:10 }}>
                {callHref && (
                  <a href={callHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                    Phone{p?.phone ? `: ${p.phone}` : ''}
                  </a>
                )}
                {waHref && (
                  <a href={waHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                    WhatsApp{p?.whatsapp ? `: ${p.whatsapp}` : ''}
                  </a>
                )}
                {emailHref && (
                  <a href={emailHref} style={{ ...btnBaseStyle, ...btnNeutralStyle }}>
                    Email{contactEmail ? `: ${contactEmail}` : ''}
                  </a>
                )}
                {!callHref && !waHref && !emailHref && (
                  <div style={{ opacity:.7 }}>No contact methods provided yet.</div>
                )}
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
                <button
                  type="button"
                  onClick={() => setContactsOpen(false)}
                  style={{ ...btnBaseStyle, border:'1px solid var(--social-border)', background:'transparent', color:'var(--text)' }}
                >
                  Close
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SOCIAL */}
      {(fb || ig || tk || xx || yt || wb) && (
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
          {wb && (
          <a href={wb} target="_blank" rel="noopener noreferrer" aria-label="Website" title="Website" style={socialBtnStyle}>
            {ICONS.website}
           </a>
          )}

        </div>
      )}

      {/* GRID (reordered after social) */}
      <div style={grid2Style}>
        {/* ABOUT */}
        <Card title="About Us">
          <p style={bodyP}>
            {p.about && p.about.trim().length > 0
              ? p.about
              : (services[0]
                  ? `${services[0]}. Reliable, friendly and affordable. Free quotes, no hidden fees.`
                  : 'Reliable, friendly and affordable. Free quotes, no hidden fees.')}
          </p>
        </Card>

        {/* OTHER TRADES (optional) */}
        {toList(p?.other_trades).length > 0 && (
          <Card title="Our Trades">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {toList(p.other_trades).map((t, i) => (<span key={i} style={chipStyle}>{t}</span>))}
            </div>
          </Card>
        )}

        {/* SERVICES */}
        <Card title="Our Services">
          {services.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {services.map((s, i) => (<span key={i} style={chipStyle}>{s}</span>))}
            </div>
          ) : (<div style={{ opacity: 0.7 }}>No services listed yet.</div>)}
        </Card>

        {/* PRICES */}
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

        {/* LOCATION (optional) */}
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

        {/* AREAS */}
        <Card title="Areas we cover">
          {areas.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {areas.map((a, i) => (<span key={i} style={chipStyle}>{a}</span>))}
            </div>
          ) : (<div style={{ opacity: 0.7 }}>No areas listed yet.</div>)}
        </Card>

        {/* HOURS */}
        <Card title="Hours">
          <div style={{ opacity: 0.95, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            { (p?.hours && p.hours.trim()) || 'Mon–Sat 08:00–18:00' }
          </div>
        </Card>

        {/* OTHER INFO (optional, wide) */}
        {p.other_info && p.other_info.trim().length > 0 && (
          <Card title="Other useful information" wide>
            <p style={{ ...bodyP, opacity: 0.95 }}>{p.other_info}</p>
          </Card>
        )}

        {/* GALLERY (unchanged, still wide at the end) */}
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

      {contactsOpen && (
        <div
          style={modalOverlayStyle}
          onClick={() => setContactsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contactsTitle"
        >
          <section
            style={modalCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setContactsOpen(false)}
              style={modalCloseBtnStyle}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            <h2 id="contactsTitle" style={h2Style}>Contacts</h2>

            <div style={modalListStyle}>
              {callHref && (
                <a href={callHref} style={{ ...btnBaseStyle, ...btnNeutralStyle, justifyContent:'center' }}>
                  Call {p?.phone ? `(${p.phone})` : ''}
                </a>
              )}
              {waHref && (
                <a href={waHref} style={{ ...btnBaseStyle, ...btnNeutralStyle, justifyContent:'center' }}>
                  WhatsApp {p?.whatsapp ? `(${p.whatsapp})` : ''}
                </a>
              )}
              {emailHref && (
                <a href={emailHref} style={{ ...btnBaseStyle, ...btnNeutralStyle, justifyContent:'center' }}>
                  Email {contactEmail ? `(${contactEmail})` : ''}
                </a>
              )}

              {!callHref && !waHref && !emailHref && (
                <div style={{ opacity:.75 }}>No contact methods available yet.</div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* SAVE CHOOSER */}
      {chooserOpen && (
        <div style={modalOverlayStyle} onClick={() => setChooserOpen(false)} aria-modal="true" role="dialog">
          <section style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setChooserOpen(false)}
              style={modalCloseBtnStyle}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            <h2 style={h2Style}>Save this page</h2>
            <div style={{ display:'grid', gap:10, marginTop:8 }}>
              <button type="button" style={{ ...btnBaseStyle, ...btnPrimaryStyle, justifyContent:'center' }} onClick={saveVCard}>
                Save contact 
              </button>

              <button
                type="button"
                onClick={addToHome}
                style={{ ...btnBaseStyle, ...btnNeutralStyle, justifyContent:'center' }}
              >
                Add to Home Screen
              </button>
            </div>
          </section>
        </div>
      )}

      {/* iOS Add-to-Home instructions */}
      {iosTipOpen && (
        <div style={modalOverlayStyle} onClick={() => setIosTipOpen(false)} aria-modal="true" role="dialog">
          <section style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIosTipOpen(false)}
              style={modalCloseBtnStyle}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            <h2 style={h2Style}>Add to Home Screen (iPhone/iPad)</h2>
            <ol style={{ margin:'8px 0 0', padding:'0 0 0 18px', lineHeight:1.6 }}>
              <li>Tap the <b>Share</b> icon in Safari.</li>
              <li>Scroll and choose <b>Add to Home Screen</b>.</li>
              <li>Confirm the name and tap <b>Add</b>.</li>
            </ol>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
              <button
                type="button"
                onClick={() => setIosTipOpen(false)}
                style={{ ...btnBaseStyle, border:'1px solid var(--social-border)', background:'transparent', color:'var(--text)' }}
              >
                Got it
              </button>
            </div>
          </section>
        </div>
      )}

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
  position: 'relative', // for the floating Save button
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

const modalCardStyle = {
  ...cardStyle,
  width: '100%',
  maxWidth: 520,
  position: 'relative',
};

const modalCloseBtnStyle = {
  position: 'absolute',
  top: 10,
  right: 10,
  border: '1px solid var(--social-border)',
  background: 'transparent',
  color: 'var(--text)',
  borderRadius: 10,
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
};

const modalListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 8,
};

const modalOverlayStyle = {
  position:'fixed', inset:0,
  background:'rgba(0,0,0,.4)',
  backdropFilter:'blur(2px)',
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:16, zIndex:50
};

/* small floating Save button */
const saveBtnFabStyle = {
  position: 'absolute',
  top: 2,
  right: 2,
  width: 30,
  height: 30,
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'linear-gradient(135deg,var(--btn-primary-1),var(--btn-primary-2))',
  color: '#08101e',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};
