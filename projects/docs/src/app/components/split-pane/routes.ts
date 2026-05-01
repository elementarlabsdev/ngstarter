import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Split',
    loadComponent: () => import('./overview/overview').then(c => c.Overview)
  }
];
