import { BlockAlign, HeroSubtitleSize, HeroTitleLevel } from '../../../frontoffice/core/models/block.model';

const HERO_TITLE_STYLES: Record<HeroTitleLevel, string> = {
  h1: 'overflow-wrap:anywhere;word-break:break-word;margin:0 0 0.5rem;font-size:clamp(2rem,4vw,3rem);font-weight:800;line-height:1.15',
  h2: 'overflow-wrap:anywhere;word-break:break-word;margin:0 0 0.5rem;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;line-height:1.2',
  h3: 'overflow-wrap:anywhere;word-break:break-word;margin:0 0 0.5rem;font-size:clamp(1.25rem,2.5vw,1.75rem);font-weight:700;line-height:1.25',
};

const HERO_SUBTITLE_SIZES: Record<HeroSubtitleSize, string> = {
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
};

export function normalizeHeroTitleLevel(level?: string): HeroTitleLevel {
  if (level === 'h2' || level === 'h3') return level;
  return 'h1';
}

export function normalizeHeroSubtitleSize(size?: string): HeroSubtitleSize {
  if (size === 'sm' || size === 'lg') return size;
  return 'md';
}

export function heroTitleTag(level?: string): HeroTitleLevel {
  return normalizeHeroTitleLevel(level);
}

export function heroTitleStyle(level?: string): string {
  return HERO_TITLE_STYLES[normalizeHeroTitleLevel(level)];
}

export function heroSubtitleFontSize(size?: string): string {
  return HERO_SUBTITLE_SIZES[normalizeHeroSubtitleSize(size)];
}

export function normalizeBlockAlign(align?: string): BlockAlign {
  if (align === 'left' || align === 'right') return align;
  return 'center';
}

export function imageAlignStyles(align?: string): { figure: string; img: string; caption: string } {
  const value = normalizeBlockAlign(align);
  if (value === 'left') {
    return {
      figure: 'text-align:left;',
      img: 'margin-left:0;margin-right:auto;',
      caption: 'text-align:left;',
    };
  }
  if (value === 'right') {
    return {
      figure: 'text-align:right;',
      img: 'margin-left:auto;margin-right:0;',
      caption: 'text-align:right;',
    };
  }
  return {
    figure: 'text-align:center;',
    img: 'margin-left:auto;margin-right:auto;',
    caption: 'text-align:center;',
  };
}
