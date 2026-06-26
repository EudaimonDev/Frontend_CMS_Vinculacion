import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./backoffice/backoffice.routes').then((m) => m.backofficeRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('./frontoffice/frontoffice.routes').then((m) => m.FRONTOFFICE_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
