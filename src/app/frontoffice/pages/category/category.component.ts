import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CmsService } from '../../core/services/cms.service';
import { Article, CategoryNav } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

interface SubCategorySection {
  subCategoryId: number;
  name: string;
  articles: Article[];
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cms = inject(CmsService);

  category = signal<CategoryNav | null>(null);
  routeSlug = signal('');
  mainArticles = signal<Article[]>([]);
  subCategorySections = signal<SubCategorySection[]>([]);
  loading = signal(true);

  totalArticles = computed(
    () =>
      this.mainArticles().length +
      this.subCategorySections().reduce((sum, section) => sum + section.articles.length, 0),
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;

      this.routeSlug.set(slug);
      this.loading.set(true);

      this.cms
        .getCategoryBySlug(slug)
        .pipe(
          switchMap(category => {
            if (!category) {
              return of({ category: null, articles: [] as Article[] });
            }

            return forkJoin({
              category: of(category),
              articles: this.cms.getArticlesByCategoryId(category.categoryId),
            });
          }),
          catchError(() => of({ category: null, articles: [] as Article[] })),
        )
        .subscribe(({ category, articles }) => {
          this.category.set(category);

          if (!category) {
            this.mainArticles.set([]);
            this.subCategorySections.set([]);
          } else {
            const { main, sections } = this.splitArticlesBySubCategory(category, articles);
            this.mainArticles.set(main);
            this.subCategorySections.set(sections);
          }

          this.loading.set(false);
        });
    });
  }

  private splitArticlesBySubCategory(
    category: CategoryNav,
    articles: Article[],
  ): { main: Article[]; sections: SubCategorySection[] } {
    const main = articles.filter(article => !article.subCategoryId);
    const bySubId = new Map<number, Article[]>();

    for (const article of articles) {
      if (!article.subCategoryId) continue;

      const current = bySubId.get(article.subCategoryId) ?? [];
      current.push(article);
      bySubId.set(article.subCategoryId, current);
    }

    const sections: SubCategorySection[] = [];

    for (const sub of category.subCategories) {
      const subArticles = bySubId.get(sub.subCategoryId);
      if (!subArticles?.length) continue;

      sections.push({
        subCategoryId: sub.subCategoryId,
        name: sub.name,
        articles: subArticles,
      });
      bySubId.delete(sub.subCategoryId);
    }

    for (const [subCategoryId, subArticles] of bySubId) {
      sections.push({
        subCategoryId,
        name: subArticles[0].subCategoryName ?? 'Subcategoría',
        articles: subArticles,
      });
    }

    return { main, sections };
  }
}
