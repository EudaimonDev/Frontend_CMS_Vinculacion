import { PageBlock } from '../../../frontoffice/core/models/block.model';

export type PageStatus = 'published' | 'draft' | 'archived';

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  description?: string;
  categoryId?: number | null | undefined;
  featured?: boolean;
  readingTime?: number;
  blocks: PageBlock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PageFormData {
  title: string;
  slug: string;
  status: PageStatus;
  description?: string;
  categoryId?: number | null | undefined;
    featured?: boolean;  // ← agregar esto
}
