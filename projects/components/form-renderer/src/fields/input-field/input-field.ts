import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentConfig } from '../../models/form-config.model';
import { Error, FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'ngs-input-field',
  imports: [
    ReactiveFormsModule,
    Error,
    Hint,
    Label,
    Input,
    FormField
  ],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputField {
  control = input.required<FormControl>();
  config = input.required<ComponentConfig>();

  getErrorMessage(): string {
    const errors = this.control().errors;
    if (!errors) return '';
    const errorKey = Object.keys(errors)[0];
    const validator = this.config().validators?.find((v: any) => v.type === errorKey);
    return validator?.message || 'Некорректное значение';
  }
}
