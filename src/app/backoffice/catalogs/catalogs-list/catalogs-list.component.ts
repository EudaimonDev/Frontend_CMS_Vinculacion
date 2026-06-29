import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SnackbarNotificationService } from '../../../core/shared/snackbar-notification/snackbar-notification.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { Catalog, CatalogEstado, CatalogTheme, CatalogVisibility } from '../models/catalog.model';
import { CatalogsService } from '../services/catalogs.service';
import { BadgeStatus } from '../../shared/components/status-badge/status-badge';

type CatalogFilter = 'all' | CatalogEstado;

interface FilterOption {
  value: CatalogFilter;
  label: string;
  count: number;
}

@Component({
  selector: 'app-catalogs-list',
  imports: [RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent, ModalComponent],
  templateUrl: './catalogs-list.component.html',
  styleUrl: './catalogs-list.component.scss',
})
export class CatalogsListComponent {
  private readonly router = inject(Router);
  private readonly catalogsService = inject(CatalogsService);
  private readonly snackBarNotification = inject(SnackbarNotificationService);

  readonly catalogs = this.catalogsService.catalogs;
  readonly metrics = this.catalogsService.metrics;

  readonly searchQuery = signal('');
  readonly statusFilter = signal<CatalogFilter>('all');
  readonly catalogToDelete = signal<Catalog | null>(null);
  readonly deleteLoading = signal(false);

  readonly filterOptions = computed<FilterOption[]>(() => {
    const catalogs = this.catalogs();

    return [
      { value: 'all', label: 'Todos', count: catalogs.length },
      {
        value: 'publicado',
        label: 'Publicados',
        count: catalogs.filter((catalog) => catalog.estado === 'publicado').length,
      },
      {
        value: 'borrador',
        label: 'Borradores',
        count: catalogs.filter((catalog) => catalog.estado === 'borrador').length,
      },
      {
        value: 'archivado',
        label: 'Archivados',
        count: catalogs.filter((catalog) => catalog.estado === 'archivado').length,
      },
    ];
  });

  readonly filteredCatalogs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.statusFilter();

    return this.catalogs().filter((catalog) => {
      const matchesFilter = filter === 'all' || catalog.estado === filter;
      const matchesQuery =
        !query ||
        catalog.name.toLowerCase().includes(query) ||
        catalog.slug.toLowerCase().includes(query) ||
        catalog.description.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  });

  selectFilter(filter: CatalogFilter): void {
    this.statusFilter.set(filter);
  }

  duplicateCatalog(catalog: Catalog): void {
    const duplicatedCatalog = this.catalogsService.duplicate(catalog.id);

    if (!duplicatedCatalog) {
      return;
    }

    this.router.navigate(['/admin/catalogs', duplicatedCatalog.id, 'edit']);
  }

  confirmDelete(catalog: Catalog): void {
    this.catalogToDelete.set(catalog);
  }

  cancelDelete(): void {
    this.catalogToDelete.set(null);
  }

  deleteCatalog(): void {
    const catalog = this.catalogToDelete();

    if (!catalog) {
      return;
    }

    this.deleteLoading.set(true);

    this.catalogsService.delete(catalog.id).subscribe({
      next: () => {
        this.catalogToDelete.set(null);
        this.deleteLoading.set(false);
        this.snackBarNotification.openCustomNotification(
          'Catálogo eliminado',
          `«${catalog.name}» ha sido eliminado correctamente.`,
          'success',
        );
      },
      error: (err: HttpErrorResponse) => {
        this.deleteLoading.set(false);
        this.snackBarNotification.openCustomNotification(
          'No se puede eliminar',
          this.resolveDeleteErrorMessage(err),
          'error',
          { duration: 7000 },
        );
      },
    });
  }

  private resolveDeleteErrorMessage(err: HttpErrorResponse): string {
    if (typeof err.error?.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }

    if (err.status === 403) {
      return 'No tienes permisos para eliminar catálogos.';
    }

    if (err.status === 404) {
      return 'El catálogo ya no existe o fue eliminado previamente.';
    }

    return 'No se pudo eliminar el catálogo. Inténtalo de nuevo.';
  }

  visibilityLabel(visibility: CatalogVisibility): string {
    return visibility === 'public' ? 'Público' : 'Privado';
  }

  themeLabel(theme: CatalogTheme): string {
    switch (theme) {
      case 'blue':
        return 'Institucional';
      case 'teal':
        return 'Clínico';
      case 'sand':
        return 'Editorial';
      case 'rose':
        return 'Humano';
    }
  }

  featuredItems(catalog: Catalog): number {
    return catalog.items.filter((item) => item.featured).length;
  }

  itemLabel(catalog: Catalog): string {
    const count = catalog.items.length;
    const base = catalog.itemLabel.toLowerCase();
    const suffix = count === 1 ? '' : 's';
    return `${count} ${base}${suffix}`;
  }

  estadoBadge(estado: CatalogEstado): BadgeStatus {
    if (estado === 'publicado') return 'published';
    if (estado === 'archivado') return 'archived';
    return 'draft';
  }
}
