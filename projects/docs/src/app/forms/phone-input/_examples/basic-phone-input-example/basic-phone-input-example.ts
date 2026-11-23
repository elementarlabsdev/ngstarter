import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormField as SignalFormField, form, validate } from '@angular/forms/signals';
import { PhoneInput, phoneValidator } from '@ngstarter-ui/components/phone-input';

@Component({
  selector: 'app-basic-phone-input-example',
  imports: [
    FormField,
    Label,
    Error,
    SignalFormField,
    PhoneInput
  ],
  templateUrl: './basic-phone-input-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-phone-input-example.scss'
})
export class BasicPhoneInputExample {
  form = form(signal({
    phone: '+15165867279',
  }), (path) => {
    validate(path.phone, ({value}) => phoneValidator({ value: value() }) ? { kind: 'invalidPhone' } : null);
  });
}
