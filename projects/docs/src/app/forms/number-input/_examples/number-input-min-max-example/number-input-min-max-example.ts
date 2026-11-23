import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, max, min } from '@angular/forms/signals';
import { NumberInput } from '@ngstarter-ui/components/number-input';

@Component({
  selector: 'app-number-input-min-max-example',
  imports: [
    FormField,
    FormsModule,
    SignalFormField,
    Label,
    NumberInput
  ],
  templateUrl: './number-input-min-max-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './number-input-min-max-example.scss'
})
export class NumberInputMinMaxExample {
  form = form(signal({
    control: 3,
  }), (path) => {
    min(path.control, 2);
    max(path.control, 5);
  });
}
