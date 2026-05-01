import { Component } from '@angular/core';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-basic-select-example',
  imports: [
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './basic-select-example.html',
  styleUrl: './basic-select-example.scss'
})
export class BasicSelectExample {
  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
}
