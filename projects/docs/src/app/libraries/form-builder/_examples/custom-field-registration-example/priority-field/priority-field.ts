import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FieldTree, FormField as SignalFormField } from '@angular/forms/signals';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter-ui/components/button-toggle';
import { FormBuilderField } from '@ngstarter-ui/components/form-builder';

@Component({
  selector: 'app-priority-field',
  imports: [
    SignalFormField,
    ButtonToggle,
    ButtonToggleGroup
  ],
  templateUrl: './priority-field.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './priority-field.scss'
})
export class PriorityField {
  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FieldTree<unknown>>();
}
