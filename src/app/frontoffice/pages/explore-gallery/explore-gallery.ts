import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  isPublicVisible: boolean;
  articleCount: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-explore-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './explore-gallery.html',
  styleUrl: './explore-gallery.scss'
})
export class ExploreGalleryComponent implements OnInit {
  private http = inject(HttpClient);

  searchQuery = signal('');
  selectedSort = signal('todas');
  allCategories = signal<Category[]>([]);

  readonly gradients = [
    'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
    'linear-gradient(135deg, #edb5b5 0%, #e88e8e 100%)',
    'linear-gradient(135deg, #90bede 0%, #6392b9 100%)',
    'linear-gradient(135deg, #ffd89b 0%, #19033e 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfd9 100%)',
    'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ];

  readonly icons = ['🧬', '🌱', '📊', '🚀', '🏛️', '🔬', '💡', '📚'];

  ngOnInit(): void {
    this.http
      .get<Category[]>(`${environment.apiUrl}/Categories`)
      .subscribe(cats => this.allCategories.set(cats));
  }

  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  getIcon(index: number): string {
    return this.icons[index % this.icons.length];
  }

  filteredCategories = computed(() => {
    let result = [...this.allCategories()];
    const query = this.searchQuery().trim().toLowerCase();
    const sort = this.selectedSort();

    if (query) {
      result = result.filter(cat => cat.name.toLowerCase().includes(query));
    }

    switch (sort) {
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  });

  updateSearch(val: string) { this.searchQuery.set(val); }
  updateSort(val: string) { this.selectedSort.set(val); }
}
