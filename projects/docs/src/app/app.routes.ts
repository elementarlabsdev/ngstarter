import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
    title: 'Overview'
  },
  {
    path: 'installation',
    loadComponent: () => import('./installation/installation').then(c => c.Installation),
    title: 'Installation'
  },
  {
    path: 'theme',
    loadChildren: () => import('./theme/routes').then(m => m.routes),
    title: 'Theme'
  },
  {
    path: 'forms',
    loadChildren: () => import('./forms/routes').then(m => m.routes),
    title: 'Forms'
  },
  {
    path: 'components',
    loadChildren: () => import('./components/components.routes').then(m => m.routes),
    title: 'Components'
  },
  {
    path: 'libraries',
    loadChildren: () => import('./libraries/routes').then(m => m.routes),
    title: 'Libraries'
  },
  {
    path: 'navigation',
    loadChildren: () => import('./navigation/routes').then(m => m.routes),
    title: 'Navigation'
  },
  {
    path: 'micro-charts',
    loadChildren: () => import('./micro-charts/routes').then(m => m.routes),
    title: 'Micro Charts'
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./error/not-found/not-found').then(c => c.NotFound)
  }
];
