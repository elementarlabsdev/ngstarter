import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { SegmentedButton, Segmented } from '@ngstarter-ui/components/segmented';

@Component({
  selector: 'app-segmented-with-icons-example',
  imports: [
    Icon,
    SegmentedButton,
    Segmented
  ],
  templateUrl: './segmented-with-icons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './segmented-with-icons-example.scss'
})
export class SegmentedWithIconsExample {

}
