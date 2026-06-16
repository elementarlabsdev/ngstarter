import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CountrySelect } from '@ngstarter-ui/components/country-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-unselected-country-select-example',
  imports: [
    FormsModule,
    FormField,
    Label,
    CountrySelect
  ],
  templateUrl: './unselected-country-select-example.html',
  styleUrl: './unselected-country-select-example.scss'
})
export class UnselectedCountrySelectExample {
  country = model<string | null>(null);
}
