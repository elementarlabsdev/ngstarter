import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { CreditCardCvvMaskDirective } from '@ngstarter-ui/components/input-mask';
import { Input } from '@ngstarter-ui/components/input';

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
