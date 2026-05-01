import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentConfig } from '../../models/form-config.model';
import { TimezoneSelect } from '@ngstarter-ui/components/timezone-select';
import { Error, FormField, Hint, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'ngs-timezone-field',
  exportAs: 'ngsTimezoneField',
  imports: [
    Error,
    FormField,
    Label,
    TimezoneSelect,
    ReactiveFormsModule,
    Hint
  ],
  templateUrl: './timezone-field.html',
  styleUrl: './timezone-field.scss'
})
export class TimezoneField {
  control = input.required<FormControl>();
  config = input.required<ComponentConfig>();

  getErrorMessage(): string {
    const errors = this.control().errors;
    if (!errors) return '';
    const errorKey = Object.keys(errors)[0];
    const validator = this.config().validators?.find((v: any) => v.type === errorKey);
    return validator?.message || 'Invalid value';
  }
}
