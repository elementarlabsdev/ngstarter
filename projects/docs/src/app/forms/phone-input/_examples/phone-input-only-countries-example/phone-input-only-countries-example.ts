import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, validate } from '@angular/forms/signals';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { PhoneInput, phoneValidator } from '@ngstarter-ui/components/phone-input';

@Component({
  selector: 'app-phone-input-only-countries-example',
  imports: [
    FormsModule,
    Error,
    FormField,
    Label,
    PhoneInput,
    SignalFormField
  ],
  templateUrl: './phone-input-only-countries-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './phone-input-only-countries-example.scss'
})
export class PhoneInputOnlyCountriesExample {
  form = form(signal({
    phone: '+447874482198',
  }), (path) => {
    validate(path.phone, ({value}) => phoneValidator({ value: value() }) ? { kind: 'invalidPhone' } : null);
  });
}
