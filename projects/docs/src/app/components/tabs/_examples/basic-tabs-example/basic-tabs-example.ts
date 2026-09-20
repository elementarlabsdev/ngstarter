import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
  selector: 'app-basic-tabs-example',
  imports: [
    Tab,
    TabGroup
  ],
  templateUrl: './basic-tabs-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-tabs-example.scss'
})
export class BasicTabsExample {

}
