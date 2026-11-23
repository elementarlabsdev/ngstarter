import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Error, Hint, Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

interface Animal {
  name: string;
  sound: string;
}

@Component({
  selector: 'app-form-field-features-example',
  imports: [
    SignalFormField,
    Option,
    Select,
    Label,
    FormField,
    Hint,
    Error
  ],
  templateUrl: './form-field-features-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './form-field-features-example.scss'
})
export class FormFieldFeaturesExample {
  animalControl = form(signal<Animal | null>(null), path => {
    required(path);
  });
  selectFormControl = form(signal(''), path => {
    required(path);
  });
  animals: Animal[] = [
    { name: 'Dog', sound: 'Woof!' },
    { name: 'Cat', sound: 'Meow!' },
    { name: 'Cow', sound: 'Moo!' },
    { name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!' },
  ];
}
