import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then((c) => c.Overview),
    title: 'Motion',
  },
  {
    path: 'basic-example',
    pathMatch: 'full',
    loadComponent: () => import('./basic-example/basic-example').then((c) => c.BasicExample),
    title: 'Motion Basic Example',
  },
];
