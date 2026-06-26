import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { PagesService } from '../services/pages.service';
import { PageBlock, BlockType } from '../../../frontoffice/core/models/block.model';
import { TextBlockComponent } from '../../../frontoffice/blocks/text-block/text-block.component';
import { CtaBlockComponent } from '../../../frontoffice/blocks/cta-block/cta-block.component';
import { ImagePickerComponent } from '../../shared/components/image-picker/image-picker.component';
import { BlockColorEditorComponent } from '../../shared/components/block-color-editor/block-color-editor.component';
import { CardsEditorComponent } from '../../shared/components/cards-editor/cards-editor.component';
import {
  applyColorPatch,
  CARDS_COLOR_FIELDS,
  defaultCardsColorData,
  defaultHeroColorData,
  defaultTextColorData,
  HERO_COLOR_FIELDS,
  TEXT_COLOR_FIELDS,
} from '../../shared/utils/block-color.util';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


type Device = 'desktop' | 'tablet' | 'mobile';

interface BlockPaletteItem {
  type: BlockType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-page-builder',
  imports: [
    RouterLink,
    DragDropModule,
    TextBlockComponent,
    CtaBlockComponent,
    QuillModule,
    FormsModule,
    ImagePickerComponent,
    BlockColorEditorComponent,
    CardsEditorComponent,
  ],
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.scss',
})
export class PageBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PagesService);
  showImagePicker = signal(false);
  imagePickerTarget = signal<'backgroundImage' | 'src' | null>(null);
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private sanitizer = inject(DomSanitizer);

  openImagePicker(target: 'backgroundImage' | 'src'): void {
  this.imagePickerTarget.set(target);
  this.showImagePicker.set(true);
}

  pageId = signal<string>('');
  pageTitle = signal('');
  blocks = signal<PageBlock[]>([]);
  selectedId = signal<string | null>(null);
  device = signal<Device>('desktop');
  saving = signal(false);
  saved = signal(false);
  panelOpen = signal(true);
  readingTime = signal(1);

  selectedBlock = computed(() => this.blocks().find((b) => b.id === this.selectedId()) ?? null);

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean']
    ]
  };

  onImageSelected(url: string): void {
    const target = this.imagePickerTarget();
    if (target) {
      this.updateProp(target, url);
      if (target === 'src') this.syncImageDimensionsFromSrc(url);
    }
    this.showImagePicker.set(false);
    this.imagePickerTarget.set(null);
  }

  onImageSrcChange(event: Event): void {
    const url = this.strVal(event);
    this.updateProp('src', url);
    this.syncImageDimensionsFromSrc(url);
  }

  onImageDimensionChange(changed: 'width' | 'height', raw: string): void {
    const id = this.selectedId();
    if (!id) return;
    const value = Math.max(1, Math.round(Number(raw)) || 1);

    this.blocks.update(arr =>
      arr.map(b => {
        if (b.id !== id || b.type !== 'image') return b;
        const data = { ...(b as any).data };
        const nw = data.naturalWidth || data.width || 1200;
        const nh = data.naturalHeight || data.height || 400;
        const ratio = nw / nh;

        if (changed === 'width') {
          data.width = value;
          data.height = Math.max(1, Math.round(value / ratio));
        } else {
          data.height = value;
          data.width = Math.max(1, Math.round(value * ratio));
        }
        return { ...b, data };
      }),
    );
  }

  private syncImageDimensionsFromSrc(url: string): void {
    if (!url) return;
    const id = this.selectedId();
    if (!id) return;

    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!nw || !nh) return;

      this.blocks.update(arr =>
        arr.map(b => {
          if (b.id !== id || b.type !== 'image') return b;
          const data = { ...(b as any).data };
          const width = data.width && data.width > 0 ? data.width : nw;
          const height = Math.max(1, Math.round(width * nh / nw));
          return {
            ...b,
            data: {
              ...data,
              naturalWidth: nw,
              naturalHeight: nh,
              width,
              height,
            },
          };
        }),
      );
    };
    img.src = url;
  }

  palette: BlockPaletteItem[] = [
  { type: 'hero', label: 'Titulo', icon: 'hero' },
  { type: 'text', label: 'Párrafo', icon: 'text' },
  { type: 'image', label: 'Imagen', icon: 'image' },
  { type: 'cards-grid', label: 'Tarjetas', icon: 'cards' },
  { type: 'cta', label: 'Call to Action', icon: 'cta' },
  { type: 'video', label: 'Video YouTube', icon: 'video' },
  { type: 'slides', label: 'Diapositivas', icon: 'slides' },
  ];
  readonly heroColorFields = HERO_COLOR_FIELDS;
  readonly textColorFields = TEXT_COLOR_FIELDS;
  readonly cardsColorFields = CARDS_COLOR_FIELDS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.pageId.set(id);

    // Intentar cargar inmediatamente
    const page = this.service.getById(id)();

    if (page) {
      this.pageTitle.set(page.title);
      this.readingTime.set(page.readingTime ?? 1);
      if (page.blocks.length > 0) {
        this.blocks.set([...page.blocks].sort((a, b) => a.order - b.order));
        return;
      }
    }

    // Si no hay datos aún, cargar directamente desde el backend
    this.http
      .get<any>(`${this.api}/Articles/admin/${id}`)
      .subscribe(article => {
        if (!article) {
          this.router.navigate(['/admin/pages']);
          return;
        }

        this.pageTitle.set(article.title);
        this.readingTime.set(article.readingTime ?? 1);

        let blocks: any[] = [];
        if (article.blocksJson) {
          try {
            blocks = JSON.parse(article.blocksJson);
          } catch {
            blocks = [];
          }
        }

        this.blocks.set(blocks.sort((a: any, b: any) => a.order - b.order));
      });
  }

  onDrop(event: CdkDragDrop<PageBlock[]>): void {
    const arr = [...this.blocks()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
  }

  moveBlock(index: number, dir: -1 | 1): void {
    const arr = [...this.blocks()];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
  }

  selectBlock(id: string): void {
    this.selectedId.set(id);
    document.getElementById(`block-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  deselect(): void {
    this.selectedId.set(null);
  }

  addBlock(type: BlockType): void {
    const id = `block-${Date.now()}`;
    const block = this.buildDefault(id, type);
    this.blocks.update((b) => [...b, block]);
    this.selectedId.set(id);
    setTimeout(() => {
      document.querySelector('.builder-canvas__end')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  removeBlock(id: string, event: Event): void {
    event.stopPropagation();
    this.blocks.update((b) => b.filter((bl) => bl.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  duplicateBlock(id: string, event: Event): void {
    event.stopPropagation();
    const original = this.blocks().find((b) => b.id === id);
    if (!original) return;
    const clone: PageBlock = {
      ...(original as any),
      id: `block-${Date.now()}`,
      data: { ...(original as any).data },
    };
    const idx = this.blocks().findIndex((b) => b.id === id);
    const arr = [...this.blocks()];
    arr.splice(idx + 1, 0, clone);
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
    this.selectedId.set(clone.id);
  }

  toggleVisibility(id: string, event: Event): void {
    event.stopPropagation();
    this.blocks.update((arr) => arr.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
  }

  updateProp(key: string, value: unknown): void {
    const id = this.selectedId();
    if (!id) return;
    this.blocks.update((arr) =>
      arr.map((b) => (b.id === id ? { ...b, data: { ...(b as any).data, [key]: value } } : b)),
    );
  }

  updateColorProp(key: string, value: string): void {
    const id = this.selectedId();
    if (!id) return;
    this.blocks.update((arr) =>
      arr.map((b) => {
        if (b.id !== id) return b;
        return { ...b, data: applyColorPatch((b as any).data, key, value) as any };
      }),
    );
  }

  onQuillChange(html: string): void {
    this.updateProp('html', html);
  }

  save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.service.updateBlocks(this.pageId(), this.blocks(), this.readingTime());
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    }, 600);
  }

  onReadingTimeChange(value: number | string): void {
    const n = Number(value);
    this.readingTime.set(Number.isFinite(n) && n >= 1 ? Math.round(n) : 1);
  }

  blockLabel(type: BlockType): string {
    return this.palette.find((p) => p.type === type)?.label ?? type;
  }

  numVal(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }

  strVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  getVideoEmbedUrl(url: string): SafeResourceUrl | null {
    const videoId = url?.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (!videoId) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`,
    );
  }

  private buildDefault(id: string, type: BlockType): PageBlock {
    const order = this.blocks().length + 1;
    switch (type) {
      case 'hero':
        return {
          id, type, visible: true, order,
          data: {
            title: 'Nuevo titulo',
            subtitle: 'Agrega un subtítulo aquí',
            titleLevel: 'h1',
            subtitleSize: 'md',
            ctaLabel: 'Ver más',
            ctaRoute: '/',
            overlay: false,
            ...defaultHeroColorData(),
          },
        };
      case 'text':
        return {
          id, type, visible: true, order,
          data: {
            title: 'Título de sección',
            html: '<p>Escribe tu contenido aquí...</p>',
            align: 'left',
            ...defaultTextColorData(),
          },
        };
      case 'image':
        return {
          id, type, visible: true, order,
          data: {
            src: 'https://placehold.co/1200x400',
            alt: 'Imagen',
            caption: '',
            fullWidth: false,
            align: 'center',
            width: 1200,
            height: 400,
            naturalWidth: 1200,
            naturalHeight: 400,
          },
        };
      case 'cards-grid':
        return {
          id, type, visible: true, order,
          data: {
            title: 'Nuestros servicios',
            subtitle: '',
            columns: 2,
            cards: [
              { title: 'Servicio 1', description: 'Descripción del servicio.' },
              { title: 'Servicio 2', description: 'Descripción del servicio.' },
            ],
            ...defaultCardsColorData(),
          },
        };
      case 'cta':
        return {
          id, type, visible: true, order,
          data: {
            title: '¿Listo para comenzar?',
            description: 'Contáctanos hoy.',
            primaryLabel: 'Contactar',
            primaryRoute: '/contacto',
            variant: 'primary',
          },
        };
      case 'video':
        return {
          id, type, visible: true, order,
          data: {
            url: '',
            title: '',
          },
        };
      case 'slides':
        return {
          id, type, visible: true, order,
          data: {
            title: '',
            canvaUrl: '',
          },
        };
      default:
        throw new Error(`Tipo de bloque desconocido: ${type}`);
    }
  }

  getCanvaEmbedUrl(url: string): SafeResourceUrl | null {
    const match = url?.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.canva.com/design/${match[1]}/view?embed`,
    );
  }
}
