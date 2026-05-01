import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentConfig } from '../../models/form-config.model';
import { Checkbox } from '@ngstarter-ui/components/checkbox';

@Component({
  selector: 'ngs-checkbox-field',
  imports: [
    Checkbox,
    ReactiveFormsModule
  ],
  templateUrl: './checkbox-field.html',
  styleUrl: './checkbox-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxField {
  control = input.required<FormControl>();
  config = input.required<ComponentConfig>();
}
