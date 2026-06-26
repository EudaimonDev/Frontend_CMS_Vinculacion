export interface ColorFieldDef {
  key: string;
  label: string;
  default?: string;
}

export const HERO_COLOR_FIELDS: ColorFieldDef[] = [
  { key: 'backgroundColor', label: 'Color de fondo', default: '#1e5fa8' },
  { key: 'titleColor', label: 'Color del título', default: '#ffffff' },
  { key: 'subtitleColor', label: 'Color del subtítulo', default: '#ffffff' },
  { key: 'ctaBackgroundColor', label: 'Color fondo botón', default: '#ffffff' },
  { key: 'ctaTextColor', label: 'Color texto botón', default: '#1e5fa8' },
];

export const TEXT_COLOR_FIELDS: ColorFieldDef[] = [
  { key: 'backgroundColor', label: 'Color de fondo', default: '#ffffff' },
  { key: 'titleColor', label: 'Color del título', default: '#1e293b' },
  { key: 'textColor', label: 'Color del texto', default: '#334155' },
];

export const CARDS_COLOR_FIELDS: ColorFieldDef[] = [
  { key: 'backgroundColor', label: 'Color de fondo sección', default: '#ffffff' },
  { key: 'titleColor', label: 'Color del título', default: '#0f172a' },
  { key: 'subtitleColor', label: 'Color del subtítulo', default: '#64748b' },
  { key: 'cardBackgroundColor', label: 'Color fondo tarjeta', default: '#f8fafc' },
  { key: 'cardTextColor', label: 'Color texto tarjeta', default: '#64748b' },
  { key: 'cardBorderColor', label: 'Color borde tarjeta', default: '#e2e8f0' },
];

export function applyColorPatch(
  data: Record<string, unknown>,
  key: string,
  value: string,
): Record<string, unknown> {
  const next = { ...data };
  if (!value?.trim()) {
    delete next[key];
  } else {
    next[key] = value.trim();
  }
  return next;
}

export function cssColor(value?: string, fallback?: string): string {
  const v = value?.trim();
  return v || fallback || '';
}
