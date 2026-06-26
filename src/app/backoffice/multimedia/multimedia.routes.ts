import { Routes } from '@angular/router';
import { Multimedia } from './multimedia.component';


export const multimediaRoutes: Routes = [
  {
    path: '',
    component: Multimedia,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/media-grid/media-grid.component')
            .then(m => m.MediaGridComponent)
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./components/media-list/media-list.component')
            .then(m => m.MediaListComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./components/media-detail/media-detail.component')
            .then(m => m.MediaDetailComponent)
      }
    ]
  }
];