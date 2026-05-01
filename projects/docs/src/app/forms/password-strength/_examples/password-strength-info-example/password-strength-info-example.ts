import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, Hint, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { PasswordStrength, PasswordStrengthInfo } from '@ngstarter/components/password-strength';

@Component({
  selector: 'app-password-strength-info-example',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    Hint,
    PasswordStrengthInfo,
    PasswordStrength
  ],
  templateUrl: './password-strength-info-example.html',
  styleUrl: './password-strength-info-example.scss'
})
export class PasswordStrengthInfoExample {
  password = new FormControl('');
}
