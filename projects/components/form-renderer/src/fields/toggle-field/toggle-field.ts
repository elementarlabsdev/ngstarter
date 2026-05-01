import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentConfig } from '../../models/form-config.model';

@Component({
  selector: 'ngs-toggle-field',
  exportAs: 'ngsToggleField',
  imports: [
    SlideToggle,
    ReactiveFormsModule
  ],
  templateUrl: './toggle-field.html',
  styleUrl: './toggle-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleField {
  control = input.required<FormControl>();
  config = input.required<ComponentConfig>();
}
