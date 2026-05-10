import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    title: 'Line Chart',
    children: [
      {
        path: '',
        loadComponent: () => import('./overview/overview').then(c => c.Overview),
        title: 'Line Chart'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(c => c.Api),
        title: 'Line Chart / Api'
      }
    ]
  }
];
