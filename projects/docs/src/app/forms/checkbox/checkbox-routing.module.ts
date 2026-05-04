import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(c => c.Common),
    children: [
      {
        path: '',
        title: 'Checkbox',
        loadComponent: () => import('./overview/overview').then(c => c.Overview)
      },
      {
        path: 'api',
        title: 'Checkbox API',
        loadComponent: () => import('./api/api').then(c => c.Api)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckboxRoutingModule { }
