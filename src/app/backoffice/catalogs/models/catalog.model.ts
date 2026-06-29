export type CatalogEstado = 'borrador' | 'publicado' | 'archivado';
export type CatalogVisibility = 'public' | 'private';
export type CatalogTheme = 'blue' | 'teal' | 'sand' | 'rose';
export type CatalogItemStatus = 'active' | 'inactive';

/** Valores numéricos alineados con EnumEstado del backend. */
export const CATALOG_ESTADO_VALUES: Record<CatalogEstado, number> = {
  borrador: 0,
  publicado: 1,
  archivado: 2,
};

export const CATALOG_ESTADO_LABELS: Record<CatalogEstado, string> = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  archivado: 'Archivado',
};

export interface SubCategory {
  subCategoryId?: number;
  name: string;
  description: string;
  estado: CatalogEstado;
  slug?: string;
  isActive?: boolean;
}

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
  estado: CatalogEstado;
  visibility: CatalogVisibility;
  theme: CatalogTheme;
  itemLabel: string;
  items: CatalogItem[];
  subCategories: SubCategory[];
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CatalogFormData {
  name: string;
  description: string;
  estado: CatalogEstado;
  visibility: CatalogVisibility;
  theme: CatalogTheme;
  itemLabel: string;
  imageUrl?: string;
  subCategories: SubCategory[];
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

export function mapEstadoFromApi(value: number | string | undefined): CatalogEstado {
  if (value === 1 || value === 'Publicado' || value === 'publicado') return 'publicado';
  if (value === 2 || value === 'Archivado' || value === 'archivado') return 'archivado';
  return 'borrador';
}

export function mapEstadoToApi(estado: CatalogEstado): number {
  return CATALOG_ESTADO_VALUES[estado];
}
