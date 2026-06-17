import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'examples',
    loadComponent: () => import('./examples/examples').then(m => m.Examples),
    title: 'Form Builder / Examples'
  },
  {
    path: '',
    loadComponent: () => import('./common/common').then(m => m.Common),
    title: 'Form Builder',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(m => m.Overview),
        title: 'Form Builder / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(m => m.Api),
        title: 'Form Builder / Api'
      },
      {
        path: 'form-renderer',
        loadComponent: () => import('./form-renderer/renderer').then(m => m.Renderer),
        title: 'Form Builder / Form Renderer'
      }
    ]
  }
];
