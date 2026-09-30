import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';

@Component({
  imports: [NativeTable],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './api.html'
})
export class Api {

}
