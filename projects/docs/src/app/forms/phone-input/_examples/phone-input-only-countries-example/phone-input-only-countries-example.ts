import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Error, FormField, Label } from '@ngstarter/components/form-field';
import { PhoneInput, phoneValidator } from '@ngstarter/components/phone-input';

@Component({
  selector: 'app-phone-input-only-countries-example',
  imports: [
    FormsModule,
    Error,
    FormField,
    Label,
    PhoneInput,
    ReactiveFormsModule
  ],
  templateUrl: './phone-input-only-countries-example.html',
  styleUrl: './phone-input-only-countries-example.scss'
})
export class PhoneInputOnlyCountriesExample {
  private _fb = inject(FormBuilder);
  form: FormGroup = this._fb.group({
    phone: ['+447874482198', [phoneValidator]]
  });
}
