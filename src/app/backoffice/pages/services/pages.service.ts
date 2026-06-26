import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page, PageFormData } from '../models/page.model';
import { PageBlock } from '../../../frontoffice/core/models/block.model';
import { environment } from '../../../../environments/environment';

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

  blocksToHtml(blocks: any[]): string {
    const textContain =
      'max-width:100%;overflow-wrap:anywhere;word-break:break-word;overflow-x:hidden;box-sizing:border-box';
    const heroTitleStyle =
      'overflow-wrap:anywhere;word-break:break-word;margin:0 0 0.5rem;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;line-height:1.2';

    return blocks
      .filter((b: any) => b.visible)
      .sort((a: any, b: any) => a.order - b.order)
      .map((b: any) => {
        const data = b.data;
        switch (b.type) {
          case 'text': {
            const align = data.align ?? 'left';
            const wrapStyles = [
              textContain,
              'display:block',
              'width:100%',
              'max-width:860px',
              'margin:0 auto',
              'padding:3rem 2rem',
              'box-sizing:border-box',
              `text-align:${align}`,
              data.backgroundColor ? `background-color:${data.backgroundColor}` : '',
              data.textColor ? `color:${data.textColor}` : '',
            ].filter(Boolean).join(';');
            const titleStyle = [
              data.titleColor ? `color:${data.titleColor}` : '',
              'overflow-wrap:anywhere;word-break:break-word',
              'font-size:1.875rem;font-weight:700;margin:0 0 1rem',
            ].filter(Boolean).join(';');
            const titleHtml = data.title
              ? `<h2 style="${titleStyle}">${data.title}</h2>`
              : '';
            const body = data.html ?? '';
            return `<div class="article-block article-block--text" style="${wrapStyles}">${titleHtml}${body}</div>`;
          }
          case 'video': {
            const videoId = data.url?.match(
              /(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/
            )?.[1];
            if (!videoId) return '';
            const titleHtml = data.title
              ? `<h3 class="video-embed__title" style="margin:1rem 0 0;font-size:1.125rem;font-weight:600;color:#1e293b;text-align:center;line-height:1.4">${data.title}</h3>`
              : '';
            return `<div class="article-block article-block--video" style="display:block;width:70%;max-width:70%;margin:2rem auto;padding:0 1rem;box-sizing:border-box">
              <div class="video-embed" style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000">
                <iframe src="https://www.youtube.com/embed/${videoId}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
              </div>
              ${titleHtml}
            </div>`;
          }
          case 'image': {
            const fullWidth = !!data.fullWidth;
            const wrapClass = fullWidth
              ? 'article-block article-block--image article-block--image-full'
              : 'article-block article-block--image';
            const wrapStyles = fullWidth
              ? 'margin:2rem 0;width:100%;padding:0;box-sizing:border-box'
              : 'margin:2rem auto;width:100%;max-width:860px;padding:0 2rem;box-sizing:border-box';
            const imgStyles =
              'width:100%;max-width:100%;height:auto;border-radius:8px;display:block;object-fit:contain';
            const captionHtml = data.caption
              ? `<figcaption style="margin-top:0.5rem;text-align:center;font-size:0.875rem;color:#64748b">${data.caption}</figcaption>`
              : '';
            return `<figure class="${wrapClass}" style="${wrapStyles}">
              <img src="${data.src}" alt="${data.alt ?? ''}" style="${imgStyles}" />
              ${captionHtml}
            </figure>`;
          }
          case 'hero': {
            const bgColor = data.backgroundColor ? `background-color:${data.backgroundColor};` : '';
            const titleStyle = data.titleColor ? `color:${data.titleColor};` : 'color:white;';
            const subtitleStyle = data.subtitleColor
              ? `color:${data.subtitleColor};`
              : 'color:white;';
            const ctaStyle = [
              data.ctaBackgroundColor ? `background:${data.ctaBackgroundColor};` : 'background:#fff;',
              data.ctaTextColor ? `color:${data.ctaTextColor};` : 'color:#1e5fa8;',
              'display:inline-block;padding:0.625rem 1.5rem;border-radius:999px;text-decoration:none;font-weight:700',
            ].join('');
            return `<div class="article-block article-block--hero" style="position:relative;padding:2.5rem 3rem;overflow:hidden;min-height:220px;width:100%;${textContain};${bgColor}">
              ${data.backgroundImage ? `
                <img src="${data.backgroundImage}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0"
                  alt="hero background" />
                <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1"></div>
              ` : ''}
              <div style="position:relative;z-index:2;max-width:100%;min-width:0">
                <h1 style="${titleStyle}${heroTitleStyle}">${data.title ?? ''}</h1>
                ${data.subtitle ? `<p style="${subtitleStyle}text-shadow:0 1px 3px rgba(0,0,0,0.5);overflow-wrap:anywhere;word-break:break-word;margin:0 0 1.25rem">${data.subtitle}</p>` : ''}
                ${data.ctaLabel ? `<a href="${data.ctaRoute ?? '#'}" style="${ctaStyle}">${data.ctaLabel}</a>` : ''}
              </div>
            </div>`;
          }
          case 'cards-grid': {
            const sectionStyle = data.backgroundColor ? `background-color:${data.backgroundColor};` : '';
            const titleStyle = data.titleColor ? `color:${data.titleColor};` : '';
            const subtitleStyle = data.subtitleColor ? `color:${data.subtitleColor};` : '';
            const cardStyle = [
              'padding:1rem;border-radius:8px',
              data.cardBackgroundColor ? `background:${data.cardBackgroundColor};` : '',
              data.cardBorderColor ? `border:1px solid ${data.cardBorderColor};` : 'border:1px solid #eee;',
              data.cardTextColor ? `color:${data.cardTextColor};` : '',
              textContain,
            ].filter(Boolean).join(';');
            return `<div class="article-block article-block--cards" style="${sectionStyle}${textContain};padding:2.5rem 2rem;width:100%">
              ${data.title ? `<h2${titleStyle ? ` style="${titleStyle}"` : ''}>${data.title}</h2>` : ''}
              ${data.subtitle ? `<p${subtitleStyle ? ` style="${subtitleStyle}"` : ''}>${data.subtitle}</p>` : ''}
              <div style="display:grid;grid-template-columns:repeat(${data.columns ?? 2},1fr);gap:1rem;margin:1rem 0">
                ${(data.cards ?? []).map((c: any) => `
                  <div style="${cardStyle}">
                    <strong>${c.title}</strong>
                    <p>${c.description}</p>
                  </div>`).join('')}
              </div>
            </div>`;
          }
          case 'slides':
            const canvaMatch = data.canvaUrl?.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
            if (!canvaMatch) return '';
            const canvaEmbed = `https://www.canva.com/design/${canvaMatch[1]}/view?embed`;
            return `<div class="canva-embed" style="position:relative;width:100%;height:0;padding-top:56.2225%;
                box-shadow:0 2px 8px 0 rgba(63,69,81,0.16);margin-top:1.6em;margin-bottom:0.9em;overflow:hidden;
                border-radius:8px;">
              <iframe loading="lazy" style="position:absolute;width:100%;height:100%;top:0;left:0;border:none;padding:0;margin:0;"
                src="${canvaEmbed}" allowfullscreen="allowfullscreen" allow="fullscreen">
              </iframe>
            </div>`;
          case 'cta':
            return `<div class="article-block article-block--cta" style="padding:4rem 2rem;text-align:center;background:#f0f4f8;width:100%;${textContain}">
              <h2>${data.title}</h2>
              ${data.description ? `<p>${data.description}</p>` : ''}
              <a href="${data.primaryRoute}" style="display:inline-block;padding:0.75rem 1.5rem;background:#1e5fa8;color:white;border-radius:6px;text-decoration:none">
                ${data.primaryLabel}
              </a>
            </div>`;
          default:
            return '';
        }
      })
      .join('\n');
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
