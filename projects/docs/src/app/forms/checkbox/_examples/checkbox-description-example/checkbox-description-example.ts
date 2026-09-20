import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Checkbox } from '@ngstarter-ui/components/checkbox';

@Component({
  selector: 'app-checkbox-description-example',
  imports: [
    Checkbox
  ],
  templateUrl: './checkbox-description-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './checkbox-description-example.scss'
})
export class CheckboxDescriptionExample {
}
