import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinInput } from '@ngstarter-ui/components/pin-input';

@Component({
  selector: 'app-pin-input-accept-custom-symbols-example',
  imports: [
    FormsModule,
    PinInput
  ],
  templateUrl: './pin-input-accept-custom-symbols-example.html',
  styleUrl: './pin-input-accept-custom-symbols-example.scss'
})
export class PinInputAcceptCustomSymbolsExample {
  value = '';
  acceptOnly = /^([0-9]|[a-z]|[A-Z])+$/;
}
