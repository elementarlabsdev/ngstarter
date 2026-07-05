import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { FormBuilderField, FormBuilderSection } from '../../types';

@Component({
  selector: 'ngs-basic-form-builder-section-settings',
  exportAs: 'ngsBasicFormBuilderSectionSettings',
  imports: [
    FormsModule,
    FormField,
    Hint,
    Label,
    Input,
    SlideToggle
  ],
  templateUrl: './basic-section-settings.html',
  styleUrl: './basic-section-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-basic-form-builder-section-settings'
  }
})
export class BasicFormBuilderSectionSettings {
  readonly section = input.required<FormBuilderSection>();
  readonly update = input.required<(changes: Partial<FormBuilderSection>) => void>();
  readonly updateField = input<(changes: Partial<FormBuilderField>) => void>();
  readonly updateSection = input<(changes: Partial<FormBuilderSection>) => void>();

  protected patch(changes: Partial<FormBuilderSection>): void {
    (this.updateSection() ?? this.update())(changes);
  }
}
