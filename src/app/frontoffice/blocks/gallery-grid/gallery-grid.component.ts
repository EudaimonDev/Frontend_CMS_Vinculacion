import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryBlockData } from '../../core/models/block.model';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { signal } from '@angular/core';

interface Category {
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-gallery-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery-grid.component.html',
  styleUrls: ['./gallery-grid.component.scss'],
})
export class GalleryGridComponent implements OnInit {
  @Input() data!: GalleryBlockData;

  private http = inject(HttpClient);

  categories = signal<Category[]>([]);

  readonly gradients = [
    'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
    'linear-gradient(135deg, #edb5b5 0%, #e88e8e 100%)',
    'linear-gradient(135deg, #90bede 0%, #6392b9 100%)',
    'linear-gradient(135deg, #ffd89b 0%, #19033e 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfd9 100%)',
    'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
  ];

  readonly icons = ['🧬', '🌱', '📊', '🚀', '🏛️', '🔬'];

  ngOnInit(): void {
    this.http.get<Category[]>(`${environment.apiUrl}/Categories`)
      .subscribe(cats => this.categories.set(cats));
  }

  getGradient(i: number): string {
    return this.gradients[i % this.gradients.length];
  }

  getIcon(i: number): string {
    return this.icons[i % this.icons.length];
  }
}
