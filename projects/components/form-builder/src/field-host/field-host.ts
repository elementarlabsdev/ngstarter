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
import { Alert } from '@ngstarter-ui/components/alert';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import { Chip } from '@ngstarter-ui/components/chips';
import { ColorPicker, ColorPickerThumbnail, ColorPickerTriggerForDirective } from '@ngstarter-ui/components/color-picker';
import { ColorSwitcher } from '@ngstarter-ui/components/color-switcher';
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
import { Error as FormFieldError, FormField, Hint, IconButtonSuffix, Label, Suffix } from '@ngstarter-ui/components/form-field';
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
  File as UploadFile,
  FileControl,
  FileList,
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

const DEFAULT_COLOR_SWITCHER_COLORS = [
  '#35d1b3',
  '#08b0fe',
  '#8268f2',
  '#ae52d3',
  '#eb4ea3',
  '#fb811e',
  '#fac624',
  '#c2c2c2',
  '#4ed7ff'
];

@Component({
  selector: 'ngs-form-builder-field-host',
  exportAs: 'ngsFormBuilderFieldHost',
  imports: [
    ReactiveFormsModule,
    Alert,
    Avatar,
    Button,
    Chip,
    ColorPicker,
    ColorPickerThumbnail,
    ColorPickerTriggerForDirective,
    ColorSwitcher,
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
    Suffix,
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
    UploadFile,
    FileControl,
    FileList,
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
  protected readonly calculatedInputType = computed(() =>
    this.field().settings?.['valueType'] === 'number' ? 'number' : 'text'
  );
  protected readonly plainTextValue = computed(() => {
    const value = this.controlValue();

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  });
  protected readonly alertVariant = computed(() => normalizedString(this.field().settings?.['variant']) || 'informative');
  protected readonly alertFieldPath = computed(() => normalizedString(this.field().settings?.['fieldPath']));
  protected readonly radioOrientation = computed<RadioGroupOrientation>(() =>
    this.field().settings?.['orientation'] === 'horizontal' ? 'horizontal' : 'vertical'
  );
  protected readonly colorPickerShowOpacity = computed(() => this.field().settings?.['showOpacity'] !== false);
  protected readonly colorPickerResultFormat = computed(() => {
    const format = this.field().settings?.['resultFormat'];

    return format === 'hex' || format === 'hsl' || format === 'hsv' ? format : 'rgb';
  });
  protected readonly colorPickerValue = computed(() => {
    const value = this.controlValue();

    return typeof value === 'string' ? value : '';
  });
  protected readonly colorPickerDisabled = computed(() =>
    this.readonly() || !!this.field().readonly || !!this.field().disabled || this.control().disabled
  );
  protected readonly colorSwitcherColors = computed(() => {
    const colors = this.field().settings?.['colors'];
    const normalizedColors = Array.isArray(colors)
      ? colors.filter(color => typeof color === 'string' && color.trim()).map(color => color.trim())
      : [];

    return normalizedColors.length ? normalizedColors : DEFAULT_COLOR_SWITCHER_COLORS;
  });
  protected readonly uploadAccept = computed(() =>
    this.field().type === 'logo-upload'
      ? logoUploadAccept(this.field())
      : this.field().settings?.['accept'] || '*/*'
  );
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
  protected readonly logoUploadValue = computed(() => {
    const value = this.controlValue();

    return Array.isArray(value) ? value[0] ?? null : value ?? null;
  });
  protected readonly hasLogoUploadValue = computed(() => this.logoUploadValue() !== null);
  protected readonly logoUploadInstruction = computed(() =>
    normalizedString(this.field().placeholder) || 'Drop logo here'
  );
  protected readonly logoUploadFormatLabels = computed(() =>
    logoUploadFormatLabels(this.field())
  );
  protected readonly logoUploadRequirementsText = computed(() => {
    return this.logoUploadFormatLabels().join(', ');
  });
  protected readonly logoUploadMaxFileSizeText = computed(() =>
    normalizedString(this.field().settings?.['maxFileSize']) || '5 MB'
  );
  protected readonly logoUploadPreviewKey = computed(() => {
    const configured = normalizedString(this.field().settings?.['previewText']);

    if (configured) {
      return configured;
    }

    const fileName = this.logoUploadFileName();

    if (this.hasLogoUploadValue() && fileName !== 'Selected logo') {
      return fileName;
    }

    return this.field().label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'LG';
  });
  protected readonly logoUploadImageSrc = computed(() =>
    readStringProperty(this.logoUploadValue(), ['url', 'src', 'previewUrl', 'imageUrl', 'href'])
  );
  protected readonly logoUploadFileName = computed(() =>
    readStringProperty(this.logoUploadValue(), ['name', 'fileName', 'filename', 'originalName']) || 'Selected logo'
  );
  protected readonly logoUploadFileSize = computed(() =>
    formatUploadFileSize(readUnknownProperty(this.logoUploadValue(), ['size', 'fileSize']))
  );
  protected readonly logoUploadState = computed(() => {
    this.controlStateVersion();

    return this.control().pending ? 'uploading' : 'uploaded';
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
    const calculationError = control.errors?.['formBuilderCalculation'];

    if (calculationError) {
      return typeof calculationError.message === 'string'
        ? calculationError.message
        : 'Calculation failed.';
    }

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

    if (errors['formBuilderLogoUploadMaxFileSize']) {
      return `File must be ${this.logoUploadMaxFileSizeText()} or smaller.`;
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

    if (this.field().type === 'logo-upload' && this.logoUploadFileExceedsMaxSize(event.files[0])) {
      this.control().setErrors({
        ...(this.control().errors ?? {}),
        formBuilderLogoUploadMaxFileSize: true
      });
      this.control().markAsDirty();
      this.control().markAsTouched();
      this.controlStateVersion.update(version => version + 1);
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
    this.clearLogoUploadMaxSizeError();
    this.control().markAsDirty();
    this.control().markAsTouched();
    this.control().updateValueAndValidity();
  }

  protected clearLogoUpload(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.uploadDisabled()) {
      return;
    }

    this.control().setValue(null);
    this.clearLogoUploadMaxSizeError();
    this.control().markAsDirty();
    this.control().markAsTouched();
    this.control().updateValueAndValidity();
  }

  private logoUploadFileExceedsMaxSize(file: File | undefined): boolean {
    const maxSize = parseLogoUploadMaxFileSize(this.field().settings?.['maxFileSize']);

    return !!file && !!maxSize && file.size > maxSize;
  }

  private clearLogoUploadMaxSizeError(): void {
    const errors = this.control().errors;

    if (!errors?.['formBuilderLogoUploadMaxFileSize']) {
      return;
    }

    const nextErrors = { ...errors };
    delete nextErrors['formBuilderLogoUploadMaxFileSize'];
    this.control().setErrors(Object.keys(nextErrors).length ? nextErrors : null);
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

function normalizedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

const LOGO_UPLOAD_FORMATS = [
  {
    key: 'svg',
    label: 'SVG',
    accept: 'image/svg+xml'
  },
  {
    key: 'png',
    label: 'PNG',
    accept: 'image/png'
  },
  {
    key: 'jpg',
    label: 'JPG',
    accept: 'image/jpeg'
  },
  {
    key: 'webp',
    label: 'WEBP',
    accept: 'image/webp'
  }
];

function logoUploadFormatLabels(field: FormBuilderField): string[] {
  const allowedFormats = field.settings?.['allowedFormats'];

  if (isRecord(allowedFormats)) {
    const labels = LOGO_UPLOAD_FORMATS
      .filter(format => allowedFormats[format.key] === true)
      .map(format => format.label);

    return labels.length ? labels : LOGO_UPLOAD_FORMATS.map(format => format.label);
  }

  return parseLegacyFormatLabels(field.settings?.['formats']);
}

function logoUploadAccept(field: FormBuilderField): string {
  const allowedFormats = field.settings?.['allowedFormats'];

  if (isRecord(allowedFormats)) {
    const accept = LOGO_UPLOAD_FORMATS
      .filter(format => allowedFormats[format.key] === true)
      .map(format => format.accept)
      .join(',');

    return accept || LOGO_UPLOAD_FORMATS.map(format => format.accept).join(',');
  }

  return normalizedString(field.settings?.['accept']) || LOGO_UPLOAD_FORMATS.map(format => format.accept).join(',');
}

function parseLegacyFormatLabels(value: unknown): string[] {
  const fallback = LOGO_UPLOAD_FORMATS.map(format => format.label);

  if (Array.isArray(value)) {
    const labels = value.map(item => normalizedString(item)).filter(Boolean);

    return labels.length ? labels : fallback;
  }

  const text = normalizedString(value);

  if (!text) {
    return fallback;
  }

  const labels = text
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);

  return labels.length ? labels : fallback;
}

function parseLogoUploadMaxFileSize(value: unknown): number | null {
  if (typeof value === 'number') {
    return value > 0 ? value * 1024 * 1024 : null;
  }

  const text = normalizedString(value).replace(',', '.');

  if (!text) {
    return 5 * 1024 * 1024;
  }

  const match = text.match(/^(\d+(?:\.\d+)?)\s*([kmgt]?b|[кмгт]?б)?$/i);

  if (!match) {
    return null;
  }

  const size = Number(match[1]);
  const unit = (match[2] || 'mb').toLowerCase();
  const multiplier = unit.startsWith('k') || unit.startsWith('к')
    ? 1024
    : unit.startsWith('g') || unit.startsWith('г')
      ? 1024 ** 3
      : unit.startsWith('t') || unit.startsWith('т')
        ? 1024 ** 4
        : 1024 ** 2;

  return Number.isFinite(size) && size > 0 ? size * multiplier : null;
}

function readUnknownProperty(value: unknown, propertyNames: string[]): unknown {
  if (isNativeFile(value) && propertyNames.includes('size')) {
    return value.size;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  for (const propertyName of propertyNames) {
    if (value[propertyName] !== undefined) {
      return value[propertyName];
    }
  }

  return undefined;
}

function readStringProperty(value: unknown, propertyNames: string[]): string {
  if (isNativeFile(value) && propertyNames.includes('name')) {
    return value.name;
  }

  if (typeof value === 'string' && propertyNames.some(propertyName => ['url', 'src', 'href'].includes(propertyName))) {
    return value;
  }

  const propertyValue = readUnknownProperty(value, propertyNames);

  return normalizedString(propertyValue);
}

function formatUploadFileSize(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = value;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted = size >= 10 || unitIndex === 0
    ? Math.round(size).toString()
    : size.toFixed(1);

  return `${formatted} ${units[unitIndex]}`;
}

function isNativeFile(value: unknown): value is globalThis.File {
  return typeof globalThis.File !== 'undefined' && value instanceof globalThis.File;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
