import { booleanAttribute, Component, input } from '@angular/core';
import { PasswordStrength } from '../password-strength/password-strength';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'ngs-password-strength-info',
  exportAs: 'ngsPasswordStrengthInfo',
  imports: [
    Icon
  ],
  templateUrl: './password-strength-info.html',
  styleUrl: './password-strength-info.scss',
  host: {
    'class': 'ngs-password-strength-info',
  }
})
export class PasswordStrengthInfo {
  passwordComponent = input.required<PasswordStrength>();
  enableScoreInfo = input(false, {
    transform: booleanAttribute
  });
  lowerCaseCriteriaMessage = input('contains at least one lower character');
  upperCaseCriteriaMessage = input('contains at least one upper character');
  digitsCriteriaMessage = input('contains at least one digit character');
  specialCharsCriteriaMessage = input('contains at least one special character');
  customCharsCriteriaMessage = input('contains at least one custom character');
  minCharsCriteriaMessage = input(`contains at least minimum characters`);
  ngsIconDone = input('checkmark-24-regular');
  ngsIconError = input('error-circle-24-regular');
}
