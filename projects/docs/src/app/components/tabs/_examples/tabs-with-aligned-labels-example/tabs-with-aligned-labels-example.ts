import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
  selector: 'app-tabs-with-aligned-labels-example',
  imports: [
    Tab,
    TabGroup
  ],
  templateUrl: './tabs-with-aligned-labels-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tabs-with-aligned-labels-example.scss'
})
export class TabsWithAlignedLabelsExample {

}
