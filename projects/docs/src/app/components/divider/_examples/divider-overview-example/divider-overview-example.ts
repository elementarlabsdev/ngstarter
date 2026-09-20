import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  selector: 'app-divider-overview-example',
  imports: [
    Divider
  ],
  templateUrl: './divider-overview-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './divider-overview-example.scss'
})
export class DividerOverviewExample {

}
