import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { routes } from './routes';

const routes_: Routes = routes;

@NgModule({
  imports: [RouterModule.forChild(routes_)],
  exports: [RouterModule]
})
export class ExpansionPanelRoutingModule { }
