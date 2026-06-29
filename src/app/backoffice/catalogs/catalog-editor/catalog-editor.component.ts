import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ImagePickerComponent } from '../../shared/components/image-picker/image-picker.component';
import {
  CatalogEstado,
  CatalogFormData,
  CatalogTheme,
  CatalogVisibility,
  CATALOG_ESTADO_LABELS,
  SubCategory,
  mapEstadoFromApi,
} from '../models/catalog.model';
import { CatalogsService } from '../services/catalogs.service';
import { environment } from '../../../../environments/environment';

type EditorMode = 'new' | 'edit';

@Component({
  selector: 'app-catalog-editor',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, ImagePickerComponent],
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
  readonly showImagePicker = signal(false);
  readonly articles = signal<any[]>([]);
  readonly articleCount = signal<number>(0);
  private readonly expandedSubCats = signal<Set<number>>(new Set());

  readonly estadoOptions: { value: CatalogEstado; label: string }[] = [
    { value: 'borrador', label: CATALOG_ESTADO_LABELS.borrador },
    { value: 'publicado', label: CATALOG_ESTADO_LABELS.publicado },
    { value: 'archivado', label: CATALOG_ESTADO_LABELS.archivado },
  ];

  readonly visibilityOptions: { value: CatalogVisibility; label: string }[] = [
    { value: 'public', label: 'Público' },
    { value: 'private', label: 'Privado' },
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(12)]],
    estado: ['borrador' as CatalogEstado],
    visibility: ['public' as CatalogVisibility],
    theme: ['blue' as CatalogTheme],
    imageUrl: [''],
    subCategories: this.fb.array<FormGroup>([]),
  });

  readonly headerTitle = computed(() =>
    this.mode() === 'new' ? 'Nuevo catálogo' : `Editar: ${this.form.value.name?.trim() || 'Catálogo'}`
  );

  readonly breadcrumbs = computed(() => [
    { label: 'Inicio', route: '/admin/dashboard' },
    { label: 'Catálogos', route: '/admin/catalogs' },
    { label: this.mode() === 'new' ? 'Nuevo' : 'Editar' },
  ]);

  get subCategoriesForm(): FormArray<FormGroup> {
    return this.form.controls.subCategories;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.mode.set('edit');
      this.catalogId.set(id);
      this.loadCategory(id);
    }
  }

  private loadCategory(id: string): void {
    this.catalogsService.getByIdFromApi(id).subscribe({
      next: cat => {
        this.form.patchValue({
          name: cat.name,
          description: cat.description ?? '',
          estado: mapEstadoFromApi(cat.estado),
          visibility: cat.isPublicVisible ? 'public' : 'private',
          theme: 'blue',
          imageUrl: cat.imageUrl ?? '',
        });

        this.subCategoriesForm.clear();
        this.expandedSubCats.set(new Set());
        (cat.subCategories ?? []).forEach((sub: any) => {
          this.subCategoriesForm.push(this.createSubCategoryGroup(this.catalogsService.mapSubCategory(sub)));
        });

        this.http.get<any>(`${environment.apiUrl}/Articles/admin`, {
          params: { page: 1, pageSize: 100 },
        }).subscribe(response => {
          const all = Array.isArray(response) ? response : (response.items ?? []);
          this.articles.set(all.filter((a: any) => a.category === cat.slug));
          this.articleCount.set(cat.articleCount ?? 0);
        });
      },
      error: () => this.router.navigate(['/admin/catalogs']),
    });
  }

  createSubCategoryGroup(sub?: SubCategory): FormGroup {
    return this.fb.group({
      subCategoryId: [sub?.subCategoryId ?? null],
      name: [sub?.name ?? '', Validators.required],
      description: [sub?.description ?? ''],
      estado: [sub?.estado ?? ('borrador' as CatalogEstado)],
    });
  }

  addSubCategory(): void {
    const index = this.subCategoriesForm.length;
    this.subCategoriesForm.push(this.createSubCategoryGroup());
    this.expandedSubCats.update(set => new Set(set).add(index));
  }

  removeSubCategory(index: number): void {
    this.subCategoriesForm.removeAt(index);
    this.expandedSubCats.update(set => {
      const next = new Set<number>();
      for (const i of set) {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      }
      return next;
    });
  }

  isSubCategoryExpanded(index: number): boolean {
    return this.expandedSubCats().has(index);
  }

  toggleSubCategory(index: number): void {
    this.expandedSubCats.update(set => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  subCategoryTitle(index: number): string {
    const name = this.subCategoriesForm.at(index)?.get('name')?.value?.trim();
    return `${index + 1}. ${name || 'Sin nombre'}`;
  }

  openImagePicker(): void {
    this.showImagePicker.set(true);
  }

  onImageSelected(url: string): void {
    this.form.patchValue({ imageUrl: url });
    this.showImagePicker.set(false);
  }

  clearCoverImage(): void {
    this.form.patchValue({ imageUrl: '' });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const data: CatalogFormData = {
      name: value.name?.trim() || '',
      description: value.description?.trim() || '',
      estado: value.estado as CatalogEstado,
      visibility: value.visibility as CatalogVisibility,
      theme: value.theme as CatalogTheme,
      itemLabel: 'Artículo',
      imageUrl: value.imageUrl?.trim() || undefined,
      subCategories: (value.subCategories ?? []).map((sub: Record<string, unknown>) => ({
        subCategoryId: (sub['subCategoryId'] as number | null) ?? undefined,
        name: String(sub['name'] ?? '').trim(),
        description: String(sub['description'] ?? '').trim(),
        estado: sub['estado'] as CatalogEstado,
      })),
    };

    if (this.mode() === 'new') {
      this.catalogsService.create(data).subscribe({
        next: cat => {
          this.catalogId.set(cat.categoryId.toString());
          this.mode.set('edit');
          this.catalogsService.loadAll();
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 2500);
          this.router.navigate(['/admin/catalogs', cat.categoryId, 'edit']);
        },
        error: () => this.saving.set(false),
        complete: () => this.saving.set(false),
      });
    } else {
      this.catalogsService.update(this.catalogId()!, data).subscribe({
        next: () => {
          this.catalogsService.loadAll();
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 2500);
        },
        error: () => this.saving.set(false),
        complete: () => this.saving.set(false),
      });
    }
  }

  fieldError(field: 'name' | 'description', error: string): boolean {
    const control = this.form.controls[field];
    return !!(control.hasError(error) && control.touched);
  }

  subFieldError(index: number, field: 'name', error: string): boolean {
    const control = this.subCategoriesForm.at(index)?.get(field);
    return !!(control?.hasError(error) && control.touched);
  }

  hasCoverPreview(): boolean {
    const url = this.form.value.imageUrl?.trim();
    return !!url && (url.startsWith('http') || url.startsWith('/'));
  }
}
