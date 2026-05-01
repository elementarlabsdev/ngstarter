import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Guided Tour',
    loadComponent: () => import('./overview/overview').then(c => c.Overview)
  }
];
