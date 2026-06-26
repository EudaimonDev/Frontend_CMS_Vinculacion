import { Routes } from '@angular/router';

export const pagesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages-list/pages-list.component').then(m => m.PagesListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./page-editor/page-editor.component').then(m => m.PageEditorComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./page-editor/page-editor.component').then(m => m.PageEditorComponent)
  },
  {
    path: ':id/builder',
    loadComponent: () =>
      import('./page-builder/page-builder.component').then(m => m.PageBuilderComponent)
  }
];
