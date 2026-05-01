import { Component } from '@angular/core';
import { FormField, Label, Prefix } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { CreditCardNumberMaskDirective } from '@ngstarter/components/input-mask';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-credit-card-input-mask-example',
  imports: [
    Prefix,
    Label,
    Input,
    FormField,
    Icon,
    CreditCardNumberMaskDirective
  ],
  templateUrl: './credit-card-input-mask-example.html',
  styleUrl: './credit-card-input-mask-example.scss'
})
export class CreditCardInputMaskExample {

}
