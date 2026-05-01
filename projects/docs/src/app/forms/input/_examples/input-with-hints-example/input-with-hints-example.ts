import { Component } from '@angular/core';
import { Input } from '@ngstarter/components/input';
import { Label, FormField, Hint } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-input-with-hints-example',
  imports: [
    FormField,
    Input,
    Hint,
    Label
  ],
  templateUrl: './input-with-hints-example.html',
  styleUrl: './input-with-hints-example.scss'
})
export class InputWithHintsExample {

}
