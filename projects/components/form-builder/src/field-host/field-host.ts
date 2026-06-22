import {
  ChangeDetectionStrategy,
  Component,
  Type,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  Datepicker,
  DatepickerInput,
  DatepickerToggle,
  DateRange,
  DateRangeInput,
  DateRangePicker,
  EndDate,
  provideNativeDateAdapter,
  StartDate
} from '@ngstarter-ui/components/datepicker';
import { Error as FormFieldError, FormField, Hint, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import {
  Select,
  SelectDataSource,
  SelectOptionContentContext,
  SelectOptionContentDef,
  SelectValueContext,
  SelectValueDef
} from '@ngstarter-ui/components/select';
import { Option } from '@ngstarter-ui/components/option';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { RadioButton, RadioGroup, RadioGroupOrientation } from '@ngstarter-ui/components/radio';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { CountrySelect } from '@ngstarter-ui/components/country-select';
import { CurrencySelect } from '@ngstarter-ui/components/currency-select';
import { TimezoneSelect } from '@ngstarter-ui/components/timezone-select';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter-ui/components/timepicker';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  UploadArea,
  UploadAreaDropStateDirective,
  UploadAreaIconDirective,
  UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadFileSelectedEvent,
  UploadTriggerDirective
} from '@ngstarter-ui/components/upload';
import {
  FORM_BUILDER_SELECT_DATA_SOURCES,
  FORM_BUILDER_UPLOAD_CALLBACK,
  FORM_BUILDER_VALIDATORS,
  mergeFormBuilderValidatorDefinitions
} from '../config';
import {
  FormBuilderField,
  FormBuilderFieldDefinition,
  FormBuilderUploadCallback,
  FormBuilderValidationRule,
  FormBuilderValidatorDefinition
} from '../types';

@Component({
  selector: 'ngs-form-builder-field-host',
  exportAs: 'ngsFormBuilderFieldHost',
  imports: [
    ReactiveFormsModule,
    Datepicker,
    DatepickerInput,
    DatepickerToggle,
    DateRangeInput,
    DateRangePicker,
    StartDate,
    EndDate,
    FormField,
    FormFieldError,
    Hint,
    IconButtonSuffix,
    Label,
    Input,
    NgComponentOutlet,
    Select,
    SelectOptionContentDef,
    SelectValueDef,
    Option,
    Checkbox,
    SlideToggle,
    RadioButton,
    RadioGroup,
    Segmented,
    SegmentedButton,
    CountrySelect,
    CurrencySelect,
    TimezoneSelect,
    Timepicker,
    TimepickerInput,
    TimepickerToggle,
    Icon,
    UploadArea,
    UploadAreaIconDirective,
    UploadAreaMainStateDirective,
    UploadAreaDropStateDirective,
    UploadAreaInvalidStateDirective,
    UploadTriggerDirective
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
    '[class.is-width-12]': '!editableCanvas() && (field().width ?? 12) === 12',
    '[class.is-hidden-field]': '!editableCanvas() && field().type === "hidden"'
  }
})
export class FormBuilderFieldHost {
  private readonly providedUploadCallback = inject(FORM_BUILDER_UPLOAD_CALLBACK, { optional: true });
  private readonly selectDataSources = inject(FORM_BUILDER_SELECT_DATA_SOURCES, { optional: true }) ?? [];
  private readonly providedValidators = inject(FORM_BUILDER_VALIDATORS, { optional: true }) ?? [];

  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FormControl>();
  readonly definitions = input<FormBuilderFieldDefinition[]>([]);
  readonly readonly = input(false);
  readonly editableCanvas = input(false);
  readonly uploadCallback = input<FormBuilderUploadCallback | null | undefined>(undefined);

