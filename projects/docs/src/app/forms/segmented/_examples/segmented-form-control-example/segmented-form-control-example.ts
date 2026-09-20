import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-segmented-form-control-example',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Segmented,
    SegmentedButton,
    Button
  ],
  templateUrl: './segmented-form-control-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './segmented-form-control-example.scss'
})
export class SegmentedFormControlExample {
  segmentedControl = new FormControl('daily');
}
