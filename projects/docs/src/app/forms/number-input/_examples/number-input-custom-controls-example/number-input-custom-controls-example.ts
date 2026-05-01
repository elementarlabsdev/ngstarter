import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  DecreaseControlDirective,
  IncreaseControlDirective,
  NumberInput
} from '@ngstarter-ui/components/number-input';

@Component({
  selector: 'app-number-input-custom-controls-example',
  imports: [
    FormField,
    Icon,
    Label,
    DecreaseControlDirective,
    IncreaseControlDirective,
    NumberInput
  ],
  templateUrl: './number-input-custom-controls-example.html',
  styleUrl: './number-input-custom-controls-example.scss'
})
export class NumberInputCustomControlsExample {

}
