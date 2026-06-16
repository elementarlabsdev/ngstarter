import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  computed,
  effect,
  input,
  signal,
  viewChild
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Datepicker, DatepickerInput, DatepickerToggle, provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import { FormField, Hint, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Select } from '@ngstarter-ui/components/select';
import { Option } from '@ngstarter-ui/components/option';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { RadioButton, RadioGroup, RadioGroupOrientation } from '@ngstarter-ui/components/radio';
import { CountrySelect } from '@ngstarter-ui/components/country-select';
import { CurrencySelect } from '@ngstarter-ui/components/currency-select';
import { TimezoneSelect } from '@ngstarter-ui/components/timezone-select';
import { FormBuilderField, FormBuilderFieldDefinition } from '../types';

@Component({
  selector: 'ngs-form-builder-field-host',
  exportAs: 'ngsFormBuilderFieldHost',
  imports: [
    ReactiveFormsModule,
    Datepicker,
    DatepickerInput,
    DatepickerToggle,
    FormField,
    Hint,
    IconButtonSuffix,
    Label,
    Input,
    Select,
    Option,
    Checkbox,
    SlideToggle,
    RadioButton,
    RadioGroup,
    CountrySelect,
    CurrencySelect,
    TimezoneSelect
  ],
  templateUrl: './field-host.html',
  styleUrl: './field-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideNativeDateAdapter()
  ],
  host: {
    'class': 'ngs-form-builder-field-host',
    '[class.is-custom]': 'customLoaded()',
    '[class.is-width-1]': '!editableCanvas() && field().width === 1',
    '[class.is-width-2]': '!editableCanvas() && field().width === 2',
    '[class.is-width-3]': '!editableCanvas() && field().width === 3',
    '[class.is-width-4]': '!editableCanvas() && field().width === 4',
    '[class.is-width-5]': '!editableCanvas() && field().width === 5',
    '[class.is-width-6]': '!editableCanvas() && field().width === 6',
    '[class.is-width-7]': '!editableCanvas() && field().width === 7',
    '[class.is-width-8]': '!editableCanvas() && field().width === 8',
    '[class.is-width-9]': '!editableCanvas() && field().width === 9',
    '[class.is-width-10]': '!editableCanvas() && field().width === 10',
    '[class.is-width-11]': '!editableCanvas() && field().width === 11',
    '[class.is-width-12]': '!editableCanvas() && (field().width ?? 12) === 12'
  }
})
export class FormBuilderFieldHost {
  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FormControl>();
  readonly definitions = input<FormBuilderFieldDefinition[]>([]);
  readonly readonly = input(false);
  readonly editableCanvas = input(false);

  protected readonly customLoaded = signal(false);
  protected readonly textInputType = computed(() => {
    const type = this.field().type;
    return type === 'number' || type === 'email' ? type : 'text';
  });
  protected readonly radioOrientation = computed<RadioGroupOrientation>(() =>
    this.field().settings?.['orientation'] === 'horizontal' ? 'horizontal' : 'vertical'
  );

  private readonly anchor = viewChild.required('anchor', { read: ViewContainerRef });

  constructor() {
    effect(async () => {
      const field = this.field();
      const control = this.control();
      const definitions = this.definitions();
      const viewContainer = this.anchor();
      const renderer = definitions.find(definition => definition.type === field.type)?.renderer;

      viewContainer.clear();
      this.customLoaded.set(false);

      if (!renderer) {
        return;
      }

      const componentType = await renderer();
      const componentRef = viewContainer.createComponent(componentType);
      componentRef.setInput('field', field);
      componentRef.setInput('control', control);
      componentRef.setInput('readonly', this.readonly());
      componentRef.setInput('definition', definitions.find(definition => definition.type === field.type));
      this.customLoaded.set(true);
    });
  }
}
