import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MediaItem, CreateMediaItemDto, MediaFilters, MediaType } from '../models/media.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private readonly _items   = signal<MediaItem[]>([]);
  private readonly _filters = signal<MediaFilters>({
    search:   '',
    type:     'all',
    sortBy:   'date',
    sortDir:  'desc',
    viewMode: 'grid',
  });

  readonly filters       = this._filters.asReadonly();
  readonly selectedItem  = signal<MediaItem | null>(null);
  readonly totalItems    = computed(() => this._items().length);

  readonly filteredItems = computed(() => {
    const { search, type, sortBy, sortDir } = this._filters();
    let result = [...this._items()];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        i => i.name.toLowerCase().includes(q) ||
             i.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (type !== 'all') {
      result = result.filter(i => i.type === type);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      if (sortBy === 'size') cmp = a.size - b.size;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  });

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http
      .get<any[]>(`${this.api}/Media/admin`, { params: { page: 1, pageSize: 100 } })
      .subscribe({
        next: items => this._items.set(items.map(this.mapToMediaItem)),
        error: () => this._items.set([])
      });
  }

  async add(dto: CreateMediaItemDto): Promise<MediaItem> {
    // Convertir base64 a File para subir al backend
    const file = this.base64ToFile(dto.url, dto.name, dto.mimeType);
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      this.http
        .post<any>(`${this.api}/Media/admin/upload`, formData)
        .subscribe({
          next: media => {
            const item = this.mapToMediaItem(media);
            this._items.update(list => [item, ...list]);
            resolve(item);
          },
          error: reject
        });
    });
  }

  update(id: string, patch: Partial<Pick<MediaItem, 'name' | 'tags'>>): void {
    this._items.update(list =>
      list.map(i => i.id === id ? { ...i, ...patch, updatedAt: new Date() } : i)
    );
    if (this.selectedItem()?.id === id) {
      this.selectedItem.update(i => i ? { ...i, ...patch, updatedAt: new Date() } : i);
    }
  }

  delete(id: string): void {
    this.http.delete(`${this.api}/Media/admin/${id}`).subscribe({
      next: () => {
        this._items.update(list => list.filter(i => i.id !== id));
        if (this.selectedItem()?.id === id) this.selectedItem.set(null);
      }
    });
  }

  setFilter<K extends keyof MediaFilters>(key: K, value: MediaFilters[K]): void {
    this._filters.update(f => ({ ...f, [key]: value }));
  }

  resetFilters(): void {
    this._filters.update(f => ({ ...f, search: '', type: 'all' }));
  }

  async fileToDto(file: File): Promise<CreateMediaItemDto> {
    const url  = await this._toBase64(file);
    const type = this._inferType(file.type);
    const dims = type === 'image' ? await this._imageDimensions(url) : {};
    return { name: file.name, type, mimeType: file.type, size: file.size, url, tags: [], ...dims };
  }

  private mapToMediaItem(media: any): MediaItem {
  const filePath = media.filePath ?? media.url ?? '';
  const fullUrl = filePath.startsWith('http')
    ? filePath
    : `https://localhost:7218${filePath}`;

  return {
    id:        media.mediaId?.toString() ?? media.id,
    name:      media.fileName ?? media.name,
    type:      media.mimeType?.startsWith('image/svg') ? 'svg' :
               media.mimeType?.startsWith('image/')    ? 'image' :
               media.mimeType?.startsWith('video/')    ? 'video' : 'unknown',
    mimeType:  media.mimeType ?? 'image/jpeg',
    size:      media.sizeBytes ?? media.size ?? 0,
    url:       fullUrl,
    tags:      [],
    createdAt: new Date(media.uploadedAt ?? media.createdAt ?? Date.now()),
    updatedAt: new Date(media.uploadedAt ?? media.updatedAt ?? Date.now()),
  };
}

  private base64ToFile(base64: string, name: string, mimeType: string): File {
    const arr = base64.split(',');
    const bstr = atob(arr[1] ?? arr[0]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], name, { type: mimeType });
  }

  private _inferType(mime: string): MediaType {
    if (mime.startsWith('image/svg')) return 'svg';
    if (mime.startsWith('image/'))   return 'image';
    if (mime.startsWith('video/'))   return 'video';
    return 'unknown';
  }

  private _toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private _imageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = src;
    });
  }
}
