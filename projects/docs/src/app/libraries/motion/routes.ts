import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then((c) => c.Overview),
    title: 'Motion',
  },
  {
    path: 'basic-example',
    pathMatch: 'full',
    loadComponent: () => import('./basic-example/basic-example').then((c) => c.BasicExample),
    title: 'Motion Basic Example',
  },
  {
    path: 'render-export',
    pathMatch: 'full',
    loadComponent: () => import('./render-export/render-export').then((c) => c.RenderExport),
    title: 'Motion Render Export',
  },
  {
    path: 'schema',
    pathMatch: 'full',
    loadComponent: () => import('./schema/schema').then((c) => c.Schema),
    title: 'Motion JSON Schema',
  },
  {
    path: 'render-target',
    pathMatch: 'full',
    loadComponent: () => import('./render-target/render-target').then((c) => c.RenderTarget),
    title: 'Motion Render Target',
  },
];
