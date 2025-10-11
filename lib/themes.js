// /lib/themes.js
// The single source of truth for theme keys + pretty labels.

// Existing 10
const BASE = [
  { value: 'deep-navy',     label: 'Deep Navy (dark)' },
  { value: 'ivory-ink',     label: 'Ivory Ink (light)' },
  { value: 'sandstone',     label: 'Sandstone (light)' },
  { value: 'porcelain-mint',label: 'Porcelain Mint (light)' },
  { value: 'ocean-teal',    label: 'Ocean Teal (dark)' },
  { value: 'sunset-peach',  label: 'Sunset Peach (light)' },
  { value: 'plum-noir',     label: 'Plum Noir (dark)' },
  { value: 'slate-sky',     label: 'Slate Sky (dark)' },
  { value: 'emerald-fog',   label: 'Emerald Fog (light)' },
  { value: 'charcoal-gold', label: 'Charcoal Gold (dark)' },
];

// New 10 — rich, high-contrast sets already supported by your public page CSS
const EXTRA = [
  { value: 'crimson-dusk',  label: 'Crimson Dusk (dark)' },
  { value: 'amber-glow',    label: 'Amber Glow (light)' },
  { value: 'azure-lagoon',  label: 'Azure Lagoon (light)' },
  { value: 'noir-rose',     label: 'Noir Rose (dark)' },
  { value: 'obsidian-blue', label: 'Obsidian Blue (dark)' },
  { value: 'copper-sunset', label: 'Copper Sunset (light)' },
  { value: 'moss-sage',     label: 'Moss Sage (light)' },
  { value: 'violet-aurora', label: 'Violet Aurora (dark)' },
  { value: 'steel-wave',    label: 'Steel Wave (dark)' },
  { value: 'pearl-lilac',   label: 'Pearl Lilac (light)' },
];

export const THEME_OPTIONS = [...BASE, ...EXTRA];

// O(1) validator used by both editor and public page
const SET = new Set(THEME_OPTIONS.map(o => o.value));
export const isValidTheme = (v) => SET.has(String(v || '').trim());
