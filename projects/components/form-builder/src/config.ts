import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { Validators } from '@angular/forms';
import {
  FormBuilderField,
  FormBuilderFieldDefinition,
  FormBuilderItemDefinition,
  FormBuilderSettingsDefinition,
  FormBuilderUploadCallback,
  FormBuilderValidationRule
} from './types';

export const FORM_BUILDER_ITEMS =
  new InjectionToken<FormBuilderItemDefinition[]>('FORM_BUILDER_ITEMS');

export const FORM_BUILDER_FIELDS =
  new InjectionToken<FormBuilderFieldDefinition[]>('FORM_BUILDER_FIELDS');

export const FORM_BUILDER_SETTINGS =
  new InjectionToken<FormBuilderSettingsDefinition[]>('FORM_BUILDER_SETTINGS');

export const FORM_BUILDER_UPLOAD_CALLBACK =
  new InjectionToken<FormBuilderUploadCallback>('FORM_BUILDER_UPLOAD_CALLBACK');

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
  uploadCallback?: FormBuilderUploadCallback;
} = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config.uploadCallback ? [{
      provide: FORM_BUILDER_UPLOAD_CALLBACK,
      useValue: config.uploadCallback
    }] : []),
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
    type: 'spacer',
    label: 'Spacer',
    kind: 'static',
    group: 'Layout',
    icon: 'fluent:resize-large-24-regular',
    description: 'Static vertical space between form elements.',
    defaults: {
      kind: 'static',
      label: 'Spacer',
      width: 12,
      settings: {
        height: 24
      }
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
      clearable: true,
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' }
      ]
    }
  },
  {
    type: 'radio',
    label: 'Radio',
    group: 'Choices',
    icon: 'fluent:radio-button-24-regular',
    defaults: {
      label: 'Radio',
      settings: {
        orientation: 'vertical'
      },
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
    type: 'time',
    label: 'Time',
    group: 'Date and time',
    icon: 'fluent:clock-24-regular',
    defaults: {
      label: 'Time',
      placeholder: 'Select time'
    }
  },
  {
    type: 'date-range',
    label: 'Date range',
    group: 'Date and time',
    icon: 'fluent:calendar-date-24-regular',
    defaults: {
      label: 'Date range',
      placeholder: 'Start date',
      width: 12
    }
  },
  {
    type: 'upload',
    label: 'Upload',
    group: 'Files',
    icon: 'fluent:arrow-upload-24-regular',
    defaults: {
      label: 'Upload',
      placeholder: 'Drop files or click to upload',
      width: 12,
      multiple: false,
      settings: {
        accept: '*/*'
      }
    }
  },
  {
    type: 'timezone-select',
    label: 'Timezone select',
    group: 'Date and time',
    icon: 'fluent:globe-clock-24-regular',
    defaults: {
      label: 'Timezone',
      placeholder: 'Select timezone'
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
  },
  {
    type: 'currency-select',
    label: 'Currency select',
    group: 'Finance',
    icon: 'fluent:money-hand-24-regular',
    defaults: {
      label: 'Currency',
      placeholder: 'Select currency'
    }
  },
  {
    type: 'country-select',
    label: 'Country select',
    group: 'Location',
    icon: 'fluent:globe-location-24-regular',
    defaults: {
      label: 'Country',
      placeholder: 'Select country',
      clearable: true
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
