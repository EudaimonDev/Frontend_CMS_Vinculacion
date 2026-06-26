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

/** Gradiente por defecto del bloque Titulo (hero) en el editor visual. */
export const HERO_DEFAULT_GRADIENT = 'linear-gradient(135deg, #1e3a5f 0%, #1e5fa8 100%)';

export function defaultHeroColorData(): Record<string, string> {
  return {
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    ctaBackgroundColor: '#ffffff',
    ctaTextColor: '#1e5fa8',
  };
}

export function defaultTextColorData(): Record<string, string> {
  return {
    backgroundColor: '#ffffff',
    titleColor: '#1e293b',
    textColor: '#334155',
  };
}

export function defaultCardsColorData(): Record<string, string> {
  return {
    backgroundColor: '#ffffff',
    titleColor: '#0f172a',
    subtitleColor: '#64748b',
    cardBackgroundColor: '#f8fafc',
    cardTextColor: '#64748b',
    cardBorderColor: '#e2e8f0',
  };
}

export function heroBackgroundStyle(data: Record<string, unknown>): string {
  if (data['backgroundImage']) return '';
  const solid = cssColor(data['backgroundColor'] as string | undefined);
  if (solid) return `background-color:${solid};`;
  return `background:${HERO_DEFAULT_GRADIENT};`;
}

export function ctaVariantColors(variant?: string): {
  background: string;
  buttonText: string;
  className: string;
} {
  if (variant === 'accent') {
    return { background: '#0d9488', buttonText: '#0d9488', className: 'article-block--cta-accent' };
  }
  return { background: '#1e5fa8', buttonText: '#1e5fa8', className: 'article-block--cta-primary' };
}
