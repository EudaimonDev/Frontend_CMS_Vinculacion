import { Component, inject } from '@angular/core';
import { MediaService } from '../../services/media.service';
import { MediaType } from '../../models/media.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-media-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './media-filters.component.html',
  styleUrl: './media-filters.component.scss',
})
export class MediaFiltersComponent {
  protected readonly media = inject(MediaService);

  // Opciones de tipo expuestas al template
  readonly typeOptions: { label: string; value: MediaType | 'all' }[] = [
    { label: 'Todos los tipos', value: 'all'     },
    { label: 'Imágenes',        value: 'image'   },
  ];

  readonly sortOptions = [
    { label: 'Fecha', value: 'date' },
    { label: 'Nombre', value: 'name' },
    { label: 'Tamaño', value: 'size' },
  ];

  //Handlers
  onSearch(value: string): void {
    this.media.setFilter('search', value);
  }

  onTypeChange(value: string): void {
    this.media.setFilter('type', value as MediaType | 'all');
  }

  onSortChange(value: string): void {
    this.media.setFilter('sortBy', value as 'date' | 'name' | 'size');
  }

  toggleSortDir(): void {
    const current = this.media.filters().sortDir;
    this.media.setFilter('sortDir', current === 'asc' ? 'desc' : 'asc');
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.media.setFilter('viewMode', mode);
  }
}
