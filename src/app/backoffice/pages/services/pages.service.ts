import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, PageFormData } from '../models/page.model';
import { PageBlock } from '../../../frontoffice/core/models/block.model';
import { environment } from '../../../../environments/environment';
import { blocksToHtml as generateBlocksHtml } from '../../shared/utils/block-html.util';

@Injectable({ providedIn: 'root' })
export class PagesService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private _categories = signal<any[]>([]);

  private _pages = signal<Page[]>([]);
  readonly pages = this._pages.asReadonly();

  constructor() {
  this.http.get<any[]>(`${this.api}/Categories`).subscribe(cats => {
    this._categories.set(cats);
    this.loadAll(); // cargar páginas DESPUÉS de tener categorías
  });
}

  getCanvaEmbedUrl(url: string): string | null {
    if (!url) return null;
    const match = url.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    return `https://www.canva.com/design/${match[1]}/view?embed`;
  }

  private loadAll(): void {
    this.http
      .get<any>(`${this.api}/Articles/admin`, { params: { page: 1, pageSize: 100 } })
      .subscribe(response => {
        const articles = Array.isArray(response) ? response : (response.items ?? []);
        this._pages.set(articles.map((a: any) => this.mapArticleToPage(a)));
      });
  }

  getById(id: string) {
    return computed(() => this._pages().find(p => p.id === id) ?? null);
  }

  create(data: PageFormData): Page {
    const body = {
      title: data.title,
      slug: data.slug,
      contentHtml: '<p></p>',
      excerpt: data.description ?? '',
      emoji: '📄',
      readingTime: 1,
      featured: false,
      categoryIds: [] as number[]
    };

    this.http.post<any>(`${this.api}/Articles/admin`, body).subscribe(article => {
      this._pages.update(pages => [this.mapArticleToPage(article), ...pages]);
    });

    const temp: Page = {
      id: Date.now().toString(),
      ...data,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return temp;
  }

  update(id: string, data: Partial<PageFormData>): void {
    const current = this._pages().find(p => p.id === id);
    if (!current) return;

    const body = {
      title: data.title ?? current.title,
      slug: data.slug ?? current.slug,
      contentHtml: this.blocksToHtml(current.blocks),
      excerpt: data.description ?? current.description ?? '',
      emoji: '📄',
      readingTime: current.readingTime ?? 1,
      featured: current.featured ?? false,          // ← usar valor actual
      categoryIds: current.categoryId ? [current.categoryId] : [] as number[]
    };

    this.http.put(`${this.api}/Articles/admin/${id}`, body).subscribe(() => {
      this._pages.update(pages =>
        pages.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p)
      );
      if (data.status) {
        const statusId = data.status === 'published' ? 2 : 1;
        this.http.patch(`${this.api}/Articles/admin/${id}/status`, { statusId }).subscribe();
      }
    });
  }

  updateBlocks(id: string, blocks: PageBlock[], readingTime?: number): void {
  const current = this._pages().find(p => p.id === id);
  if (!current) return;

  const contentHtml = this.blocksToHtml(blocks);
  const blocksJson = JSON.stringify(blocks);
  const resolvedReadingTime = readingTime ?? current.readingTime ?? 1;

  const body = {
    title: current.title,
    slug: current.slug,
    contentHtml,
    blocksJson,
    excerpt: current.description ?? '',
    emoji: '📄',
    readingTime: resolvedReadingTime,
    featured: current.featured ?? false,
    categoryIds: current.categoryId ? [current.categoryId] : [] as number[]
  };

  this.http.put(`${this.api}/Articles/admin/${id}`, body).subscribe(() => {
    this._pages.update(pages =>
      pages.map(p =>
        p.id === id
          ? { ...p, blocks, readingTime: resolvedReadingTime, updatedAt: new Date() }
          : p
      )
    );
  });
}

  delete(id: string): void {
    this.http.delete(`${this.api}/Articles/admin/${id}`).subscribe(() => {
      this._pages.update(pages => pages.filter(p => p.id !== id));
    });
  }

  slugify(title: string): string {
    return (
      '/' +
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    );
  }

  blocksToHtml(blocks: PageBlock[]): string {
    return generateBlocksHtml(blocks);
  }

  private mapArticleToPage(article: any): Page {
  const parseDate = (val: any) => val ? new Date(val) : new Date();

  let blocks: PageBlock[] = [];

  if (article.blocksJson) {
    try {
      blocks = JSON.parse(article.blocksJson) as PageBlock[];
    } catch {
      blocks = [];
    }
  } else if (article.contentHtml) {
    blocks = [{
      id: 'text-1',
      type: 'text' as const,
      visible: true,
      order: 1,
      data: { title: article.title, html: article.contentHtml, align: 'left' }
    }];
  }
  // Resolver categoryId buscando por slug
  const matchedCat = this._categories().find(c => c.slug === article.category);
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    status: article.statusName === 'Published' ? 'published' :
            article.statusName === 'Draft' ? 'draft' : 'archived',
    description: article.excerpt ?? '',
     categoryId: matchedCat?.categoryId ?? null,
    featured: article.featured ?? false,  // ← agregar
    readingTime: article.readingTime ?? 1,
    blocks,
    createdAt: parseDate(article.createdAt),
    updatedAt: parseDate(article.updatedAt ?? article.createdAt)
  };
}
}
