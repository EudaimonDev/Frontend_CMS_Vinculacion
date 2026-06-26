import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Article } from '../../../core/models/article.model';
import { CategoryBadgeComponent } from '../category-badge/category-badge.component';
import { ReadingTimePipe } from '../../../core/pipes/reading-time.pipe';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CategoryBadgeComponent, ReadingTimePipe],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss'],
})
export class ArticleCardComponent {
  @Input() article!: Article;
}
