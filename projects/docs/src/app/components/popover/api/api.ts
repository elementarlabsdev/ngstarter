import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
  imports: [
    NativeTable,
    TabGroup,
    Tab
  ],
  templateUrl: './api.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './api.scss'
})
export class Api {

}
