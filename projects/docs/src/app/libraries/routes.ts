import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'image-designer',
    loadChildren: () => import('./image-designer/routes').then(m => m.routes),
  },
  {
    path: 'data-view',
    loadChildren: () => import('./data-view/routes').then(m => m.routes),
  },
  {
    path: 'kanban-board',
    loadChildren: () => import('./kanban-board/routes').then(m => m.routes),
  },
  {
    path: 'content-editor',
    loadChildren: () => import('./content-editor/routes').then(m => m.routes),
  },
  {
    path: 'visual-builder',
    loadChildren: () => import('./visual-builder/routes').then(m => m.routes),
  },
  {
    path: 'video-player',
    loadChildren: () => import('./video-player/routes').then(m => m.routes),
  },
];
