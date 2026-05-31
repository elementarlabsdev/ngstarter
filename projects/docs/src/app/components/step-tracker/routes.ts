import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    title: 'Step Tracker',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(c => c.Overview),
        title: 'Step Tracker / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(c => c.Api),
        title: 'Step Tracker / Api'
      }
    ]
  }
];
