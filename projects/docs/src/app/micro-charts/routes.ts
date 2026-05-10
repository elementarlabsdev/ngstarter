import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'line-chart',
    loadChildren: () => import('./line-chart/routes').then(m => m.routes),
    title: 'Line Chart'
  },
  {
    path: 'bar-chart',
    loadChildren: () => import('./bar-chart/routes').then(m => m.routes),
    title: 'Bar Chart'
  },
  {
    path: 'pie-chart',
    loadChildren: () => import('./pie-chart/routes').then(m => m.routes),
    title: 'Pie Chart'
  }
];
