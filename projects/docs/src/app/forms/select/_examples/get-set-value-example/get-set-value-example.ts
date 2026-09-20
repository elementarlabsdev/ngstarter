import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-get-set-value-example',
  imports: [
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './get-set-value-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './get-set-value-example.scss'
})
export class GetSetValueExample {
  selected = 'option2';
}
