import { Component, inject } from '@angular/core';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PhoneInput, phoneValidator } from '@ngstarter-ui/components/phone-input';

@Component({
  selector: 'app-basic-phone-input-example',
  imports: [
    FormField,
    Label,
    Error,
    ReactiveFormsModule,
    PhoneInput
  ],
  templateUrl: './basic-phone-input-example.html',
  styleUrl: './basic-phone-input-example.scss'
})
export class BasicPhoneInputExample {
  private _fb = inject(FormBuilder);
  form: FormGroup = this._fb.group({
    phone: ['+15165867279', [phoneValidator]]
  });
}
