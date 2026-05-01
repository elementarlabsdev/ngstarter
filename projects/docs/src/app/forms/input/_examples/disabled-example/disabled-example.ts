import { Component } from '@angular/core';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-disabled-example',
  imports: [
    FormField,
    Input,
    Label
  ],
  templateUrl: './disabled-example.html',
  styleUrl: './disabled-example.scss'
})
export class DisabledExample {

}
