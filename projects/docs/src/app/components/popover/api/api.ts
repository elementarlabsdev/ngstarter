import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
  imports: [
    TabGroup,
    Tab
  ],
  templateUrl: './api.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './api.scss'
})
export class Api {

}
