import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { routes } from './routes';

const routes_local: Routes = routes;

@NgModule({
  imports: [RouterModule.forChild(routes_local)],
  exports: [RouterModule]
})
export class DividerRoutingModule { }
