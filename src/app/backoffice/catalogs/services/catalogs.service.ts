import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Catalog,
  CatalogEstado,
  CatalogFormData,
  CatalogItem,
  mapEstadoFromApi,
  mapEstadoToApi,
  SubCategory,
} from '../models/catalog.model';
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
      activeCatalogs: catalogs.filter(c => c.estado === 'publicado').length,
      totalItems: items.length,
      featuredItems: items.filter(i => i.featured).length
    };
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.http
      .get<any[]>(`${this.api}/Categories/admin`)
      .subscribe(categories => {
        this._catalogs.set(categories.map(c => this.mapCategoryToCatalog(c)));
      });
  }

  getByIdFromApi(id: string) {
    return this.http.get<any>(`${this.api}/Categories/admin/${id}`);
  }

  getById(id: string) {
    return computed(() => this._catalogs().find(c => c.id === id) ?? null);
  }

  create(data: CatalogFormData) {
    const body = this.toApiBody(data);
    return this.http.post<any>(`${this.api}/Categories/admin`, body);
  }

  update(id: string, data: CatalogFormData) {
    const body = this.toApiBody(data);
    return this.http.put<any>(`${this.api}/Categories/admin/${id}`, body);
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
      description: source.description,
      isPublicVisible: source.visibility === 'public',
      estado: mapEstadoToApi('borrador'),
      imageUrl: source.imageUrl ?? null,
      subCategories: source.subCategories.map(sub => ({
        name: sub.name,
        description: sub.description,
        estado: mapEstadoToApi(sub.estado),
      })),
    };

    this.http.post<any>(`${this.api}/Categories/admin`, body).subscribe(cat => {
      this._catalogs.update(cs => [this.mapCategoryToCatalog(cat), ...cs]);
    });

    return null;
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/Categories/admin/${id}`).pipe(
      tap(() => {
        this._catalogs.update(cs => cs.filter(c => c.id !== id));
      }),
    );
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

  private toApiBody(data: CatalogFormData) {
    return {
      name: data.name,
      description: data.description,
      isPublicVisible: data.visibility === 'public',
      estado: mapEstadoToApi(data.estado),
      imageUrl: data.imageUrl ?? null,
      subCategories: (data.subCategories ?? [])
        .filter(sub => sub.name?.trim())
        .map(sub => ({
          subCategoryId: sub.subCategoryId ?? null,
          name: sub.name.trim(),
          description: sub.description?.trim() || null,
          estado: mapEstadoToApi(sub.estado),
        })),
    };
  }

  mapCategoryToCatalog(cat: any): Catalog {
    return {
      id: cat.categoryId.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      estado: mapEstadoFromApi(cat.estado),
      visibility: cat.isPublicVisible ? 'public' : 'private',
      theme: 'blue',
      itemLabel: 'Artículo',
      items: Array(cat.articleCount ?? 0).fill({}),
      subCategories: (cat.subCategories ?? []).map((sub: any) => this.mapSubCategory(sub)),
      imageUrl: cat.imageUrl ?? undefined,
      isActive: cat.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  mapSubCategory(sub: any): SubCategory {
    return {
      subCategoryId: sub.subCategoryId,
      name: sub.name ?? '',
      description: sub.description ?? '',
      estado: mapEstadoFromApi(sub.estado),
      slug: sub.slug,
      isActive: sub.isActive,
    };
  }
}
