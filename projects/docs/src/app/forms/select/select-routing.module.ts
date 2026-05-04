import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(c => c.Overview),
        title: 'Select / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(c => c.Api),
        title: 'Select / Api'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectRoutingModule { }
