import { Component, inject, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaService } from '../../../multimedia/services/media.service';
import { MediaItem } from '../../../multimedia/models/media.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-image-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="picker-overlay" (click)="onClose()">
      <div class="picker-modal" (click)="$event.stopPropagation()">

        <div class="picker-modal__header">
          <div class="picker-modal__title">
            <span class="picker-modal__title-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
            </span>
            <div>
              <h3>Seleccionar imagen</h3>
              <p>Elige una imagen de la galería o sube una nueva</p>
            </div>
          </div>
          <button class="icon-btn picker-modal__close" (click)="onClose()" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="picker-modal__toolbar">
          <div class="picker-search">
            <svg class="picker-search__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="search"
              placeholder="Buscar por nombre…"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="picker-search__input"
            />
            @if (searchQuery()) {
              <button type="button" class="picker-search__clear" (click)="clearSearch()" aria-label="Limpiar búsqueda">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            }
          </div>

          <input
            #fileInput
            type="file"
            accept="image/*"
            hidden
            (change)="onFileSelected($event)"
          />
          <button
            class="picker-upload-btn"
            [disabled]="uploading()"
            (click)="fileInput.click()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ uploading() ? 'Subiendo…' : 'Subir imagen' }}
          </button>
        </div>

        <div class="picker-modal__body">
          <div class="picker-modal__section-head">
            <span class="picker-modal__section-title">Galería</span>
            <span class="picker-modal__section-count">{{ filteredItems().length }} imagen{{ filteredItems().length === 1 ? '' : 'es' }}</span>
          </div>

          <div class="picker-modal__grid">
            @if (loading()) {
              @for (n of [1,2,3,4,5,6]; track n) {
                <div class="picker-item picker-item--skeleton"></div>
              }
            } @else {
              @for (item of filteredItems(); track item.id) {
                <button
                  type="button"
                  class="picker-item"
                  [class.picker-item--selected]="selected()?.id === item.id"
                  (click)="select(item)"
                >
                  <img [src]="item.url" [alt]="item.name" loading="lazy" />
                  @if (selected()?.id === item.id) {
                    <span class="picker-item__check" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  }
                  <span class="picker-item__name">{{ item.name }}</span>
                </button>
              }

              @if (filteredItems().length === 0 && !uploading()) {
                <div class="picker-empty">
                  <div class="picker-empty__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                    </svg>
                  </div>
                  @if (searchQuery()) {
                    <p>No se encontraron imágenes para «{{ searchQuery() }}»</p>
                    <button type="button" class="picker-empty__link" (click)="clearSearch()">Limpiar búsqueda</button>
                  } @else {
                    <p>Aún no hay imágenes en la galería</p>
                    <small>Usa «Subir imagen» para agregar la primera</small>
                  }
                </div>
              }
            }
          </div>
        </div>

        <div class="picker-modal__footer">
          @if (selected(); as sel) {
            <div class="picker-modal__selection">
              <img [src]="sel.url" [alt]="sel.name" />
              <span>{{ sel.name }}</span>
            </div>
          } @else {
            <span class="picker-modal__hint">Selecciona una imagen de la galería</span>
          }
          <div class="picker-modal__actions">
            <button type="button" class="picker-footer-btn picker-footer-btn--secondary" (click)="onClose()">
              Cancelar
            </button>
            <button
              type="button"
              class="picker-footer-btn picker-footer-btn--primary"
              [disabled]="!selected()"
              (click)="onConfirm()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Usar imagen
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .picker-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .picker-modal {
      background: var(--color-surface, #fff);
      border-radius: 16px;
      width: 820px;
      max-width: 100%;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
      overflow: hidden;

      &__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--color-border, #e2e8f0);
      }

      &__title {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text, #0f172a);
          margin: 0 0 2px;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: var(--color-text-muted, #64748b);
        }
      }

      &__title-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(30, 95, 168, 0.1);
        color: var(--color-primary, #1e5fa8);
        flex-shrink: 0;
      }

      &__close {
        margin-top: 2px;
      }

      &__toolbar {
        display: flex;
        gap: 12px;
        padding: 16px 24px;
        border-bottom: 1px solid var(--color-border, #e2e8f0);
        align-items: center;
        background: var(--color-bg, #f8fafc);
      }

      &__body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 16px 24px 0;
      }

      &__section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      &__section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text, #0f172a);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      &__section-count {
        font-size: 12px;
        color: var(--color-text-muted, #64748b);
        background: var(--color-bg, #f1f5f9);
        padding: 4px 10px;
        border-radius: 999px;
      }

      &__grid {
        flex: 1;
        overflow-y: auto;
        padding-bottom: 16px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
        gap: 12px;
        align-content: start;
      }

      &__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 24px;
        border-top: 1px solid var(--color-border, #e2e8f0);
        background: #fff;
      }

      &__selection {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
        padding: 6px 10px 6px 6px;
        border-radius: 12px;
        background: var(--color-bg, #f8fafc);
        border: 1px solid var(--color-border, #e2e8f0);

        img {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--color-border, #e2e8f0);
          flex-shrink: 0;
        }

        span {
          font-size: 13px;
          color: var(--color-text, #0f172a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      &__hint {
        font-size: 13px;
        color: var(--color-text-muted, #64748b);
        flex: 1;
      }

      &__actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }
    }

    .picker-footer-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 44px;
      min-width: 120px;
      padding: 0 18px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;

      &:active:not(:disabled) {
        transform: translateY(1px);
      }

      &--secondary {
        border: 1px solid var(--color-border, #cbd5e1);
        background: #fff;
        color: var(--color-text, #334155);

        &:hover {
          background: var(--color-bg, #f8fafc);
          border-color: #94a3b8;
          color: var(--color-text, #0f172a);
        }
      }

      &--primary {
        border: 1px solid var(--color-primary, #1e5fa8);
        background: var(--color-primary, #1e5fa8);
        color: #fff;
        box-shadow: 0 4px 12px rgba(30, 95, 168, 0.25);

        &:hover:not(:disabled) {
          background: var(--color-primary-dark, #164d8a);
          border-color: var(--color-primary-dark, #164d8a);
          box-shadow: 0 6px 16px rgba(30, 95, 168, 0.3);
        }

        &:disabled {
          background: #e2e8f0;
          border-color: #e2e8f0;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }
      }
    }

    .picker-search {
      flex: 1;
      min-width: 0;
      position: relative;
      display: flex;
      align-items: center;

      &__icon {
        position: absolute;
        left: 14px;
        color: var(--color-text-muted, #94a3b8);
        pointer-events: none;
      }

      &__input {
        width: 100%;
        height: 44px;
        padding: 0 40px 0 42px;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        background: #fff;
        font-size: 14px;
        color: var(--color-text, #0f172a);
        transition: border-color 0.15s, box-shadow 0.15s;

        &::placeholder { color: #94a3b8; }

        &:focus {
          outline: none;
          border-color: var(--color-primary-light, #4a9fd4);
          box-shadow: 0 0 0 3px rgba(30, 95, 168, 0.12);
        }
      }

      &__clear {
        position: absolute;
        right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--color-text-muted, #64748b);
        cursor: pointer;

        &:hover {
          background: #f1f5f9;
          color: var(--color-text, #0f172a);
        }
      }
    }

    .picker-upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 16px;
      border: 1px solid var(--color-primary, #1e5fa8);
      border-radius: 12px;
      background: var(--color-primary, #1e5fa8);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s, transform 0.1s;

      &:hover:not(:disabled) {
        background: var(--color-primary-dark, #164d8a);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .picker-item {
      position: relative;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
      background: var(--color-bg, #f8fafc);
      padding: 0;
      text-align: left;

      &:hover {
        border-color: var(--color-primary-light, #4a9fd4);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      }

      &--selected {
        border-color: var(--color-primary, #1e5fa8);
        box-shadow: 0 0 0 3px rgba(30, 95, 168, 0.15);
      }

      &--skeleton {
        height: 132px;
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: picker-shimmer 1.2s infinite;
        pointer-events: none;
      }

      img {
        width: 100%;
        height: 108px;
        object-fit: cover;
        display: block;
      }

      &__check {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: var(--color-primary, #1e5fa8);
        color: #fff;
        box-shadow: 0 2px 8px rgba(30, 95, 168, 0.35);
      }

      &__name {
        display: block;
        padding: 8px 10px;
        font-size: 11px;
        font-weight: 500;
        color: var(--color-text-muted, #64748b);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background: #fff;
      }
    }

    .picker-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 24px;
      color: var(--color-text-muted, #64748b);

      &__icon {
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
        color: #cbd5e1;
      }

      p {
        margin: 0 0 6px;
        font-size: 15px;
        color: var(--color-text, #334155);
      }

      small { font-size: 13px; }

      &__link {
        margin-top: 8px;
        border: none;
        background: none;
        color: var(--color-primary, #1e5fa8);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
      }
    }

    @keyframes picker-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class ImagePickerComponent implements OnInit {
  private mediaService = inject(MediaService);
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  imageSelected = output<string>();
  closed = output<void>();

  searchQuery = signal('');
  selected = signal<MediaItem | null>(null);
  uploading = signal(false);
  loading = signal(true);
  galleryItems = signal<MediaItem[]>([]);

  filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const images = this.galleryItems();
    if (!q) return images;
    return images.filter(i => i.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.loadGallery();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  private loadGallery(): void {
    this.loading.set(true);
    this.http
      .get<any[]>(`${this.api}/Media/admin`, { params: { page: 1, pageSize: 100 } })
      .subscribe({
        next: items => {
          const images = (items ?? [])
            .filter(i => i.mimeType?.startsWith('image/'))
            .map(i => this.toGalleryItem(i));
          this.galleryItems.set(images);
          this.loading.set(false);
        },
        error: () => {
          this.galleryItems.set([]);
          this.loading.set(false);
        },
      });
  }

  private toGalleryItem(raw: any): MediaItem {
    const filePath = raw.filePath ?? raw.url ?? '';
    return {
      id: raw.mediaId?.toString() ?? raw.id,
      name: raw.fileName ?? raw.name ?? 'Imagen',
      type: raw.mimeType?.startsWith('image/svg') ? 'svg' : 'image',
      mimeType: raw.mimeType ?? 'image/jpeg',
      size: raw.sizeBytes ?? raw.size ?? 0,
      url: this.mediaService.resolveMediaUrl(filePath),
      tags: [],
      createdAt: new Date(raw.uploadedAt ?? raw.createdAt ?? Date.now()),
      updatedAt: new Date(raw.uploadedAt ?? raw.updatedAt ?? Date.now()),
    };
  }

  select(item: MediaItem): void {
    this.selected.set(item);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    this.uploading.set(true);
    this.mediaService.uploadFile(file).then(item => {
      this.galleryItems.update(list => [item, ...list]);
      this.selected.set(item);
      this.uploading.set(false);
    }).catch(() => {
      this.uploading.set(false);
    });
  }

  onConfirm(): void {
    const item = this.selected();
    if (item) this.imageSelected.emit(item.url);
  }

  onClose(): void {
    this.closed.emit();
  }
}
