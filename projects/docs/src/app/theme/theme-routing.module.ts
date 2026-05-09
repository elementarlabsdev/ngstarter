import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'colors',
    loadChildren: () => import('./colors/colors.module').then(c => c.ColorsModule),
    title: 'Colors'
  },
  {
    path: 'typography',
    loadComponent: () => import('./typography/typography').then(c => c.Typography),
    title: 'Typography'
  },
  {
    path: 'playground',
    loadComponent: () => import('./playground/playground').then(c => c.ThemePlayground),
    title: 'Theme Playground'
  },
  {
    path: 'customize',
    loadComponent: () => import('./customize/customize').then(c => c.Customize),
    title: 'Customize Theme'
  },
  {
    path: 'customize-theme',
    redirectTo: 'customize',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemeRoutingModule { }
