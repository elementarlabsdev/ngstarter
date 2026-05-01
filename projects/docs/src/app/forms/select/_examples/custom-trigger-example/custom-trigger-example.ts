import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option, Select, SelectTrigger } from '@ngstarter/components/select';
import { Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-custom-trigger-example',
  imports: [
    ReactiveFormsModule,
    Option,
    Select,
    SelectTrigger,
    Label,
    FormField
  ],
  templateUrl: './custom-trigger-example.html',
  styleUrl: './custom-trigger-example.scss'
})
export class CustomTriggerExample {
  toppings = new FormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
}
