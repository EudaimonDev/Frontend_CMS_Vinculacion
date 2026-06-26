import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageFormData } from '../models/page.model';
import { environment } from '../../../../environments/environment';
import { PagesService } from '../services/pages.service';
import { PageBlock, BlockType } from '../../../frontoffice/core/models/block.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BlockColorEditorComponent } from '../../shared/components/block-color-editor/block-color-editor.component';
import { CardsEditorComponent } from '../../shared/components/cards-editor/cards-editor.component';
import {
  applyColorPatch,
  CARDS_COLOR_FIELDS,
  HERO_COLOR_FIELDS,
  TEXT_COLOR_FIELDS,
} from '../../shared/utils/block-color.util';


type EditorMode = 'new' | 'edit';

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-page-editor',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, BlockColorEditorComponent, CardsEditorComponent],
  templateUrl: './page-editor.component.html',
  styleUrl: './page-editor.component.scss',
})
export class PageEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PagesService);
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  categories = signal<any[]>([]);

  mode = signal<EditorMode>('new');
  pageId = signal<string | null>(null);
  saving = signal(false);
  saved = signal(false);
  blocks = signal<PageBlock[]>([]);
  showPicker = signal(false);
  expandedBlock = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', Validators.required],
    status: ['draft' as 'published' | 'draft' | 'archived'],
    description: [''],
    categoryId: [null as number | null],
    featured: [false]
  });

  blockOptions: BlockOption[] = [
    { type: 'hero', label: 'Titulo', description: 'Banner principal con título y CTA', icon: 'hero' },
    { type: 'text', label: 'Texto', description: 'Bloque de contenido HTML', icon: 'text' },
    { type: 'slides', icon: 'slides', label: 'Diapositivas', description: 'Inserta una presentación de Canva' },
    {
      type: 'image',
      label: 'Imagen',
      description: 'Imagen con pie de foto opcional',
      icon: 'image',
    },
    {
      type: 'cards-grid',
      label: 'Tarjetas',
      description: 'Cuadrícula de tarjetas informativas',
      icon: 'cards',
    },
    {
      type: 'cta',
      label: 'Call to Action',
      description: 'Sección de llamada a la acción',
      icon: 'cta',
    },
    {
      type: 'video' as BlockType,
      label: 'Video YouTube',
      description: 'Embed de video de YouTube',
      icon: 'video'
    },
  ];

  readonly heroColorFields = HERO_COLOR_FIELDS;
  readonly textColorFields = TEXT_COLOR_FIELDS;
  readonly cardsColorFields = CARDS_COLOR_FIELDS;

  headerTitle = computed(() =>
    this.mode() === 'new' ? 'Nueva página' : `Editar: ${this.form.value.title || '...'}`,
  );

  breadcrumbs = computed(() => [
    { label: 'Inicio', route: '/admin/dashboard' },
    { label: 'Páginas', route: '/admin/pages' },
    { label: this.mode() === 'new' ? 'Nueva' : 'Editar' },
  ]);

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  this.http.get<any[]>(`${environment.apiUrl}/Categories`)
    .subscribe(cats => this.categories.set(cats));

  if (id) {
    this.mode.set('edit');
    this.pageId.set(id);

    // Cargar directo del backend para tener categoryId
    this.http.get<any>(`${environment.apiUrl}/Articles/admin/${id}`)
      .subscribe(article => {
        // Buscar el categoryId comparando el slug de category con las categorías
        this.categories().forEach(() => {}); // esperar categorías...

        // Cargar categorías y artículo juntos
        this.http.get<any[]>(`${environment.apiUrl}/Categories`).subscribe(cats => {
          this.categories.set(cats);
          const matchedCat = cats.find(c => c.slug === article.category);

          this.form.patchValue({
            title: article.title,
            slug: (article.slug ?? '').replace(/^\/+/, ''),
            status: article.statusName === 'Published' ? 'published' : 'draft',
            description: article.excerpt ?? '',
            categoryId: matchedCat?.categoryId ?? null,
            featured: article.featured ?? false
          });
        });

        // Cargar bloques
        if (article.blocksJson) {
          try {
            this.blocks.set(JSON.parse(article.blocksJson));
          } catch { this.blocks.set([]); }
        }
      });
  }

  this.form.get('title')!.valueChanges.subscribe((title) => {
    if (this.mode() === 'new' && title) {
      this.form.get('slug')!.setValue(this.service.slugify(title), { emitEvent: false });
    }
  });
}

  // ── Bloques ──────────────────────────────────────────────────

  addBlock(type: BlockType): void {
    const id = `block-${Date.now()}`;
    const newBlock = this.buildDefaultBlock(id, type);
    this.blocks.update((b) => [...b, newBlock]);
    this.showPicker.set(false);
    this.expandedBlock.set(id);
  }

  removeBlock(id: string): void {
    this.blocks.update((b) => b.filter((bl) => bl.id !== id));
    if (this.expandedBlock() === id) this.expandedBlock.set(null);
  }

  toggleBlock(id: string): void {
    this.expandedBlock.update((cur) => (cur === id ? null : id));
  }

  moveBlock(index: number, dir: -1 | 1): void {
    const arr = [...this.blocks()];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
  }

  updateBlockData(id: string, patch: Record<string, unknown>): void {
    this.blocks.update((arr) =>
      arr.map((b) => (b.id === id ? { ...b, data: { ...(b as any).data, ...patch } } : b)),
    );
  }

  updateBlockColor(id: string, key: string, value: string): void {
    this.blocks.update((arr) =>
      arr.map((b) => {
        if (b.id !== id) return b;
        return { ...b, data: applyColorPatch((b as any).data, key, value) as any };
      }),
    );
  }

  toggleBlockVisibility(id: string): void {
    this.blocks.update((arr) => arr.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
  }

  // ── Guardar ──────────────────────────────────────────────────

  onSave(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.saving.set(true);

  const formData = this.form.value as PageFormData;

  // Convertir TODOS los bloques a contentHtml
  const contentHtml = this.service.blocksToHtml(this.blocks()) || '<p></p>';

  if (this.mode() === 'new') {
    const body = {
      title: formData.title,
      slug: (formData.slug ?? '').replace(/^\/+/, ''),  // ← quita el / inicial
      contentHtml,
      blocksJson: JSON.stringify(this.blocks()),
      excerpt: formData.description ?? '',
      emoji: '📄',
      readingTime: 1,
      featured: formData.featured ?? false,
      categoryIds: formData.categoryId ? [Number(formData.categoryId)] : [] as number[]
    };

    this.http.post<any>(`${this.api}/Articles/admin`, body).subscribe({
      next: article => {
        if (formData.status === 'published') {
          this.http.patch(`${this.api}/Articles/admin/${article.id}/status`,
            { statusId: 2 }).subscribe();
        }
        this.saving.set(false);
        this.saved.set(true);
        this.router.navigate(['/admin/pages', article.id, 'edit']);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: () => this.saving.set(false)
    });
  } else {
  const body = {
    title: formData.title,
    slug: (formData.slug ?? '').replace(/^\/+/, ''),  // ← quita el / inicial
    contentHtml,
    blocksJson: JSON.stringify(this.blocks()),
    excerpt: formData.description ?? '',
    emoji: '📄',
    readingTime: 1,
    featured: formData.featured ?? false,
    categoryIds: formData.categoryId ? [Number(formData.categoryId)] : [] as number[]  // ← fix
  };
  console.log('PUT body:', JSON.stringify(body, null, 2));
  console.log('featured value:', this.form.get('featured')?.value);
  this.http.put(`${this.api}/Articles/admin/${this.pageId()}`, body).subscribe({
    next: () => {
      if (formData.status !== undefined) {
        const statusId = formData.status === 'published' ? 2 : 1;
        this.http.patch(`${this.api}/Articles/admin/${this.pageId()}/status`,
          { statusId }).subscribe();
      }
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    },
    error: () => this.saving.set(false)
  });
}
}

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }

  blockLabel(type: BlockType): string {
    return this.blockOptions.find((o) => o.type === type)?.label ?? type;
  }

  // ── Builder bloques por defecto ───────────────────────────────

  private buildDefaultBlock(id: string, type: BlockType): PageBlock {
    const order = this.blocks().length + 1;
    switch (type) {
      case 'hero':
        return {
          id,
          type,
          visible: true,
          order,
          data: { title: 'Nuevo titulo', subtitle: '', ctaLabel: '', ctaRoute: '/', overlay: false },
        };
      case 'text':
        return {
          id,
          type,
          visible: true,
          order,
          data: { title: '', html: '<p>Contenido aquí...</p>', align: 'left' },
        };
      case 'image':
        return {
          id,
          type,
          visible: true,
          order,
          data: { src: '', alt: '', caption: '', fullWidth: false },
        };
      case 'cards-grid':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            title: 'Nuestros servicios',
            subtitle: '',
            columns: 2,
            cards: [
              { title: 'Servicio 1', description: 'Descripción del servicio.' },
              { title: 'Servicio 2', description: 'Descripción del servicio.' },
            ],
          },
        };
      case 'cta':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            title: 'Título CTA',
            description: '',
            primaryLabel: 'Ver más',
            primaryRoute: '/',
            variant: 'primary',
          },
        };
        case 'video':
        return {
          id,
          type,
          visible: true,
          order,
          data: { url: '', title: '' }
        };
      case 'slides':
      return { id, type, visible: true, order, data: { title: '', canvaUrl: '' } };
      default:
        throw new Error(`Tipo de bloque desconocido: ${type}`);
    }
  }
}
