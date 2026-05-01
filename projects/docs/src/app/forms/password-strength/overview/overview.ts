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
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicPasswordStrengthExample,
    PasswordStrengthInfoExample,
    PasswordToggleVisibilityExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
