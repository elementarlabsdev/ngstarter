import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentConfig } from '../../models/form-config.model';
import { Error, FormField, Hint, Label, Suffix } from '@ngstarter/components/form-field';
import { Datepicker, DatepickerInput, DatepickerToggle, provideNativeDateAdapter } from '@ngstarter/components/datepicker';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'ngs-datepicker-field',
  exportAs: 'ngsDatepickerField',
  providers: [
    provideNativeDateAdapter()
  ],
  imports: [
    Hint,
    Input,
    Suffix,
    DatepickerToggle,
    Datepicker,
    Error,
    Label,
    FormField,
    ReactiveFormsModule,
    DatepickerInput
  ],
  templateUrl: './datepicker-field.html',
  styleUrl: './datepicker-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerField {
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