  protected readonly customLoaded = signal(false);
  protected readonly controlValue = signal<any>(null);
  protected readonly controlStateVersion = signal(0);
  protected readonly textInputType = computed(() => {
    const type = this.field().type;
    return type === 'number' || type === 'email' ? type : 'text';
  });
  protected readonly radioOrientation = computed<RadioGroupOrientation>(() =>
    this.field().settings?.['orientation'] === 'horizontal' ? 'horizontal' : 'vertical'
  );
  protected readonly uploadAccept = computed(() => this.field().settings?.['accept'] || '*/*');
  protected readonly uploadDisabled = computed(() =>
    this.readonly() || this.field().readonly || this.field().disabled || this.control().disabled
  );
  protected readonly dateRangeDisabled = computed(() =>
    this.readonly() || this.field().readonly || this.field().disabled || this.control().disabled
  );
  protected readonly uploadSelectedText = computed(() => {
    const value = this.controlValue();
    const files = Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];

    if (!files.length) {
      return this.field().placeholder || 'Drop files or click to upload';
    }

    if (files.length === 1) {
      return files[0]?.name || '1 file selected';
    }

    return `${files.length} files selected`;
  });
  protected readonly spacerHeight = computed(() => {
    const height = Number(this.field().settings?.['height'] ?? 24);
    return [8, 16, 24, 32, 48, 64].includes(height) ? height : 24;
  });
  protected readonly dateRangeStartValue = computed(() => this.formatDateRangePart(this.controlValue()?.start));
  protected readonly dateRangeEndValue = computed(() => this.formatDateRangePart(this.controlValue()?.end));
  protected readonly selectUsesDataSource = computed(() => {
    const field = this.field();

    return field.optionsSource === 'dataSource' || (!field.optionsSource && !!field.dataSource);
  });
  protected readonly selectDataSourceDefinition = computed(() => {
    if (!this.selectUsesDataSource()) {
      return null;
    }

    const dataSourceId = this.field().dataSource;

    if (!dataSourceId) {
      return null;
    }

    return this.selectDataSources.find(dataSource => dataSource.id === dataSourceId) ?? null;
  });
  protected readonly selectDataSource = computed<SelectDataSource | null>(() =>
    this.selectDataSourceDefinition()?.dataSource ?? null
  );
  protected readonly selectOptionContentComponent = computed<Type<any> | null>(() =>
    this.selectDataSourceDefinition()?.optionContentComponent ?? null
  );
  protected readonly selectValueComponent = computed<Type<any> | null>(() =>
    this.selectDataSourceDefinition()?.valueComponent ?? null
  );
  protected readonly selectPageSize = computed(() => this.field().dataSourceOptions?.pageSize ?? 20);
  protected readonly selectSearchable = computed(() => this.field().dataSourceOptions?.searchable ?? true);
  protected readonly selectSearchDebounce = computed(() => this.field().dataSourceOptions?.searchDebounce ?? 250);
  protected readonly selectMinSearchLength = computed(() => this.field().dataSourceOptions?.minSearchLength ?? 1);
  protected readonly selectLoadOnOpen = computed(() => this.field().dataSourceOptions?.loadOnOpen ?? true);
  protected readonly isRequired = computed(() =>
    this.field().required === true || this.field().validation?.some(rule => rule.type === 'required') === true
  );
  protected readonly validationDefinitions = computed(() => {
    const excluded = new Set<string>(this.field().settings?.['excludedValidatorTypes'] ?? []);

    return mergeFormBuilderValidatorDefinitions(this.providedValidators)
      .filter(definition => !excluded.has(definition.type));
  });
  protected readonly validationErrorMessage = computed(() => {
    this.controlValue();
    this.controlStateVersion();

    const control = this.control();

    if (!control.invalid || !(control.touched || control.dirty)) {
      return '';
    }

    const errors = control.errors;

    if (!errors) {
      return '';
    }

    for (const rule of this.fieldValidationRules()) {
      const definition = this.validationDefinitions().find(item => item.type === rule.type);
      const errorKey = definition?.errorKey ?? rule.type;

      if (errors[errorKey]) {
        return this.interpolateValidationMessage(
          rule.message || definition?.defaultMessage || `${definition?.label ?? rule.type} is invalid.`,
          rule
        );
      }
    }

    return '';
  });

  private readonly anchor = viewChild.required('anchor', { read: ViewContainerRef });

  constructor() {
    effect(onCleanup => {
      const control = this.control();

      this.controlValue.set(control.value);
      const subscription = control.valueChanges.subscribe(value => {
        this.controlValue.set(value);
        this.controlStateVersion.update(version => version + 1);
      });
      const statusSubscription = control.statusChanges.subscribe(() => {
        this.controlStateVersion.update(version => version + 1);
      });

      onCleanup(() => {
        subscription.unsubscribe();
        statusSubscription.unsubscribe();
      });
    });

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

  protected async onUploadFilesSelected(event: UploadFileSelectedEvent): Promise<void> {
    if (this.uploadDisabled()) {
      return;
    }

    const fallbackValue = this.field().multiple
      ? event.files
      : event.files[0] ?? null;
    const callback = this.uploadCallback() ?? this.providedUploadCallback;
    let value = fallbackValue;

    if (callback) {
      this.control().markAsPending();
      const uploadedValue = await callback({
        field: this.field(),
        control: this.control(),
        event: event.event,
        files: event.files,
        fileList: event.fileList,
        multiple: event.multiple
      });

      if (uploadedValue !== undefined) {
        value = uploadedValue;
      }
    }

    this.control().setValue(value);
    this.control().markAsDirty();
    this.control().markAsTouched();
    this.control().updateValueAndValidity();
  }

  protected hasValidationRule(type: string): boolean {
    return this.validationRules().some(rule => rule.type === type);
  }

  protected validationRuleValue(type: string): any {
    return this.validationRules().find(rule => rule.type === type)?.value ?? '';
  }

  protected validationRuleMessage(type: string): string {
    const rule = this.validationRules().find(item => item.type === type);
    const definition = this.validationDefinitions().find(item => item.type === type);

    return rule?.message ?? this.defaultValidationRuleMessage(definition);
  }

  protected validatorRequiresValue(definition: FormBuilderValidatorDefinition): boolean {
    return definition.requiresValue === true;
  }

  protected validationRuleInputType(definition: FormBuilderValidatorDefinition): string {
    return definition.valueType === 'number' ? 'number' : 'text';
  }

  protected setValidationRuleEnabled(definition: FormBuilderValidatorDefinition, enabled: boolean): void {
    const rules = this.validationRules();
    const exists = rules.some(rule => rule.type === definition.type);

    if (enabled && !exists) {
      this.writeValidationRules([
        ...rules,
        {
          type: definition.type,
          value: definition.requiresValue ? definition.defaultValue ?? null : undefined,
          message: this.defaultValidationRuleMessage(definition)
        }
      ]);
      return;
    }

    if (!enabled && exists) {
      this.writeValidationRules(rules.filter(rule => rule.type !== definition.type));
    }
  }

  protected updateValidationRuleValue(definition: FormBuilderValidatorDefinition, event: Event): void {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const value = definition.valueType === 'number'
      ? input.value === '' ? null : Number(input.value)
      : input.value;

    this.patchValidationRule(definition, { value });
  }

  protected updateValidationRuleMessage(definition: FormBuilderValidatorDefinition, event: Event): void {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    this.patchValidationRule(definition, { message: input.value });
  }

  protected selectOptionContentInputs(
    data: unknown,
    option: SelectOptionContentContext['option'],
    value: unknown,
    label: string,
    selected: boolean,
    disabled: boolean,
    multiple: boolean
  ): Record<string, unknown> {
    const context: SelectOptionContentContext = {
      $implicit: data,
      data,
      option,
      value,
      label,
      selected,
      disabled,
      multiple
    };

    return {
      context,
      field: this.field(),
      control: this.control(),
      data,
      option,
      value,
      label,
      selected,
      disabled,
      multiple
    };
  }

  protected selectValueInputs(
    data: SelectValueContext['data'],
    option: SelectValueContext['option'],
    value: SelectValueContext['value'],
    label: string,
    labels: string[],
    count: number,
    multiple: boolean
  ): Record<string, unknown> {
    const context: SelectValueContext = {
      $implicit: data,
      data,
      option,
      value,
      label,
      labels,
      count,
      multiple
    };

    return {
      context,
      field: this.field(),
      control: this.control(),
      data,
      option,
      value,
      label,
      labels,
      count,
      multiple
    };
  }

  private patchValidationRule(
    definition: FormBuilderValidatorDefinition,
    changes: Partial<FormBuilderValidationRule>
  ): void {
    const rules = this.validationRules();
    const index = rules.findIndex(rule => rule.type === definition.type);
    const current = index === -1
      ? {
          type: definition.type,
          value: definition.requiresValue ? definition.defaultValue ?? null : undefined,
          message: this.defaultValidationRuleMessage(definition)
        }
      : rules[index];
    const nextRule = {
      ...current,
      ...changes
    };
    const nextRules = [...rules];

    if (index === -1) {
      nextRules.push(nextRule);
    } else {
      nextRules[index] = nextRule;
    }

    this.writeValidationRules(nextRules);
  }

  private validationRules(): FormBuilderValidationRule[] {
    const value = this.control().value;

    return Array.isArray(value)
      ? value.filter(isValidationRule).map(rule => ({ ...rule }))
      : [];
  }

  private writeValidationRules(rules: FormBuilderValidationRule[]): void {
    this.control().setValue(rules);
    this.control().markAsDirty();
    this.control().markAsTouched();
    this.control().updateValueAndValidity();
  }

  private fieldValidationRules(): FormBuilderValidationRule[] {
    const field = this.field();
    const rules = field.validation?.map(rule => ({ ...rule })) ?? [];

    if (field.required && !rules.some(rule => rule.type === 'required')) {
      return [
        {
          type: 'required',
          message: this.defaultValidationRuleMessage(
            this.validationDefinitions().find(definition => definition.type === 'required')
          )
        },
        ...rules
      ];
    }

    return rules;
  }

  private defaultValidationRuleMessage(definition: FormBuilderValidatorDefinition | undefined): string {
    return this.interpolateValidationMessage(
      definition?.defaultMessage || `${definition?.label ?? 'Value'} is invalid.`,
      {
        value: definition?.defaultValue
      }
    );
  }

  private interpolateValidationMessage(message: string, rule: Pick<FormBuilderValidationRule, 'value'>): string {
    return message.split('{value}').join(rule.value === undefined || rule.value === null ? '' : String(rule.value));
  }

  protected onDateRangeChanged(rangeInput: DateRangeInput<any>): void {
    queueMicrotask(() => {
      const range = rangeInput.value;
      const nextRange = range ?? new DateRange(null, null);
      this.control().setValue(nextRange);
      this.control().markAsDirty();
      this.control().markAsTouched();
    });
  }

  private formatDateRangePart(value: unknown): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    return String(value);
  }
}

function isValidationRule(value: unknown): value is FormBuilderValidationRule {
  return typeof value === 'object' && value !== null && 'type' in value;
}
