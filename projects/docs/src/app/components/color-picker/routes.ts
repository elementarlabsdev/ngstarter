import { Routes } from '@angular/router';
import { Common } from './common/common';
import { Overview } from './overview/overview';
import { Api } from './api/api';

export const routes: Routes = [
  {
    path: '',
    component: Common,
    children: [
      {
        path: '',
        component: Overview
      },
      {
        path: 'api',
        component: Api
      }
    ]
  }
];
