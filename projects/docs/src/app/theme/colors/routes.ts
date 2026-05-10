import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Colors'
  }
];
