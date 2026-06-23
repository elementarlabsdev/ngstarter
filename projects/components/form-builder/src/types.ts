import { Type } from '@angular/core';
import { AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { SelectDataSource } from '@ngstarter-ui/components/select';

export type FormBuilderFieldWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type FormBuilderItemKind = 'field' | 'layout' | 'static';
export type FormBuilderSettingsInheritance = 'field' | 'input-field' | 'layout' | 'layout-container' | 'static' | 'none';
export type FormBuilderSelectOptionsSource = 'static' | 'dataSource';

export interface FormBuilderOption {
  label: string;
  value: any;
  selected?: boolean;
}

export interface FormBuilderSelectDataSourceOptions {
  pageSize?: number;
  searchable?: boolean;
  searchDebounce?: number;
  minSearchLength?: number;
  loadOnOpen?: boolean;
}

export interface FormBuilderSelectDataSourceDefinition {
  id: string;
  name: string;
  dataSource: SelectDataSource;
  optionContentComponent?: Type<any>;
  valueComponent?: Type<any>;
}

export interface FormBuilderValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'min' | 'max' | string;
  value?: any;
  message?: string;
}

export type FormBuilderValidatorValueType = 'text' | 'number' | 'boolean' | 'pattern';

export type FormBuilderValidatorFactory =
  (rule: FormBuilderValidationRule, field: FormBuilderField) =>
    ValidatorFn | ValidatorFn[] | AsyncValidatorFn | AsyncValidatorFn[] | null | undefined;

export interface FormBuilderValidatorDefinition {
  type: string;
  label: string;
  description?: string;
  errorKey?: string;
  valueType?: FormBuilderValidatorValueType;
  valueLabel?: string;
  valuePlaceholder?: string;
  requiresValue?: boolean;
  defaultValue?: any;
  defaultMessage?: string;
  async?: boolean;
  validator: FormBuilderValidatorFactory;
}

export interface FormBuilderField {
  id: string;
  name: string;
  type: string;
  kind?: FormBuilderItemKind;
  label: string;
  placeholder?: string;
  hint?: string;
  defaultValue?: any;
  multiple?: boolean;
  clearable?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  width?: FormBuilderFieldWidth;
  options?: FormBuilderOption[];
  optionsSource?: FormBuilderSelectOptionsSource;
  dataSource?: string;
  dataSourceOptions?: FormBuilderSelectDataSourceOptions;
  validation?: FormBuilderValidationRule[];
  settings?: Record<string, any>;
  children?: FormBuilderField[];
}

export interface FormBuilderSection {
  id: string;
  title: string;
  description?: string;
  collapsed?: boolean;
  fields: FormBuilderField[];
}

export interface FormBuilderLayoutItem {
  kind: 'field' | 'section';
  id: string;
}

export interface FormBuilderSchema {
  title?: string;
  fields?: FormBuilderField[];
  layout?: FormBuilderLayoutItem[];
  sections: FormBuilderSection[];
}

export interface FormBuilderFieldRenderContext {
  field: FormBuilderField;
  control: FormControl;
  readonly: boolean;
}

export interface FormBuilderUploadContext {
  field: FormBuilderField;
  control: FormControl;
  event: any;
  files: File[];
  fileList: FileList | null;
  multiple: boolean;
}

export type FormBuilderUploadCallback = (context: FormBuilderUploadContext) => any | Promise<any>;
export type FormBuilderComponentImporter<T = any> = () => Promise<Type<T>>;

export interface FormBuilderSettingsContext {
  field: FormBuilderField;
  schema: FormBuilderSchema;
  update: (changes: Partial<FormBuilderField>) => void;
}

export interface FormBuilderFieldSettingsContext {
  item: FormBuilderField;
  field: FormBuilderField;
  schema: FormBuilderSchema;
  definition?: FormBuilderFieldDefinition;
  update: (changes: Partial<FormBuilderField>) => void;
  updateField: (changes: Partial<FormBuilderField>) => void;
}

export interface FormBuilderSectionSettingsContext {
  item: FormBuilderSection;
  section: FormBuilderSection;
  schema: FormBuilderSchema;
  definition?: FormBuilderItemDefinition;
  update: (changes: Partial<FormBuilderSection>) => void;
  updateSection: (changes: Partial<FormBuilderSection>) => void;
}

export type FormBuilderSettingsSchemaFactory =
  (context: FormBuilderFieldSettingsContext | FormBuilderSectionSettingsContext) => FormBuilderSchema;

export interface FormBuilderSettingsConfig {
  extends?: FormBuilderSettingsInheritance;
  schema?: FormBuilderSchema | FormBuilderSettingsSchemaFactory;
}

export interface FormBuilderItemDefinition {
  type: string;
  label: string;
  kind?: FormBuilderItemKind;
  group?: string;
  icon?: string;
  description?: string;
  defaults?: Partial<FormBuilderField>;
  renderer?: FormBuilderComponentImporter;
  settings?: FormBuilderComponentImporter | FormBuilderSettingsConfig;
  acceptsChildren?: boolean;
}

export interface FormBuilderFieldDefinition extends FormBuilderItemDefinition {
  kind?: FormBuilderItemKind;
  validators?: (field: FormBuilderField) => ValidatorFn[];
}

export interface FormBuilderSettingsDefinition {
  fieldType?: string;
  itemType?: string;
  type?: string;
  kind?: FormBuilderItemKind;
  component: FormBuilderComponentImporter;
}

export interface FormBuilderFieldChange {
  field: FormBuilderField;
  section?: FormBuilderSection;
}
