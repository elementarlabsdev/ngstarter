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
    loadChildren: () => import('./theme/theme.module').then(m => m.ThemeModule)
  },
  {
    path: 'forms',
    loadChildren: () => import('./forms/forms.module').then(m => m.FormsModule)
  },
  {
    path: 'components',
    loadChildren: () => import('./components/components.routes').then(m => m.routes)
  },
  {
    path: 'libraries',
    loadChildren: () => import('./libraries/routes').then(m => m.routes)
  },
  {
    path: 'navigation',
    loadChildren: () => import('./navigation/navigation.module').then(m => m.NavigationModule)
  },
  {
    path: 'micro-charts',
    loadChildren: () => import('./micro-charts/micro-charts.module').then(m => m.MicroChartsModule)
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./error/not-found/not-found').then(c => c.NotFound)
  }
];
