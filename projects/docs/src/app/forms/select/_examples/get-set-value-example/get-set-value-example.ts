import { Component } from '@angular/core';
import { Option, Select } from '@ngstarter/components/select';
import { Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-get-set-value-example',
  imports: [
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './get-set-value-example.html',
  styleUrl: './get-set-value-example.scss'
})
export class GetSetValueExample {
  selected = 'option2';
}
