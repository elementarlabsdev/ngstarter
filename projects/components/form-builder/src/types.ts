import { FormControl, ValidatorFn } from '@angular/forms';
import { Type } from '@angular/core';

export type FormBuilderFieldWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface FormBuilderOption {
  label: string;
  value: any;
}

export interface FormBuilderValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'min' | 'max' | string;
  value?: any;
  message?: string;
}

export interface FormBuilderVisibility {
  form?: boolean;
  email?: boolean;
  pdf?: boolean;
  condition?: string;
}

export interface FormBuilderField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  hint?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  width?: FormBuilderFieldWidth;
  options?: FormBuilderOption[];
  validation?: FormBuilderValidationRule[];
  visibility?: FormBuilderVisibility;
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

export interface FormBuilderSettingsContext {
  field: FormBuilderField;
  schema: FormBuilderSchema;
  update: (changes: Partial<FormBuilderField>) => void;
}

export type FormBuilderComponentImporter<T = any> = () => Promise<Type<T>>;

export interface FormBuilderFieldDefinition {
  type: string;
  label: string;
  group?: string;
  icon?: string;
  description?: string;
  defaults?: Partial<FormBuilderField>;
  renderer?: FormBuilderComponentImporter;
  settings?: FormBuilderComponentImporter;
  validators?: (field: FormBuilderField) => ValidatorFn[];
}

export interface FormBuilderSettingsDefinition {
  fieldType: string;
  component: FormBuilderComponentImporter;
}

export interface FormBuilderFieldChange {
  field: FormBuilderField;
  section?: FormBuilderSection;
}
