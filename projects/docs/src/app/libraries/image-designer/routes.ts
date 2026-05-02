import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Image Designer'
  },
  {
    path: 'basic-example',
    loadComponent: () => import('./basic-example/basic-example').then(c => c.BasicExample),
    title: 'Image Designer Basic Example'
  },
];
