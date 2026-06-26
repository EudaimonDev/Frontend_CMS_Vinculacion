import { Component, inject, input } from '@angular/core';
import { MediaItem } from '../../models/media.model';
import { MediaService } from '../../services/media.service';
@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss',
})
export class MediaCardComponent {
  //Ítem a mostrar (required signal input)
  readonly item = input.required<MediaItem>();
 
  protected readonly media = inject(MediaService);
 
  //Selecciona el ítem para ver el detalle
  select(): void {
    this.media.selectedItem.set(this.item());
  }
 
  //Elimina el ítem con confirmación simple
  delete(event: MouseEvent): void {
    event.stopPropagation();
    if (confirm(`¿Eliminar "${this.item().name}"?`)) {
      this.media.delete(this.item().id);
    }
  }
 
  //Tamaño legible
  get readableSize(): string {
    const bytes = this.item().size;
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  }
 
  //Badge de tipo
  get typeLabel(): string {
    const map: Record<string, string> = {
      image: 'IMG', video: 'VID', svg: 'SVG', unknown: '?',
    };
    return map[this.item().type] ?? '?';
  }
}
