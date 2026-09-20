import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';

@Component({
  selector: 'app-radio-orientation-example',
  imports: [
    RadioButton,
    RadioGroup
  ],
  templateUrl: './radio-orientation-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './radio-orientation-example.scss'
})
export class RadioOrientationExample {}
