import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinInput } from '@ngstarter/components/pin-input';

@Component({
  selector: 'app-basic-pin-input-example',
  imports: [
    FormsModule,
    PinInput
  ],
  templateUrl: './basic-pin-input-example.html',
  styleUrl: './basic-pin-input-example.scss'
})
export class BasicPinInputExample {
  value = '';
}
