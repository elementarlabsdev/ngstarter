import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PinInput } from '@ngstarter-ui/components/pin-input';

@Component({
  selector: 'app-pin-input-length-example',
  imports: [
    PinInput
  ],
  templateUrl: './pin-input-length-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pin-input-length-example.scss'
})
export class PinInputLengthExample {

}
