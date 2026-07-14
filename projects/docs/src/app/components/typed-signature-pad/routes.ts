import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    title: 'Typed Signature Pad',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(c => c.Overview),
        title: 'Typed Signature Pad / Overview'
      },
      {
        path: 'examples',
        loadComponent: () => import('./examples/examples').then(c => c.Examples),
        title: 'Typed Signature Pad / Examples'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(c => c.Api),
        title: 'Typed Signature Pad / Api'
      }
    ]
  }
];
