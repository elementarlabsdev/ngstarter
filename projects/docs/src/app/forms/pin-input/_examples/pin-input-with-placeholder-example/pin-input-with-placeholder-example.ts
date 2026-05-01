import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinInput } from '@ngstarter/components/pin-input';

@Component({
  selector: 'app-pin-input-with-placeholder-example',
  imports: [
    FormsModule,
    PinInput
  ],
  templateUrl: './pin-input-with-placeholder-example.html',
  styleUrl: './pin-input-with-placeholder-example.scss'
})
export class PinInputWithPlaceholderExample {
  value = '';
}
