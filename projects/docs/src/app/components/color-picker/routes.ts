import { Routes } from '@angular/router';
import { Common } from './common/common';
import { Overview } from './overview/overview';
import { Api } from './api/api';

export const routes: Routes = [
  {
    path: '',
    component: Common,
    title: 'Color Picker',
    children: [
      {
        path: '',
        component: Overview,
        title: 'Color Picker'
      },
      {
        path: 'api',
        component: Api,
        title: 'Color Picker / Api'
      }
    ]
  }
];
