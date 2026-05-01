import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    title: 'Filter Builder',
    loadComponent: () => import('./overview/overview').then(c => c.Overview)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilterBuilderRoutingModule { }
