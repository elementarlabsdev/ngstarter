import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Image Designer'
  },
];
