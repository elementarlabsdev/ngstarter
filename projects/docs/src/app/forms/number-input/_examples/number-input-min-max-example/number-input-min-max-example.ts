import { Component, inject } from '@angular/core';
import { FormField, Label } from '@ngstarter/components/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumberInput } from '@ngstarter/components/number-input';

@Component({
  selector: 'app-number-input-min-max-example',
  imports: [
    FormField,
    FormsModule,
    ReactiveFormsModule,
    Label,
    NumberInput
  ],
  templateUrl: './number-input-min-max-example.html',
  styleUrl: './number-input-min-max-example.scss'
})
export class NumberInputMinMaxExample {
  private _formBuilder = inject(FormBuilder);
  form = this._formBuilder.group({
    control: [3, [Validators.min(2), Validators.max(5)]]
  });
}
