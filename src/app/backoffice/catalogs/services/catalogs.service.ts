import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Catalog, CatalogFormData, CatalogItem } from '../models/catalog.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CatalogsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private readonly _catalogs = signal<Catalog[]>([]);
  readonly catalogs = this._catalogs.asReadonly();

  readonly metrics = computed(() => {
    const catalogs = this._catalogs();
    const items = catalogs.flatMap(c => c.items);
    return {
      totalCatalogs: catalogs.length,
      activeCatalogs: catalogs.filter(c => c.status === 'active').length,
      totalItems: items.length,
      featuredItems: items.filter(i => i.featured).length
    };
  });

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http
      .get<any[]>(`${this.api}/Categories/admin`)
      .subscribe(categories => {
        this._catalogs.set(categories.map(this.mapCategoryToCatalog));
      });
  }

  getById(id: string) {
    return computed(() => this._catalogs().find(c => c.id === id) ?? null);
  }

  create(data: CatalogFormData, items: CatalogItem[] = []): Catalog {
    const body = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      isPublicVisible: data.visibility === 'public',
      imageUrl: data.imageUrl ?? null
    };

    const temp: Catalog = {
      id: Date.now().toString(),
      ...data,
      items,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.http.post<any>(`${this.api}/Categories/admin`, body).subscribe(cat => {
      this._catalogs.update(cs => [this.mapCategoryToCatalog(cat), ...cs]);
    });

    return temp;
  }

  update(id: string, data: Partial<CatalogFormData>): void {
    const current = this._catalogs().find(c => c.id === id);
    if (!current) return;

    const body = {
      name: data.name ?? current.name,
      slug: data.slug ?? current.slug,
      description: data.description ?? current.description,
      imageUrl: data.imageUrl ?? null,
      isPublicVisible: (data.visibility ?? current.visibility) === 'public'
    };

    this.http.put(`${this.api}/Categories/admin/${id}`, body).subscribe(() => {
      this._catalogs.update(cs =>
        cs.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date() } : c)
      );
    });
  }

  replaceItems(id: string, items: CatalogItem[]): void {
    this._catalogs.update(cs =>
      cs.map(c => c.id === id ? { ...c, items, updatedAt: new Date() } : c)
    );
  }

  duplicate(id: string): Catalog | null {
    const source = this._catalogs().find(c => c.id === id);
    if (!source) return null;

    const body = {
      name: `${source.name} (copia)`,
      slug: `${source.slug}-copia`,
      description: source.description,
      isPublicVisible: source.visibility === 'public'
    };

    const now = new Date();
    const duplicated: Catalog = {
      ...source,
      id: Date.now().toString(),
      name: `${source.name} (copia)`,
      slug: `${source.slug}-copia`,
      status: 'draft',
      items: [],
      createdAt: now,
      updatedAt: now
    };

    this.http.post<any>(`${this.api}/Categories/admin`, body).subscribe(cat => {
      this._catalogs.update(cs => [this.mapCategoryToCatalog(cat), ...cs]);
    });

    return duplicated;
  }

  delete(id: string): void {
    this.http.delete(`${this.api}/Categories/admin/${id}`).subscribe(() => {
      this._catalogs.update(cs => cs.filter(c => c.id !== id));
    });
  }

  slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'nuevo-elemento';
  }

  private mapCategoryToCatalog(cat: any): Catalog {
    return {
      id: cat.categoryId.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      status: cat.isPublicVisible ? 'active' : 'draft',
      visibility: cat.isPublicVisible ? 'public' : 'private',
      theme: 'blue',
      itemLabel: 'Artículo',
      items: Array(cat.articleCount ?? 0).fill({}),
      imageUrl: cat.imageUrl ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
