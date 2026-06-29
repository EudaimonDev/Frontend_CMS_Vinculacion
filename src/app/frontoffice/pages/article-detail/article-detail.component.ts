import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from '../../core/services/cms.service';
import { Article, CategoryNav } from '../../core/models/article.model';
import { ReadingTimePipe } from '../../core/pipes/reading-time.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { blocksToHtml } from '../../../backoffice/shared/utils/block-html.util';
import { CanvaService } from '../../../backoffice/shared/services/canva.service';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReadingTimePipe,
    LoadingSpinnerComponent,
  ],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cms = inject(CmsService);
  private canvaService = inject(CanvaService);
  private sanitizer = inject(DomSanitizer);
  safeContent = signal<SafeHtml>('');
  showCopyToast = signal(false);
  article = signal<Article | undefined>(undefined);
  categoryNav = signal<CategoryNav | null>(null);
  loading = signal(true);
  categoryExpanded = signal(false);
  expandedSubCategories = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        this.loading.set(true);
        return this.loadArticleData(id);
      }),
    ).subscribe(({ article, nav }) => {
      this.article.set(article);
      this.categoryNav.set(nav);
      this.initExpandedSections(article, nav);
      void this.resolveArticleHtml(article).then(html => {
        if (html) {
          this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
        }
        this.loading.set(false);
      });
    });
  }

  isActiveArticle(articleId: string): boolean {
    return this.article()?.id === articleId;
  }

  isSubExpanded(subCategoryId: number): boolean {
    return this.expandedSubCategories().has(subCategoryId);
  }

  toggleCategory(): void {
    const nav = this.categoryNav();
    if (!nav?.articles.length) return;
    this.categoryExpanded.update(expanded => !expanded);
  }

  toggleSubCategory(subCategoryId: number): void {
    const nav = this.categoryNav();
    const sub = nav?.subCategories.find(s => s.subCategoryId === subCategoryId);
    if (!sub?.articles.length) return;

    this.expandedSubCategories.update(set => {
      const next = new Set(set);
      if (next.has(subCategoryId)) {
        next.delete(subCategoryId);
      } else {
        next.add(subCategoryId);
      }
      return next;
    });
  }

  private loadArticleData(id: string): Observable<{
    article: Article | undefined;
    nav: CategoryNav | null;
  }> {
    return this.cms.getArticleById(id).pipe(
      switchMap(article => {
        if (!article) {
          return of({ article: undefined as Article | undefined, nav: null as CategoryNav | null });
        }

        const categoryId = article.categoryIds?.[0];
        if (!categoryId) {
          return of({ article, nav: null as CategoryNav | null });
        }

        return forkJoin({
          article: of(article),
          nav: this.cms.getCategoryNav(categoryId),
          siblings: this.cms.getArticlesByCategoryId(categoryId),
        }).pipe(
          switchMap(({ article, nav, siblings }) => {
            if (!nav) {
              return of({ article, nav: null as CategoryNav | null });
            }

            const enrichedNav = this.buildCategoryNav(nav, siblings);
            return of({ article, nav: enrichedNav });
          }),
          catchError(() => of({ article, nav: null as CategoryNav | null })),
        );
      }),
    );
  }

  private buildCategoryNav(nav: CategoryNav, siblings: Article[]): CategoryNav {
    return {
      ...nav,
      articles: siblings
        .filter(a => !a.subCategoryId)
        .map(a => ({ id: a.id, title: a.title })),
      subCategories: nav.subCategories.map(sub => ({
        ...sub,
        articles: siblings
          .filter(a => a.subCategoryId === sub.subCategoryId)
          .map(a => ({ id: a.id, title: a.title })),
      })),
    };
  }

  private initExpandedSections(article: Article | undefined, nav: CategoryNav | null): void {
    const expandedSubs = new Set<number>();

    if (article?.subCategoryId) {
      expandedSubs.add(article.subCategoryId);
    }

    this.expandedSubCategories.set(expandedSubs);
    this.categoryExpanded.set(
      !!article && !article.subCategoryId && !!nav?.articles.some(a => a.id === article.id),
    );
  }

  private async resolveArticleHtml(article: Article | undefined): Promise<string> {
    if (!article) return '';

    if (article.blocksJson) {
      try {
        let blocks = JSON.parse(article.blocksJson);
        blocks = await this.canvaService.resolveSlidesInBlocks(blocks);
        const generated = blocksToHtml(blocks);
        if (generated) return generated;
      } catch {
        /* usar contentHtml como respaldo */
      }
    }

    return article.contentHtml ?? '';
  }

  shareTwitter(): void {
    const url = window.location.href;
    const text = this.article()?.title ?? '';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  shareLinkedIn(): void {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href);
    this.showCopyToast.set(true);
    setTimeout(() => this.showCopyToast.set(false), 3000);
  }
}
