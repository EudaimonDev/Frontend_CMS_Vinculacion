import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CatalogFormData, CatalogStatus, CatalogTheme, CatalogVisibility } from '../models/catalog.model';
import { CatalogsService } from '../services/catalogs.service';
import { environment } from '../../../../environments/environment';

type EditorMode = 'new' | 'edit';

@Component({
  selector: 'app-catalog-editor',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './catalog-editor.component.html',
  styleUrl: './catalog-editor.component.scss',
})
export class CatalogEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogsService = inject(CatalogsService);
  private http = inject(HttpClient);

  readonly mode = signal<EditorMode>('new');
  readonly catalogId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly articles = signal<any[]>([]);
  readonly articleCount = signal<number>(0);

  readonly statusOptions: { value: CatalogStatus; label: string }[] = [
    { value: 'draft',    label: 'Borrador'  },
    { value: 'active',   label: 'Activo'    },
    { value: 'archived', label: 'Archivado' },
  ];

  readonly visibilityOptions: { value: CatalogVisibility; label: string }[] = [
    { value: 'public',  label: 'Público'  },
    { value: 'private', label: 'Privado'  },
  ];

  readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(3)]],
    slug:        ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(12)]],
    status:      ['draft' as CatalogStatus],
    visibility:  ['public' as CatalogVisibility],
    theme:       ['blue' as CatalogTheme],
    imageUrl:    ['']
  });

  readonly headerTitle = computed(() =>
    this.mode() === 'new' ? 'Nuevo catálogo' : `Editar: ${this.form.value.name?.trim() || 'Catálogo'}`
  );

  readonly breadcrumbs = computed(() => [
    { label: 'Inicio',    route: '/admin/dashboard' },
    { label: 'Catálogos', route: '/admin/catalogs'  },
    { label: this.mode() === 'new' ? 'Nuevo' : 'Editar' },
  ]);

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.mode.set('edit');
    this.catalogId.set(id);

    this.http.get<any[]>(`${environment.apiUrl}/Categories/admin`).subscribe(cats => {
      const cat = cats.find((c: any) => c.categoryId.toString() === id);
      if (cat) {
        this.form.patchValue({
          name:        cat.name,
          slug:        cat.slug,
          description: cat.description ?? '',
          status:      cat.isPublicVisible ? 'active' : 'draft',
          visibility:  cat.isPublicVisible ? 'public' : 'private',
          theme:       'blue',
          imageUrl:    cat.imageUrl ?? ''
        });

        // Cargar artículos de esta categoría por slug
        this.http.get<any>(`${environment.apiUrl}/Articles/admin`, {
          params: { page: 1, pageSize: 100 }
        }).subscribe(response => {
          const all = Array.isArray(response) ? response : (response.items ?? []);
          this.articles.set(all.filter((a: any) => a.category === cat.slug));
          this.articleCount.set(cat.articleCount ?? 0);
        });
      }
    });
  }

  this.form.controls.name.valueChanges.subscribe(name => {
    if (this.mode() === 'new' && name) {
      this.form.controls.slug.setValue(this.catalogsService.slugify(name), { emitEvent: false });
    }
  });
}

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const data: CatalogFormData = {
      name:        value.name?.trim() || '',
      slug:        this.catalogsService.slugify(value.slug || value.name || ''),
      description: value.description?.trim() || '',
      status:      value.status as CatalogStatus,
      visibility:  value.visibility as CatalogVisibility,
      theme:       value.theme as CatalogTheme,
      itemLabel:   'Artículo',
      imageUrl:    value.imageUrl?.startsWith('http') ? value.imageUrl.trim() : undefined
    };

    setTimeout(() => {
      if (this.mode() === 'new') {
        const catalog = this.catalogsService.create(data, []);
        this.catalogId.set(catalog.id);
        this.mode.set('edit');
        this.router.navigate(['/admin/catalogs', catalog.id, 'edit']);
      } else {
        this.catalogsService.update(this.catalogId()!, data);
      }

      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    }, 650);
  }

  fieldError(field: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[field];
    return !!(control.hasError(error) && control.touched);
  }

  visibilityLabel(visibility: CatalogVisibility): string {
    return visibility === 'public' ? 'Público' : 'Privado';
  }
}
