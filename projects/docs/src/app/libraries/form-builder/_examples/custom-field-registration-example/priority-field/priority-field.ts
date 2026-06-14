import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter-ui/components/button-toggle';
import { FormBuilderField } from '@ngstarter-ui/components/form-builder';

@Component({
  selector: 'app-priority-field',
  imports: [
    ReactiveFormsModule,
    ButtonToggle,
    ButtonToggleGroup
  ],
  templateUrl: './priority-field.html',
  styleUrl: './priority-field.scss'
})
export class PriorityField {
  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FormControl>();
}
