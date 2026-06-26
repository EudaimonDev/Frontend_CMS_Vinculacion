import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from '../../core/services/cms.service';
import { Article } from '../../core/models/article.model';
import { ReadingTimePipe } from '../../core/pipes/reading-time.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { blocksToHtml } from '../../../backoffice/shared/utils/block-html.util';

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
  private sanitizer = inject(DomSanitizer);
  safeContent = signal<SafeHtml>('');
  showCopyToast = signal(false);
  article = signal<Article | undefined>(undefined);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cms.getArticleById(id).subscribe(article => {
      this.article.set(article);
      const html = this.resolveArticleHtml(article);
      if (html) {
        this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
      }
      this.loading.set(false);
    });
  }

  private resolveArticleHtml(article: Article | undefined): string {
    if (!article) return '';

    if (article.blocksJson) {
      try {
        const blocks = JSON.parse(article.blocksJson);
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
