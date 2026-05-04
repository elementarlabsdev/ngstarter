import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicPasswordStrengthExample
} from '../_examples/basic-password-strength-example/basic-password-strength-example';
import {
  PasswordStrengthInfoExample
} from '../_examples/password-strength-info-example/password-strength-info-example';
import {
  PasswordToggleVisibilityExample
} from '../_examples/password-toggle-visibility-example/password-toggle-visibility-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicPasswordStrengthExample,
    PasswordStrengthInfoExample,
    PasswordToggleVisibilityExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
