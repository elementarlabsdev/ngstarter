import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Error, FormField, Label } from '@ngstarter/components/form-field';
import { PhoneInput, phoneValidator } from '@ngstarter/components/phone-input';

@Component({
  selector: 'app-phone-input-preferred-countries-example',
  imports: [
    FormsModule,
    Error,
    FormField,
    Label,
    PhoneInput,
    ReactiveFormsModule
  ],
  templateUrl: './phone-input-preferred-countries-example.html',
  styleUrl: './phone-input-preferred-countries-example.scss'
})
export class PhoneInputPreferredCountriesExample {
  private _fb = inject(FormBuilder);
  form: FormGroup = this._fb.group({
    phone: [{ value: '+15165867279', disabled: false }, [phoneValidator]]
  });
}
