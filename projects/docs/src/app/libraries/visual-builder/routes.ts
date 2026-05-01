import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'overview',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Visual Builder'
  },
  {
    path: 'basic-example',
    loadComponent: () => import('./basic-example/basic-example').then(c => c.BasicExample),
    title: 'Visual Builder'
  },
];
