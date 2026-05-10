import { Routes } from '@angular/router';
import { CommonComponent } from './common/common';
import { Overview } from './overview/overview';
import { ApiComponent } from './api/api';

export const routes: Routes = [
  {
    path: '',
    component: CommonComponent,
    title: 'Card Overlay',
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        title: 'Card Overlay / Overview'
      },
      {
        path: 'overview',
        component: Overview,
        title: 'Card Overlay / Overview'
      },
      {
        path: 'api',
        component: ApiComponent,
        title: 'Card Overlay / Api'
      }
    ]
  }
];
