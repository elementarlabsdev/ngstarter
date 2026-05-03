import { Routes } from '@angular/router';
import { CommonComponent } from './common/common';
import { Overview } from './overview/overview';
import { ApiComponent } from './api/api';

export const routes: Routes = [
  {
    path: '',
    component: CommonComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: Overview
      },
      {
        path: 'api',
        component: ApiComponent
      }
    ]
  }
];
