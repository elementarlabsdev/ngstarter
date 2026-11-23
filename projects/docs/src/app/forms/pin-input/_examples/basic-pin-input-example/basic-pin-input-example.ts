import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { PinInput } from '@ngstarter-ui/components/pin-input';

@Component({
  selector: 'app-basic-pin-input-example',
  imports: [
    SignalFormField,
    PinInput
  ],
  templateUrl: './basic-pin-input-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-pin-input-example.scss'
})
export class BasicPinInputExample {
  readonly value = form(signal<number | null>(null));
}
