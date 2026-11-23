import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { PasswordStrength } from '@ngstarter-ui/components/password-strength';

@Component({
  selector: 'app-basic-password-strength-example',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label,
    SignalFormField,
    PasswordStrength
  ],
  templateUrl: './basic-password-strength-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-password-strength-example.scss'
})
export class BasicPasswordStrengthExample {
  password = form(signal(''));
}
