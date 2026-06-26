import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MediaService } from '../../services/media.service';
import { MediaItem } from '../../models/media.model';
@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './media-list.component.html',
  styleUrl: './media-list.component.scss',
})
export class MediaListComponent{
protected readonly media = inject(MediaService);
 
  select(item: MediaItem): void {
    this.media.selectedItem.set(item);
  }
 
  delete(item: MediaItem, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm(`¿Eliminar "${item.name}"?`)) {
      this.media.delete(item.id);
    }
  }
 
  /** Tamaño */
  readableSize(bytes: number): string {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  }
}
