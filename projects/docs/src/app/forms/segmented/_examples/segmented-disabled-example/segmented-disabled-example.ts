import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SegmentedButton, Segmented } from '@ngstarter-ui/components/segmented';

@Component({
  selector: 'app-segmented-disabled-example',
  imports: [
    SegmentedButton,
    Segmented
  ],
  templateUrl: './segmented-disabled-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './segmented-disabled-example.scss'
})
export class SegmentedDisabledExample {

}
