import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview'
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then(m => m.Overview),
    title: 'PDF Builder / Overview'
  },
  {
    path: 'basic-example',
    loadComponent: () => import('./_examples/basic-pdf-builder-example/basic-pdf-builder-example').then(m => m.BasicPdfBuilderExample),
    title: 'PDF Builder / Basic Example'
  }
];
