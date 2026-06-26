import { Article } from './article.model';

export type BlockType = 'hero' | 'text' | 'image' | 'cards-grid' | 'cta' | 'gallery-grid' | 'video' | 'slides';

/** Colores opcionales por bloque; omitidos en JSON si no se configuran. */
export interface BlockColorProps {
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  textColor?: string;
  cardBackgroundColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
}

export type BlockAlign = 'left' | 'center' | 'right';
export type HeroTitleLevel = 'h1' | 'h2' | 'h3';
export type HeroSubtitleSize = 'sm' | 'md' | 'lg';

export interface BaseBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  order: number;
}

// ── Hero ──────────────────────────────────────
export interface HeroBlock extends BaseBlock {
  type: 'hero';
  data: {
    title: string;
    subtitle?: string;
    titleLevel?: HeroTitleLevel;
    subtitleSize?: HeroSubtitleSize;
    backgroundImage?: string;
    ctaLabel?: string;
    ctaRoute?: string;
    overlay?: boolean;
  } & BlockColorProps;
}

// ── Text ──────────────────────────────────────
export interface TextBlock extends BaseBlock {
  type: 'text';
  data: {
    title?: string;
    html: string;
    align?: 'left' | 'center' | 'right';
  } & BlockColorProps;
}

// ── Image ─────────────────────────────────────
export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    src: string;
    alt: string;
    caption?: string;
    fullWidth?: boolean;
    align?: BlockAlign;
    width?: number;
    height?: number;
    naturalWidth?: number;
    naturalHeight?: number;
  };
}

// ── Cards grid ────────────────────────────────
export interface CardItem {
  title: string;
  description: string;
  icon?: string;
  linkLabel?: string;
  linkRoute?: string;
}

export interface CardsGridBlock extends BaseBlock {
  type: 'cards-grid';
  data: {
    title?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4;
    cards: CardItem[];
  } & BlockColorProps;
}

// ── CTA ───────────────────────────────────────
export interface CtaBlock extends BaseBlock {
  type: 'cta';
  data: {
    title: string;
    description?: string;
    primaryLabel: string;
    primaryRoute: string;
    secondaryLabel?: string;
    secondaryRoute?: string;
    variant?: 'primary' | 'accent';
  };
}

// ── Video ─────────────────────────────────────
export interface VideoBlock extends BaseBlock {
  type: 'video';
  data: {
    url: string;
    title?: string;
  };
}

// ── Slides (Canva) ────────────────────────────
export interface SlidesBlock extends BaseBlock {
  type: 'slides';
  data: {
    title?: string;
    canvaUrl: string;
  };
}

// ── Gallery ───────────────────────────────────
export interface GalleryBlock extends BaseBlock {
  type: 'gallery-grid';
  data: {
    title: string;
    items: GalleryItem[];
  };
}

// ── Unión discriminada ────────────────────────
export type PageBlock =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | CardsGridBlock
  | CtaBlock
  | GalleryBlock
  | VideoBlock
  | SlidesBlock;

export interface Block {
  id: string;
  type: BlockType;
  data:
    | HeroBlockData
    | CardsGridBlockData
    | GalleryBlockData
    | TextBlockData
    | ImageBlockData
    | CtaBlockData
    | VideoBlockData;
}

export interface HeroBlockData {
  article: Article;
  tag?: string;
}

export interface CardsGridBlockData {
  title: string;
  articles: Article[];
}

export interface GalleryBlockData {
  title: string;
  items: GalleryItem[];
}

export interface GalleryItem {
  id: string;
  label: string;
  emoji: string;
  color: 'green' | 'pink' | 'blue' | 'amber';
}

export interface TextBlockData {
  content: string;
}

export interface ImageBlockData {
  src: string;
  alt: string;
  caption?: string;
  align?: BlockAlign;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface CtaBlockData {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface VideoBlockData {
  url: string;
  title?: string;
}
