import { Component } from '@angular/core';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-basic-inputs-example',
  imports: [
    FormField,
    Input,
    Label
  ],
  templateUrl: './basic-inputs-example.html',
  styleUrl: './basic-inputs-example.scss'
})
export class BasicInputsExample {

}
