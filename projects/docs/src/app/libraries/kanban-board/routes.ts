import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Kanban Board'
  },
  {
    path: 'basic-example',
    pathMatch: 'full',
    loadComponent: () => import('./basic-example/basic-example').then(c => c.BasicExample),
    title: 'Kanban Board'
  },
];
