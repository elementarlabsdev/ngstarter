import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview').then(m => m.Overview),
    title: 'PDF Signer / Overview',
  },
  {
    path: 'basic-example',
    loadComponent: () =>
      import('./_examples/basic-pdf-signer-example/basic-pdf-signer-example')
        .then(m => m.BasicPdfSignerExample),
    title: 'PDF Signer / Basic Example',
  },
];
