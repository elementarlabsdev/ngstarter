import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { routes } from './routes';

const marqueeRoutes = routes;

@NgModule({
  imports: [RouterModule.forChild(marqueeRoutes)],
  exports: [RouterModule]
})
export class MarqueeRoutingModule { }
