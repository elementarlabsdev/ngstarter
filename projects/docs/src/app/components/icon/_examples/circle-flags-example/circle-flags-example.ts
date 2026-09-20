import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-circle-flags-example',
  imports: [
    Icon
  ],
  templateUrl: './circle-flags-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './circle-flags-example.scss'
})
export class CircleFlagsExample {

}
