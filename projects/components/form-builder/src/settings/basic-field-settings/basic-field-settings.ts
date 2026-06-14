import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Select } from '@ngstarter-ui/components/select';
import { Option } from '@ngstarter-ui/components/option';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { FormBuilderField, FormBuilderFieldWidth, FormBuilderOption } from '../../types';

@Component({
  selector: 'ngs-basic-form-builder-field-settings',
  exportAs: 'ngsBasicFormBuilderFieldSettings',
  imports: [
    FormsModule,
    FormField,
    Hint,
    Label,
    Input,
    Select,
    Option,
    SlideToggle
  ],
  templateUrl: './basic-field-settings.html',
  styleUrl: './basic-field-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-basic-form-builder-field-settings'
  }
})
export class BasicFormBuilderFieldSettings {
  readonly field = input.required<FormBuilderField>();
  readonly update = input.required<(changes: Partial<FormBuilderField>) => void>();

  protected readonly fieldWidthOptions: FormBuilderFieldWidth[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  protected readonly hasOptions = computed(() => ['select', 'radio', 'checkbox-list'].includes(this.field().type));
  protected readonly optionsText = computed(() =>
    (this.field().options ?? [])
      .map(option => `${option.label}:${option.value}`)
      .join('\n')
  );

  protected patch(changes: Partial<FormBuilderField>): void {
    this.update()(changes);
  }

  protected patchOptions(value: string): void {
    const options: FormBuilderOption[] = value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [label, optionValue] = line.split(':');

        return {
          label: label?.trim() || `Option ${index + 1}`,
          value: (optionValue ?? label ?? `option_${index + 1}`).trim()
        };
      });

    this.patch({ options });
  }
}
