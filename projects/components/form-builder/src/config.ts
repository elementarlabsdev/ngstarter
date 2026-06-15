import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { Validators } from '@angular/forms';
import {
  FormBuilderField,
  FormBuilderFieldDefinition,
  FormBuilderItemDefinition,
  FormBuilderSettingsDefinition,
  FormBuilderValidationRule
} from './types';

export const FORM_BUILDER_ITEMS =
  new InjectionToken<FormBuilderItemDefinition[]>('FORM_BUILDER_ITEMS');

export const FORM_BUILDER_FIELDS =
  new InjectionToken<FormBuilderFieldDefinition[]>('FORM_BUILDER_FIELDS');

export const FORM_BUILDER_SETTINGS =
  new InjectionToken<FormBuilderSettingsDefinition[]>('FORM_BUILDER_SETTINGS');

export function formBuilderField(definition: FormBuilderFieldDefinition): FormBuilderFieldDefinition {
  return definition;
}

export function formBuilderItem(definition: FormBuilderItemDefinition): FormBuilderItemDefinition {
  return definition;
}

export function formBuilderSettings(definition: FormBuilderSettingsDefinition): FormBuilderSettingsDefinition {
  return definition;
}

export function provideFormBuilder(config: {
  items?: FormBuilderItemDefinition[];
  fields?: FormBuilderFieldDefinition[];
  settings?: FormBuilderSettingsDefinition[];
} = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config.items ?? []).map(item => ({
      provide: FORM_BUILDER_ITEMS,
      useValue: item,
      multi: true
    })),
    ...(config.fields ?? []).map(field => ({
      provide: FORM_BUILDER_FIELDS,
      useValue: field,
      multi: true
    })),
    ...(config.settings ?? []).map(settings => ({
      provide: FORM_BUILDER_SETTINGS,
      useValue: settings,
      multi: true
    }))
  ]);
}

export const DEFAULT_FORM_BUILDER_FIELDS: FormBuilderFieldDefinition[] = [
  {
    type: 'text',
    label: 'Text',
    group: 'Basic',
    icon: 'fluent:text-font-24-regular',
    defaults: {
      label: 'Text field',
      placeholder: 'Enter text'
    }
  },
  {
    type: 'number',
    label: 'Number',
    group: 'Basic',
    icon: 'fluent:number-symbol-24-regular',
    defaults: {
      label: 'Number',
      placeholder: '0'
    }
  },
  {
    type: 'email',
    label: 'Email',
    group: 'Basic',
    icon: 'fluent:mail-24-regular',
    defaults: {
      label: 'Email',
      placeholder: 'name@example.com'
    },
    validators: field => field.required ? [Validators.required, Validators.email] : [Validators.email]
  },
  {
    type: 'textarea',
    label: 'Textarea',
    group: 'Basic',
    icon: 'fluent:text-description-24-regular',
    defaults: {
      label: 'Description',
      placeholder: 'Enter description',
      width: 12
    }
  },
  {
    type: 'group',
    label: 'Group',
    kind: 'layout',
    group: 'Layout',
    icon: 'fluent:group-24-regular',
    description: 'Container for nested fields.',
    acceptsChildren: true,
    defaults: {
      kind: 'layout',
      label: 'Group',
      width: 12,
      children: []
    }
  },
  {
    type: 'select',
    label: 'Select',
    group: 'Choices',
    icon: 'fluent:multiselect-ltr-24-regular',
    defaults: {
      label: 'Select',
      placeholder: 'Choose an option',
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' }
      ]
    }
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    group: 'Choices',
    icon: 'fluent:checkbox-checked-24-regular',
    defaults: {
      label: 'Checkbox',
      defaultValue: false
    }
  },
  {
    type: 'toggle',
    label: 'Toggle',
    group: 'Choices',
    icon: 'fluent:toggle-right-24-regular',
    defaults: {
      label: 'Toggle',
      defaultValue: false
    }
  },
  {
    type: 'date',
    label: 'Date',
    group: 'Date and time',
    icon: 'fluent:calendar-ltr-24-regular',
    defaults: {
      label: 'Date',
      placeholder: 'Select date'
    }
  },
  {
    type: 'currency',
    label: 'Currency',
    group: 'Finance',
    icon: 'fluent:money-24-regular',
    defaults: {
      label: 'Amount',
      placeholder: '0.00'
    }
  }
];

export const DEFAULT_FORM_BUILDER_ITEMS: FormBuilderItemDefinition[] = [
  {
    type: 'section',
    label: 'Section',
    kind: 'layout',
    group: 'Layout',
    icon: 'fluent:folder-24-regular',
    description: 'Top-level layout container.',
    acceptsChildren: true
  },
  ...DEFAULT_FORM_BUILDER_FIELDS
];

export function validatorsFromRules(rules: FormBuilderValidationRule[] = [], field?: FormBuilderField) {
  const validators = [];

  if (field?.required || rules.some(rule => rule.type === 'required')) {
    validators.push(Validators.required);
  }

  for (const rule of rules) {
    if (rule.type === 'email') {
      validators.push(Validators.email);
    } else if (rule.type === 'minLength') {
      validators.push(Validators.minLength(Number(rule.value)));
    } else if (rule.type === 'maxLength') {
      validators.push(Validators.maxLength(Number(rule.value)));
    } else if (rule.type === 'min') {
      validators.push(Validators.min(Number(rule.value)));
    } else if (rule.type === 'max') {
      validators.push(Validators.max(Number(rule.value)));
    }
  }

  return validators;
}
