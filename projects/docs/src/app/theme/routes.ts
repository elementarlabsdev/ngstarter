import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'colors',
    loadChildren: () => import('./colors/routes').then(m => m.routes),
    title: 'Colors'
  },
  {
    path: 'typography',
    loadComponent: () => import('./typography/typography').then(c => c.Typography),
    title: 'Typography'
  },
  {
    path: 'playground',
    loadComponent: () => import('./playground/playground').then(c => c.ThemePlayground),
    title: 'Default Theme Playground'
  },
];
