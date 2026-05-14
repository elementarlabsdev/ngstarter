import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('../@meta/category-overview/category-overview').then(c => c.CategoryOverview),
    title: 'Angular Micro Chart Components',
    data: {
      seoIntro: 'The NgStarter Angular micro chart components documentation covers compact line, bar, and pie charts for KPI cards, dashboards, reports, table cells, list rows, and dense data visualization surfaces.'
    }
  },
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
