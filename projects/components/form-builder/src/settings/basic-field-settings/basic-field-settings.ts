import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Error as FormFieldError, FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Select } from '@ngstarter-ui/components/select';
import { Option } from '@ngstarter-ui/components/option';
import { SlideToggle, SlideToggleGroup } from '@ngstarter-ui/components/slide-toggle';
import { FormBuilderField, FormBuilderFieldWidth, FormBuilderOption } from '../../types';

type RadioOrientation = 'vertical' | 'horizontal';
type SpacerHeight = 8 | 16 | 24 | 32 | 48 | 64;

@Component({
  selector: 'ngs-basic-form-builder-field-settings',
  exportAs: 'ngsBasicFormBuilderFieldSettings',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormFieldError,
    FormField,
    Hint,
    Label,
    Input,
    Select,
    Option,
    SlideToggle,
    SlideToggleGroup
  ],
  templateUrl: './basic-field-settings.html',
  styleUrl: './basic-field-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-basic-form-builder-field-settings'
  }
})
export class BasicFormBuilderFieldSettings {
  private readonly destroyRef = inject(DestroyRef);

  readonly field = input.required<FormBuilderField>();
  readonly update = input.required<(changes: Partial<FormBuilderField>) => void>();

  protected readonly optionsControl = new FormControl('', {
    nonNullable: true,
    validators: optionsTextValidator
  });
  protected readonly fieldWidthOptions: FormBuilderFieldWidth[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  protected readonly radioOrientationOptions: RadioOrientation[] = ['vertical', 'horizontal'];
  protected readonly spacerHeightOptions: SpacerHeight[] = [8, 16, 24, 32, 48, 64];
  protected readonly hasCheckedState = computed(() => ['checkbox', 'toggle'].includes(this.field().type));
  protected readonly hasPlaceholder = computed(() => !['checkbox', 'toggle', 'radio', 'spacer'].includes(this.field().type));
  protected readonly hasOptions = computed(() => ['select', 'radio', 'checkbox-list'].includes(this.field().type));
  protected readonly hasClearable = computed(() => ['select', 'country-select'].includes(this.field().type));
  protected readonly hasMultiple = computed(() => ['select', 'upload'].includes(this.field().type));
  protected readonly isSelect = computed(() => this.field().type === 'select');
  protected readonly isUpload = computed(() => ['upload', 'logo-upload'].includes(this.field().type));
  protected readonly isRadio = computed(() => this.field().type === 'radio');
  protected readonly isSpacer = computed(() => this.field().type === 'spacer');
  protected readonly hasBehaviorToggles = computed(() => !this.isSpacer());
  protected readonly radioOrientation = computed<RadioOrientation>(() =>
    this.field().settings?.['orientation'] === 'horizontal' ? 'horizontal' : 'vertical'
  );
  protected readonly optionsText = computed(() =>
    (this.field().options ?? [])
      .map(option => `${option.label}:${option.value}${this.isOptionSelected(option) ? ':selected' : ''}`)
      .join('\n')
  );

  constructor() {
    effect(() => {
      const nextValue = this.optionsText();

      if (this.optionsControl.value !== nextValue) {
        this.optionsControl.setValue(nextValue, { emitEvent: false });
      }
    });

    this.optionsControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (this.optionsControl.invalid) {
          return;
        }

        this.patchOptions(value);
      });
  }

  protected patch(changes: Partial<FormBuilderField>): void {
    this.update()(changes);
  }

  protected patchSettings(changes: Record<string, any>): void {
    this.patch({
      settings: {
        ...this.field().settings,
        ...changes
      }
    });
  }

  protected patchMultiple(multiple: boolean): void {
    if (this.field().type === 'select') {
      this.patchSelectMultiple(multiple);
      return;
    }

    this.patch({
      multiple,
      defaultValue: multiple ? [] : null
    });
  }

  protected patchSelectMultiple(multiple: boolean): void {
    const field = this.field();
    const options = multiple ? field.options ?? [] : this.normalizeSelectedOptions(field.options ?? [], false);
    const selectedValues = this.selectedOptionValues(options);
    let defaultValue: any = null;

    if (multiple) {
      defaultValue = Array.isArray(field.defaultValue)
        ? field.defaultValue
        : field.defaultValue == null
          ? selectedValues
          : [field.defaultValue];
    } else {
      defaultValue = Array.isArray(field.defaultValue)
        ? field.defaultValue[0] ?? selectedValues[0] ?? null
        : field.defaultValue ?? selectedValues[0] ?? null;
    }

    this.patch({ multiple, options, defaultValue });
  }

  protected patchRadioOrientation(orientation: RadioOrientation): void {
    this.patch({
      settings: {
        ...this.field().settings,
        orientation
      }
    });
  }

  protected patchOptions(value: string): void {
    const options = this.normalizeSelectedOptions(value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const parsed = parseOptionLine(line);

        return {
          label: parsed?.label || `Option ${index + 1}`,
          value: parsed?.value || `option_${index + 1}`,
          selected: parsed?.selected || undefined
        };
      }));

    this.patch({
      options,
      defaultValue: this.resolveSelectedDefaultValue(options)
    });
  }

  private normalizeSelectedOptions(options: FormBuilderOption[], multiple = this.field().multiple): FormBuilderOption[] {
    if (this.field().type === 'checkbox-list' || multiple) {
      return options;
    }

    let selectedSeen = false;

    return options.map(option => {
      if (!option.selected) {
        return option;
      }

      if (selectedSeen) {
        return {
          ...option,
          selected: undefined
        };
      }

      selectedSeen = true;
      return option;
    });
  }

  private resolveSelectedDefaultValue(options: FormBuilderOption[]): any {
    const selectedValues = this.selectedOptionValues(options);

    if (this.field().type === 'checkbox-list' || this.field().multiple) {
      return selectedValues;
    }

    return selectedValues[0] ?? null;
  }

  private selectedOptionValues(options: FormBuilderOption[]): any[] {
    return options
      .filter(option => option.selected)
      .map(option => option.value);
  }

  private isOptionSelected(option: FormBuilderOption): boolean {
    if (option.selected) {
      return true;
    }

    const defaultValue = this.field().defaultValue;
    return Array.isArray(defaultValue)
      ? defaultValue.includes(option.value)
      : defaultValue === option.value;
  }
}

function optionsTextValidator(control: AbstractControl<string>): ValidationErrors | null {
  const hasInvalidLine = (control.value ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .some(line => !parseOptionLine(line));

  return hasInvalidLine ? { formBuilderOptionsFormat: true } : null;
}

function parseOptionLine(line: string): { label: string; value: string; selected: boolean } | null {
  const parts = line.split(':').map(part => part.trim());

  if (parts.length < 2 || parts.length > 3) {
    return null;
  }

  const [label, value, selected] = parts;

  if (!label || !value) {
    return null;
  }

  if (selected !== undefined && selected !== 'selected') {
    return null;
  }

  return {
    label,
    value,
    selected: selected === 'selected'
  };
}
