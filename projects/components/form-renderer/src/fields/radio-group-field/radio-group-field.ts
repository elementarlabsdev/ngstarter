import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentConfig } from '../../models/form-config.model';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';
import { Error, Hint } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'ngs-radio-group-field',
  exportAs: 'ngsRadioGroupField',
  imports: [
    RadioButton,
    RadioGroup,
    ReactiveFormsModule,
    Error,
    Hint,
  ],
  templateUrl: './radio-group-field.html',
  styleUrl: './radio-group-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioGroupField {
  control = input.required<FormControl>();
  config = input.required<ComponentConfig>();

  getErrorMessage(): string {
    const errors = this.control().errors;
    if (!errors) {
      return '';
    }
    const errorKey = Object.keys(errors)[0];
    const validator = this.config().validators?.find((v: any) => v.type === errorKey);
    return validator?.message || 'Invalid value';
  }

  get options() {
    return this.config().payload?.['options'] || [];
  }
}
