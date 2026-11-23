import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { PasswordStrength, PasswordStrengthInfo } from '@ngstarter-ui/components/password-strength';

@Component({
  selector: 'app-password-strength-info-example',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label,
    SignalFormField,
    Hint,
    PasswordStrengthInfo,
    PasswordStrength
  ],
  templateUrl: './password-strength-info-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './password-strength-info-example.scss'
})
export class PasswordStrengthInfoExample {
  password = form(signal(''));
}
