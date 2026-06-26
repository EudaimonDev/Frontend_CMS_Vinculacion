export type MediaType = 'image' | 'video' | 'svg' | 'unknown';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number;         // bytes
  url: string;         // object URL o base64
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  width?: number;
  height?: number;
}

// DTO para crear ítem (sin id ni fechas, los genera el servicio)
export type CreateMediaItemDto = Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>;

// Filtros aplicables en el listado
export interface MediaFilters {
  search: string;
  type: MediaType | 'all';
  sortBy: 'date' | 'name' | 'size';
  sortDir: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

// Vista activa en el módulo
export type MediaView = 'list' | 'detail' | 'upload';