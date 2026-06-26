export type CatalogStatus = 'active' | 'draft' | 'archived';
export type CatalogVisibility = 'public' | 'private';
export type CatalogTheme = 'blue' | 'teal' | 'sand' | 'rose';
export type CatalogItemStatus = 'active' | 'inactive';

export interface CatalogItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  status: CatalogItemStatus;
  featured: boolean;
  tags: string[];
  updatedAt: Date;
}

export interface Catalog {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CatalogStatus;
  visibility: CatalogVisibility;
  theme: CatalogTheme;
  itemLabel: string;
  items: CatalogItem[];
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
}

export interface CatalogFormData {
  name: string;
  slug: string;
  description: string;
  status: CatalogStatus;
  visibility: CatalogVisibility;
  theme: CatalogTheme;
  itemLabel: string;
  imageUrl?: string;
}

export interface CatalogItemFormData {
  title: string;
  slug: string;
  category: string;
  summary: string;
  status: CatalogItemStatus;
  featured: boolean;
  tags: string[];
}
