import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(m => m.Common),
    title: 'PDF Viewer',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(m => m.Overview),
        title: 'PDF Viewer / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(m => m.Api),
        title: 'PDF Viewer / Api'
      },
      {
        path: 'basic-example',
        loadComponent: () => import('./_examples/basic-pdf-viewer-example/basic-pdf-viewer-example').then(m => m.BasicPdfViewerExample),
        title: 'PDF Viewer / Basic Example'
      }
    ]
  }
];
