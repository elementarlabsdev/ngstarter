import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinInput } from '@ngstarter-ui/components/pin-input';

@Component({
  selector: 'app-basic-pin-input-example',
  imports: [
    FormsModule,
    PinInput
  ],
  templateUrl: './basic-pin-input-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-pin-input-example.scss'
})
export class BasicPinInputExample {
  value = '';
}
