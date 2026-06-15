import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Option } from '@ngstarter-ui/components/option';
import { Select } from '@ngstarter-ui/components/select';
import { FormBuilderField, FormBuilderFieldWidth } from '../../types';

@Component({
  selector: 'ngs-basic-form-builder-layout-settings',
  exportAs: 'ngsBasicFormBuilderLayoutSettings',
  imports: [
    FormsModule,
    FormField,
    Hint,
    Label,
    Input,
    Option,
    Select
  ],
  templateUrl: './basic-layout-settings.html',
  styleUrl: './basic-layout-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-basic-form-builder-layout-settings'
  }
})
export class BasicFormBuilderLayoutSettings {
  readonly field = input.required<FormBuilderField>();
  readonly update = input.required<(changes: Partial<FormBuilderField>) => void>();

  protected readonly fieldWidthOptions: FormBuilderFieldWidth[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  protected patch(changes: Partial<FormBuilderField>): void {
    this.update()(changes);
  }
}
