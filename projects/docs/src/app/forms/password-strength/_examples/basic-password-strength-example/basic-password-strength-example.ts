import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { PasswordStrength } from '@ngstarter/components/password-strength';

@Component({
  selector: 'app-basic-password-strength-example',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    PasswordStrength
  ],
  templateUrl: './basic-password-strength-example.html',
  styleUrl: './basic-password-strength-example.scss'
})
export class BasicPasswordStrengthExample {
  password = new FormControl('');
}
