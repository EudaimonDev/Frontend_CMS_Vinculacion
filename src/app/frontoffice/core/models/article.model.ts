export type ArticleCategory = 'investigacion' | 'cultura' | 'tecnologia' | 'eventos' | 'proyectos';

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  categoryIds?: number[];
  categories?: string[];
  subCategoryId?: number | null;
  subCategoryName?: string | null;
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

export interface CategoryNavArticle {
  id: string;
  title: string;
}

export interface CategoryNavSubCategory {
  subCategoryId: number;
  name: string;
  slug: string;
  articles: CategoryNavArticle[];
}

export interface CategoryNav {
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
  articles: CategoryNavArticle[];
  subCategories: CategoryNavSubCategory[];
}
