import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label, Suffix } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { PassToggleVisibility, PasswordStrength } from '@ngstarter/components/password-strength';

@Component({
  selector: 'app-password-toggle-visibility-example',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    Suffix,
    PassToggleVisibility,
    PasswordStrength
  ],
  templateUrl: './password-toggle-visibility-example.html',
  styleUrl: './password-toggle-visibility-example.scss'
})
export class PasswordToggleVisibilityExample {
  password = new FormControl('');
}
