import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    title: 'Checkbox',
    children: [
      {
        path: '',
        title: 'Checkbox',
        loadComponent: () => import('./overview/overview').then(c => c.Overview)
      },
      {
        path: 'api',
        title: 'Checkbox API',
        loadComponent: () => import('./api/api').then(c => c.Api)
      }
    ]
  }
];
