import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Option, Select } from '@ngstarter/components/select';
import { Error, Hint, Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';

interface Animal {
  name: string;
  sound: string;
}

@Component({
  selector: 'app-form-field-features-example',
  imports: [
    ReactiveFormsModule,
    Option,
    Select,
    Label,
    FormField,
    Hint,
    Error
  ],
  templateUrl: './form-field-features-example.html',
  styleUrl: './form-field-features-example.scss'
})
export class FormFieldFeaturesExample {
  animalControl = new FormControl<Animal | null>(null, Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  animals: Animal[] = [
    { name: 'Dog', sound: 'Woof!' },
    { name: 'Cat', sound: 'Meow!' },
    { name: 'Cow', sound: 'Moo!' },
    { name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!' },
  ];
}
