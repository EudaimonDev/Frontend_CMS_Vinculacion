import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '../core/guards/auth.guard';

export const backofficeRoutes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    // Builder fuera del layout principal (pantalla completa)
    path: 'pages/:id/builder',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/page-builder/page-builder.component').then(m => m.PageBuilderComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/users').then(m => m.Users)
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./pages/pages.routes').then(m => m.pagesRoutes)
      },
      {
        path: 'catalogs',
        loadChildren: () =>
          import('./catalogs/catalogs.routes').then(m => m.catalogsRoutes)
      },
      {
        path: 'media',
        loadChildren: () =>
          import('./multimedia/multimedia.routes').then(m => m.multimediaRoutes)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
