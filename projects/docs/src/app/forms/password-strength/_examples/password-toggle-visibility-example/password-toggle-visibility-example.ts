import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { FormField, Label, Suffix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { PassToggleVisibility, PasswordStrength } from '@ngstarter-ui/components/password-strength';

@Component({
  selector: 'app-password-toggle-visibility-example',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label,
    SignalFormField,
    Suffix,
    PassToggleVisibility,
    PasswordStrength
  ],
  templateUrl: './password-toggle-visibility-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './password-toggle-visibility-example.scss'
})
export class PasswordToggleVisibilityExample {
  password = form(signal(''), path => required(path));
}
