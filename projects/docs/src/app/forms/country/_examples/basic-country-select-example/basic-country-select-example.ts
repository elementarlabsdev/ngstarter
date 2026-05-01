import { Component, model } from '@angular/core';
import { CountrySelect } from '@ngstarter/components/country-select';
import { FormField, Label } from '@ngstarter/components/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-country-select-example',
  imports: [
    FormField,
    Label,
    CountrySelect,
    FormsModule
  ],
  templateUrl: './basic-country-select-example.html',
  styleUrl: './basic-country-select-example.scss'
})
export class BasicCountrySelectExample {
  country = model('US');
}
