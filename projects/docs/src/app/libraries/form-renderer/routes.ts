import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(m => m.Common),
    title: 'Form Renderer',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(m => m.Overview),
        title: 'Form Renderer / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(m => m.Api),
        title: 'Form Renderer / Api'
      }
    ]
  }
];
