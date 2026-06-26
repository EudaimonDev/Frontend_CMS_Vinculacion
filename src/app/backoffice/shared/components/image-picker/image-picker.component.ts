import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaService } from '../../../multimedia/services/media.service';
import { MediaItem } from '../../../multimedia/models/media.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-image-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="picker-overlay" (click)="onClose()">
      <div class="picker-modal" (click)="$event.stopPropagation()">

        <div class="picker-modal__header">
          <h3>Seleccionar imagen</h3>
          <button class="icon-btn" (click)="onClose()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="picker-modal__search">
          <input
            type="text"
            placeholder="Buscar imagen..."
            [(ngModel)]="searchQuery"
            class="prop-input"
          />
        </div>

        <div class="picker-modal__grid">
          @for (item of filteredItems(); track item.id) {
            <div
              class="picker-item"
              [class.picker-item--selected]="selected()?.id === item.id"
              (click)="select(item)"
            >
              <img [src]="item.url" [alt]="item.name" loading="lazy" />
              <span class="picker-item__name">{{ item.name }}</span>
            </div>
          }

          @if (filteredItems().length === 0) {
            <div class="picker-empty">
              <p>No hay imágenes subidas todavía.</p>
              <small>Ve a Multimedia para subir imágenes.</small>
            </div>
          }
        </div>

        <div class="picker-modal__footer">
          <button class="btn btn--ghost" (click)="onClose()">Cancelar</button>
          <button
            class="btn btn--primary"
            [disabled]="!selected()"
            (click)="onConfirm()"
          >
            Usar imagen
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .picker-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .picker-modal {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 780px;
      max-width: 95vw;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
      overflow: hidden;

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border);

        h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }
      }

      &__search {
        padding: 12px 20px;
        border-bottom: 1px solid var(--color-border);
      }

      &__grid {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        align-content: start;
      }

      &__footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 20px;
        border-top: 1px solid var(--color-border);
      }
    }

    .picker-item {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: border-color 0.15s;
      background: var(--color-bg);

      &:hover { border-color: var(--color-primary-light); }

      &--selected { border-color: var(--color-primary); }

      img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        display: block;
      }

      &__name {
        display: block;
        padding: 4px 6px;
        font-size: 10px;
        color: var(--color-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .picker-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      color: var(--color-text-muted);

      p { margin-bottom: 4px; font-size: 14px; }
      small { font-size: 12px; }
    }
  `]
})
export class ImagePickerComponent implements OnInit {
  private mediaService = inject(MediaService);
  private http = inject(HttpClient);

  imageSelected = output<string>();
  closed = output<void>();

  searchQuery = signal('');
  selected = signal<MediaItem | null>(null);
  allItems = signal<MediaItem[]>([]);

  filteredItems = signal<MediaItem[]>([]);

  ngOnInit(): void {
  this.http
    .get<any[]>(`${environment.apiUrl}/Media/admin`, { params: { page: 1, pageSize: 100 } })
    .subscribe(items => {
      const images = items
        .filter(i => i.mimeType?.startsWith('image/'))
        .map(i => ({
          id: i.mediaId?.toString() ?? i.id,
          name: i.fileName ?? i.name,
          type: 'image' as any,
          mimeType: i.mimeType,
          size: i.sizeBytes ?? 0,
          url: i.filePath?.startsWith('http')
            ? i.filePath
            : `https://localhost:7218${i.filePath}`,
          tags: [],
          createdAt: new Date(i.uploadedAt ?? i.createdAt ?? Date.now()),
          updatedAt: new Date(i.uploadedAt ?? Date.now()),
        }));
      this.allItems.set(images);
      this.filteredItems.set(images);
    });
}

  select(item: MediaItem): void {
    this.selected.set(item);
  }

  onConfirm(): void {
    const item = this.selected();
    if (item) this.imageSelected.emit(item.url);
  }

  onClose(): void {
    this.closed.emit();
  }
}
