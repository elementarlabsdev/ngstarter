import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
