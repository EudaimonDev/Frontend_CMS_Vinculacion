import { Routes } from '@angular/router';

export const catalogsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./catalogs-list/catalogs-list.component').then(m => m.CatalogsListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./catalog-editor/catalog-editor.component').then(m => m.CatalogEditorComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./catalog-editor/catalog-editor.component').then(m => m.CatalogEditorComponent)
  }
];
