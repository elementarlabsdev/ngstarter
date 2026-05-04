import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common').then(m => m.Common),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview').then(m => m.Overview),
        title: 'Form Renderer / Overview'
      },
      {
        path: 'api',
        loadComponent: () => import('./api/api').then(m => m.Api),
        title: 'Form Renderer / Api'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormRendererRoutingModule { }
