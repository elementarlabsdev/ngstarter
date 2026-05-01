import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter/components/form-field';
import { CreditCardCvvMaskDirective } from '@ngstarter/components/input-mask';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-credit-card-cvv-input-mask-example',
  imports: [
    Input,
    CreditCardCvvMaskDirective,
    Label,
    FormField
  ],
  templateUrl: './credit-card-cvv-input-mask-example.html',
  styleUrl: './credit-card-cvv-input-mask-example.scss'
})
export class CreditCardCvvInputMaskExample {

}
