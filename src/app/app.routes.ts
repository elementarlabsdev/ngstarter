import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then(c => c.Home),
  },
  {
    path: 'license',
    title: 'License | NgStarter',
    loadComponent: () => import('./pages/license/license').then(c => c.License),
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | NgStarter',
    loadComponent: () => import('./pages/privacy/privacy').then(c => c.Privacy),
  },
  {
    path: 'terms',
    title: 'Terms of Service | NgStarter',
    loadComponent: () => import('./pages/terms/terms').then(c => c.Terms),
  },
  // {
  //   path: '**',
  //   title: 'Page Not Found',
  //   loadComponent: () => import('./error/not-found/not-found').then(c => c.NotFound)
  // }
];
