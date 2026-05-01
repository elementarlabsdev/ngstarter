import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Input } from '@ngstarter/components/input';
import { Error, FormField, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-error-messages-example',
  imports: [
    ReactiveFormsModule,
    Error,
    Input,
    Label,
    FormField,
    Error
  ],
  templateUrl: './error-messages-example.html',
  styleUrl: './error-messages-example.scss'
})
export class ErrorMessagesExample {
  emailFormControl = new FormControl('', [
    Validators.required, Validators.email
  ]);
}
