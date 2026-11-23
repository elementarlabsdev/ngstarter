import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-multiple-selection-example',
  imports: [
    SignalFormField,
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './multiple-selection-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './multiple-selection-example.scss'
})
export class MultipleSelectionExample {
  toppings = form(signal<string[]>([]));
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
}
