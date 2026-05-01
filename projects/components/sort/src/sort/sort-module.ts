import { NgModule } from '@angular/core';
import { SortDirective } from './sort';
import { SortHeader } from './sort-header';

@NgModule({
  imports: [SortDirective, SortHeader],
  exports: [SortDirective, SortHeader],
})
export class SortModule {}
