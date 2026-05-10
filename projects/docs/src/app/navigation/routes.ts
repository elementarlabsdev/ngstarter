import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'breadcrumbs',
    loadChildren: () => import('./breadcrumbs/routes').then(m => m.routes),
    title: 'Breadcrumbs'
  },
  {
    path: 'tab-panel',
    loadChildren: () => import('./tab-panel/routes').then(m => m.routes),
    title: 'Tab Panel'
  },
  {
    path: 'navigation',
    loadChildren: () => import('./nav/routes').then(m => m.routes),
    title: 'Navigation'
  },
  {
    path: 'sidebar',
    loadChildren: () => import('./sidebar/routes').then(m => m.routes),
    title: 'Sidebar'
  },
  {
    path: 'rail-nav',
    loadChildren: () => import('./rail-nav/routes').then(m => m.routes),
    title: 'Rail Navigation'
  },
  {
    path: 'side-panel',
    loadChildren: () => import('./side-panel/routes').then(m => m.routes),
    title: 'Side Panel'
  },
];
