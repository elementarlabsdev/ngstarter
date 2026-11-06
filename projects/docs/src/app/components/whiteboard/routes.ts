import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'demo', loadComponent: () => import('./demo/demo').then(c => c.Demo), title: 'Whiteboard demo' },
  {
    path: '', loadComponent: () => import('./common/common').then(c => c.Common), title: 'Whiteboard',
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./overview/overview').then(c => c.Overview), title: 'Whiteboard / Overview' },
      { path: 'api', loadComponent: () => import('./api/api').then(c => c.Api), title: 'Whiteboard / Api' },
    ],
  },
];
