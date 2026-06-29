import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Article, ArticleCategory, CategoryNav } from '../models/article.model';
import { Block } from '../models/block.model';
import { environment } from '../../../../environments/environment';

interface HomePage {
  id: string;
  slug: string;
  title: string;
  blocks: Block[];
}

@Injectable({ providedIn: 'root' })
export class CmsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getArticles(category?: ArticleCategory): Observable<Article[]> {
    const params: Record<string, string | number> = { page: 1, pageSize: 50 };
    if (category) params['categorySlug'] = category;

    return this.http
      .get<{ items: Article[]; total: number }>(`${this.api}/Articles`, { params })
      .pipe(map(res => {
        let articles = res.items;
        if (category) {
          articles = articles.filter(a => a.category === category);
        }
        return articles;
      }));
  }

  getRecent(count = 5): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.api}/Articles/recent`, { params: { count } });
  }

  getGallery(): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.api}/Articles/gallery`);
  }

  getArticleById(id: string): Observable<Article | undefined> {
    return this.http
      .get<Article>(`${this.api}/Articles/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<CategoryNav | undefined> {
    return this.fetchPublicCategories().pipe(
      map(categories => this.mapCategoryNav(categories.find(c => c.slug === slug))),
    );
  }

  getCategoryNav(categoryId: number): Observable<CategoryNav | undefined> {
    return this.fetchPublicCategories().pipe(
      map(categories => this.mapCategoryNav(categories.find(c => c.categoryId === categoryId))),
    );
  }

  private fetchPublicCategories() {
    return this.http.get<Array<{
      categoryId: number;
      name: string;
      slug: string;
      imageUrl?: string;
      subCategories?: Array<{
        subCategoryId: number;
        name: string;
        slug: string;
        isActive: boolean;
      }>;
    }>>(`${this.api}/Categories`);
  }

  private mapCategoryNav(
    category?: {
      categoryId: number;
      name: string;
      slug: string;
      imageUrl?: string;
      subCategories?: Array<{
        subCategoryId: number;
        name: string;
        slug: string;
        isActive: boolean;
      }>;
    },
  ): CategoryNav | undefined {
    if (!category) return undefined;

    return {
      categoryId: category.categoryId,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      articles: [],
      subCategories: (category.subCategories ?? [])
        .filter(sub => sub.isActive)
        .map(sub => ({
          subCategoryId: sub.subCategoryId,
          name: sub.name,
          slug: sub.slug,
          articles: [],
        })),
    };
  }

  getArticlesByCategoryId(categoryId: number): Observable<Article[]> {
    return this.http
      .get<{ items: Article[]; total: number }>(`${this.api}/Articles`, {
        params: { page: 1, pageSize: 100, categoryId },
      })
      .pipe(map(res => res.items));
  }

  getHomePage(): Observable<HomePage> {
    return this.getArticles().pipe(
      map(articles => ({
        id: 'home',
        slug: '/',
        title: 'Inicio',
        blocks: [
          {
            id: 'b1',
            type: 'hero',
            data: {
              tag: 'Publicación Destacada',
              article: articles.find(a => a.featured) ?? articles[0],
            },
          },
          {
            id: 'b2',
            type: 'cards-grid',
            data: {
              title: 'Publicaciones Recientes',
              articles: articles.filter(a => !a.featured).slice(0, 6),
            },
          },
          {
            id: 'b3',
            type: 'gallery-grid',
            data: {
              title: 'Galería de Contenidos',
              items: [],
            },
          },
        ] as Block[],
      }))
    );
  }
}
