import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('../@meta/category-overview/category-overview').then(c => c.CategoryOverview),
    title: 'Angular UI Libraries',
    data: {
      seoIntro: 'The NgStarter Angular UI libraries documentation covers advanced components for data grids, schema-driven forms, Kanban boards, visual builders, content editors, image design, and video playback in complex admin and product workflows.'
    }
  },
  {
    path: 'image-designer',
    loadChildren: () => import('./image-designer/routes').then(m => m.routes),
    title: 'Image Designer'
  },
  {
    path: 'data-view',
    loadChildren: () => import('./data-view/routes').then(m => m.routes),
    title: 'Data View'
  },
  {
    path: 'form-renderer',
    loadChildren: () => import('./form-renderer/routes').then(m => m.routes),
    title: 'Form Renderer'
  },
  {
    path: 'kanban-board',
    loadChildren: () => import('./kanban-board/routes').then(m => m.routes),
    title: 'Kanban Board'
  },
  {
    path: 'content-editor',
    loadChildren: () => import('./content-editor/routes').then(m => m.routes),
    title: 'Content Editor'
  },
  {
    path: 'visual-builder',
    loadChildren: () => import('./visual-builder/routes').then(m => m.routes),
    title: 'Visual Builder'
  },
  {
    path: 'video-player',
    loadChildren: () => import('./video-player/routes').then(m => m.routes),
    title: 'Video Player'
  },
];
