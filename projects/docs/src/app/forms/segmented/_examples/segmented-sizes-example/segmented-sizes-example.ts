import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SegmentedButton, Segmented } from '@ngstarter-ui/components/segmented';

@Component({
  selector: 'app-segmented-sizes-example',
  imports: [
    Segmented,
    SegmentedButton
  ],
  templateUrl: './segmented-sizes-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './segmented-sizes-example.scss'
})
export class SegmentedSizesExample {

}
