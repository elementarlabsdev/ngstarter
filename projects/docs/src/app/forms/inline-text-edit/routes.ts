import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(c => c.Overview),
        title: 'Inline Text Edit / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(c => c.Api),
        title: 'Inline Text Edit / Api'
      }
    ]
  }
];
