import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then(c => c.Home),
  },
  // {
  //   path: '**',
  //   title: 'Page Not Found',
  //   loadComponent: () => import('./error/not-found/not-found').then(c => c.NotFound)
  // }
];
