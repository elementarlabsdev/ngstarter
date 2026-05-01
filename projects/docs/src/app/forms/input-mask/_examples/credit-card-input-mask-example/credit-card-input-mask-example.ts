import { Component } from '@angular/core';
import { FormField, Label, Prefix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { CreditCardNumberMaskDirective } from '@ngstarter-ui/components/input-mask';
import { Icon } from '@ngstarter-ui/components/icon';

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
