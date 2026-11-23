import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-segmented-form-control-example',
  standalone: true,
  imports: [
    SignalFormField,
    Segmented,
    SegmentedButton,
    Button
  ],
  templateUrl: './segmented-form-control-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './segmented-form-control-example.scss'
})
export class SegmentedFormControlExample {
  segmentedControl = form(signal('daily'));
}
