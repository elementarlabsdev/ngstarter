import { Component, model } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { NumberInput } from '@ngstarter-ui/components/number-input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-number-input-example',
  imports: [
    FormField,
    Label,
    NumberInput,
    FormsModule
  ],
  templateUrl: './basic-number-input-example.html',
  styleUrl: './basic-number-input-example.scss'
})
export class BasicNumberInputExample {
  value = model();
}
