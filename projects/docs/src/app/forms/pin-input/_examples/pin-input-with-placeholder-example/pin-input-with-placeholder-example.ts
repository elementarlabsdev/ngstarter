import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PinInput } from '@ngstarter-ui/components/pin-input';

@Component({
  selector: 'app-pin-input-with-placeholder-example',
  imports: [
    FormsModule,
    PinInput
  ],
  templateUrl: './pin-input-with-placeholder-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pin-input-with-placeholder-example.scss'
})
export class PinInputWithPlaceholderExample {
  value = '';
}
