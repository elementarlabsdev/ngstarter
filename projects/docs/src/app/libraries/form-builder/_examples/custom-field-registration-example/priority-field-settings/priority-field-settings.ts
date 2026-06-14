import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { FormBuilderField } from '@ngstarter-ui/components/form-builder';

@Component({
  selector: 'app-priority-field-settings',
  imports: [
    FormsModule,
    FormField,
    Input,
    Label
  ],
  templateUrl: './priority-field-settings.html',
  styleUrl: './priority-field-settings.scss'
})
export class PriorityFieldSettings {
  readonly field = input.required<FormBuilderField>();
  readonly update = input.required<(changes: Partial<FormBuilderField>) => void>();

  protected patchSetting(key: string, value: string): void {
    this.update()({
      settings: {
        ...(this.field().settings ?? {}),
        [key]: value
      }
    });
  }
}
