import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { CreditCardExpiryDateMaskDirective } from '@ngstarter-ui/components/input-mask';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-credit-card-expiry-input-mask-example',
  imports: [
    Input,
    CreditCardExpiryDateMaskDirective,
    Label,
    FormField
  ],
  templateUrl: './credit-card-expiry-input-mask-example.html',
  styleUrl: './credit-card-expiry-input-mask-example.scss'
})
export class CreditCardExpiryInputMaskExample {

}
