export type ArticleCategory = 'investigacion' | 'cultura' | 'tecnologia' | 'eventos' | 'proyectos';

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  date: string;
  paragraphs: string[];
  readingTime: number;
  emoji: string;
  excerpt?: string;
  featured?: boolean;
  imageUrl?: string;
  contentHtml?: string;
  blocksJson?: string;
}
