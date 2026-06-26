import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CmsService } from '../../core/services/cms.service';
import { Article, ArticleCategory } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

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

  articles = signal<Article[]>([]);
  categoryName = signal('');
  loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cat = params.get('slug') as ArticleCategory;
      this.categoryName.set(cat);
      this.loading.set(true);
      this.cms.getArticles(cat).subscribe(articles => {
        this.articles.set(articles);
        this.loading.set(false);
      });
    });
  }
}
