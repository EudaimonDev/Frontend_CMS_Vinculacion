import { Routes } from '@angular/router';
import { PageLayoutComponent } from './shared/layouts/page-layout.component';
import { gatekeeperGuard } from './core/guards/gatekeeper.guard';

export const FRONTOFFICE_ROUTES: Routes = [
  {
    path: 'acceso',
    loadComponent: () =>
      import('./gatekeeper/pages/gate-page/gate-page.component').then((m) => m.GatePageComponent),
  },
  {
    path: '',
    component: PageLayoutComponent,
    canActivate: [gatekeeperGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'articulo/:id',
        loadComponent: () =>
          import('./pages/article-detail/article-detail.component').then(
            (m) => m.ArticleDetailComponent,
          ),
      },
      {
        path: 'categoria/:slug',
        loadComponent: () =>
          import('./pages/category/category.component').then((m) => m.CategoryComponent),
      },
      {
        path: 'explorar',
        loadComponent: () =>
          import('./pages/explore-all/explore-all').then((m) => m.ExploreAllComponent),
      },
      {
        path: 'explorar-galeria',
        loadComponent: () =>
          import('./pages/explore-gallery/explore-gallery').then((m) => m.ExploreGalleryComponent),
      },
    ],
  },
];
