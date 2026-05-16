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
    title: 'Theme Playground'
  },
  {
    path: 'generator',
    loadComponent: () => import('./generator/generator').then(c => c.ThemeGenerator),
    title: 'Theme Generator'
  },
  {
    path: 'customize',
    loadComponent: () => import('./customize/customize').then(c => c.Customize),
    title: 'Customize Theme'
  },
  {
    path: 'customize-theme',
    redirectTo: 'customize',
    pathMatch: 'full',
    title: 'Customize Theme'
  },
];
