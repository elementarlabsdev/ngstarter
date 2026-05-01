import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-multiple-selection-example',
  imports: [
    ReactiveFormsModule,
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './multiple-selection-example.html',
  styleUrl: './multiple-selection-example.scss'
})
export class MultipleSelectionExample {
  toppings = new FormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
}
