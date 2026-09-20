import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
  selector: 'app-tabs-animations-example',
  standalone: true,
  imports: [
    Tab,
    TabGroup
  ],
  templateUrl: './tabs-animations-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tabs-animations-example.scss'
})
export class TabsAnimationsExample {

}
