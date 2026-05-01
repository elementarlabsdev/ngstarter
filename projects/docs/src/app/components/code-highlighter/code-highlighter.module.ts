import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Overview } from './overview/overview';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/overview').then(c => c.Overview)
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), Overview]
})
export class CodeHighlighterModule {}
