import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PagesService } from '../services/pages.service';
import { Page } from '../models/page.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SnackbarNotificationService } from '../../../core/shared/snackbar-notification/snackbar-notification.service';

@Component({
  selector: 'app-pages-list',
  imports: [RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent, ModalComponent],
  templateUrl: './pages-list.component.html',
  styleUrl: './pages-list.component.scss',
})
export class PagesListComponent {
  private pagesService = inject(PagesService);
  private snackBarNotification = inject(SnackbarNotificationService);

  pages = this.pagesService.pages;
  searchQuery = signal('');
  pageToDelete = signal<Page | null>(null);
  deleteLoading = signal(false);

  filteredPages = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.pages();
    return this.pages().filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.categoryName?.toLowerCase().includes(q) ?? false) ||
        (p.subCategoryName?.toLowerCase().includes(q) ?? false),
    );
  });

  confirmDelete(page: Page): void {
    this.pageToDelete.set(page);
  }

  cancelDelete(): void {
    this.pageToDelete.set(null);
  }

  deletePage(): void {
    const page = this.pageToDelete();
    if (!page) return;

    this.deleteLoading.set(true);
    // Simula latencia
    setTimeout(() => {
      this.pagesService.delete(page.id);
      this.pageToDelete.set(null);
      this.deleteLoading.set(false);
      this.snackBarNotification.openCustomNotification('Página eliminada', `La página "${page.title}" ha sido eliminada.`, 'success');
    }, 600);
  }
}
