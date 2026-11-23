import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form, disabled } from '@angular/forms/signals';
import {
  RadioCard,
  RadioCardContent,
  RadioCardGroup, RadioCardTitle
} from '@ngstarter-ui/components/radio-card';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-radio-card-example',
  imports: [
    RadioCard,
    RadioCardGroup,
    SignalFormField,
    Icon,
    RadioCardContent,
    RadioCardTitle,
    Button,
  ],
  templateUrl: './radio-card-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './radio-card-example.scss'
})
export class RadioCardExample {
  private readonly privacyDisabled = signal(false);
  readonly form = form(signal({ privacy: 'open' }), path => {
    disabled(path.privacy, () => this.privacyDisabled());
  });

  toggleDisabled(): void {
    this.privacyDisabled.update(disabled => !disabled);
  }
}
