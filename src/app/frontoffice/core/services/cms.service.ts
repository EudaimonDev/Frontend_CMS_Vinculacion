import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Article, ArticleCategory } from '../models/article.model';
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
