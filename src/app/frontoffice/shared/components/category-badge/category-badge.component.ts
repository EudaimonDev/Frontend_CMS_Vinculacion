import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleCategory } from '../../../core/models/article.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-badge.component.html',
  styleUrls: ['./category-badge.component.scss'],
})
export class CategoryBadgeComponent {
  @Input() category!: ArticleCategory;

  get label(): string {
    const labels: Record<ArticleCategory, string> = {
      investigacion: 'Investigación',
      cultura: 'Cultura',
      tecnologia: 'Tecnología',
      eventos: 'Eventos',
      proyectos: 'Proyectos',
    };
    return labels[this.category];
  }
}
