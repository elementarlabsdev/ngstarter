import { EnvironmentProviders, InjectionToken, Provider, makeEnvironmentProviders } from '@angular/core';
import { Validators } from '@angular/forms';
import {
  FormBuilderField,
  FormBuilderFieldDefinition,
  FormBuilderItemDefinition,
  FormBuilderSelectDataSourceDefinition,
  FormBuilderSchema,
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

export const FORM_BUILDER_SELECT_DATA_SOURCES =
  new InjectionToken<FormBuilderSelectDataSourceDefinition[]>('FORM_BUILDER_SELECT_DATA_SOURCES');

export function formBuilderField(definition: FormBuilderFieldDefinition): FormBuilderFieldDefinition {
  return definition;
}

export function formBuilderItem(definition: FormBuilderItemDefinition): FormBuilderItemDefinition {
  return definition;
}

export function formBuilderSettings(definition: FormBuilderSettingsDefinition): FormBuilderSettingsDefinition {
  return definition;
}

export function provideFormBuilderField(definition: FormBuilderFieldDefinition): Provider {
  return {
    provide: FORM_BUILDER_FIELDS,
    useValue: definition,
    multi: true
  };
}

export function provideFormBuilderFields(definitions: FormBuilderFieldDefinition[]): Provider[] {
  return definitions.map(definition => provideFormBuilderField(definition));
}

export function provideFormBuilderSelectDataSource(definition: FormBuilderSelectDataSourceDefinition): Provider {
  return {
    provide: FORM_BUILDER_SELECT_DATA_SOURCES,
    useValue: definition,
    multi: true
  };
}

export function provideFormBuilderSelectDataSources(definitions: FormBuilderSelectDataSourceDefinition[]): Provider[] {
  return definitions.map(definition => provideFormBuilderSelectDataSource(definition));
}

export function provideFormBuilder(config: {
  items?: FormBuilderItemDefinition[];
  fields?: FormBuilderFieldDefinition[];
  settings?: FormBuilderSettingsDefinition[];
  selectDataSources?: FormBuilderSelectDataSourceDefinition[];
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
    })),
    ...(config.selectDataSources ?? []).map(dataSource => ({
      provide: FORM_BUILDER_SELECT_DATA_SOURCES,
      useValue: dataSource,
      multi: true
    }))
  ]);
}

const FIELD_WIDTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  .map(width => ({ label: `${width}/12`, value: width }));

const SPACER_HEIGHT_OPTIONS = [8, 16, 24, 32, 48, 64]
  .map(height => ({ label: `${height}px`, value: height }));

const ORIENTATION_OPTIONS = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
];

const SELECT_OPTIONS_SOURCE_OPTIONS = [
  { label: 'Custom options', value: 'static' },
  { label: 'Data source', value: 'dataSource' }
];

export const FORM_BUILDER_FIELD_BASE_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'field-base-settings',
      title: 'Field',
      fields: [
        { id: 'field-label', name: 'label', type: 'text', label: 'Label' },
        { id: 'field-name', name: 'name', type: 'text', label: 'Field ID' },
        { id: 'field-hint', name: 'hint', type: 'text', label: 'Hint' },
        { id: 'field-width', name: 'width', type: 'select', label: 'Width', defaultValue: 12, options: FIELD_WIDTH_OPTIONS },
        { id: 'field-required', name: 'required', type: 'toggle', label: 'Required field', defaultValue: false },
        { id: 'field-readonly', name: 'readonly', type: 'toggle', label: 'Readonly', defaultValue: false },
        { id: 'field-disabled', name: 'disabled', type: 'toggle', label: 'Disabled', defaultValue: false }
      ]
    }
  ]
};

export const FORM_BUILDER_INPUT_FIELD_BASE_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'input-field-base-settings',
      title: 'Field',
      fields: [
        { id: 'input-field-label', name: 'label', type: 'text', label: 'Label' },
        { id: 'input-field-name', name: 'name', type: 'text', label: 'Field ID' },
        { id: 'input-field-placeholder', name: 'placeholder', type: 'text', label: 'Placeholder' },
        { id: 'input-field-hint', name: 'hint', type: 'text', label: 'Hint' },
        { id: 'input-field-width', name: 'width', type: 'select', label: 'Width', defaultValue: 12, options: FIELD_WIDTH_OPTIONS },
        { id: 'input-field-required', name: 'required', type: 'toggle', label: 'Required field', defaultValue: false },
        { id: 'input-field-readonly', name: 'readonly', type: 'toggle', label: 'Readonly', defaultValue: false },
        { id: 'input-field-disabled', name: 'disabled', type: 'toggle', label: 'Disabled', defaultValue: false }
      ]
    }
  ]
};

export const FORM_BUILDER_LAYOUT_BASE_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'layout-base-settings',
      title: 'Layout',
      fields: [
        { id: 'layout-label', name: 'label', type: 'text', label: 'Label' },
        { id: 'layout-hint', name: 'hint', type: 'text', label: 'Hint' },
        { id: 'layout-width', name: 'width', type: 'select', label: 'Width', defaultValue: 12, options: FIELD_WIDTH_OPTIONS }
      ]
    }
  ]
};

export const FORM_BUILDER_LAYOUT_CONTAINER_BASE_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'layout-container-base-settings',
      title: 'Layout',
      fields: [
        { id: 'layout-container-label', name: 'label', type: 'text', label: 'Label' },
        { id: 'layout-container-width', name: 'width', type: 'select', label: 'Width', defaultValue: 12, options: FIELD_WIDTH_OPTIONS }
      ]
    }
  ]
};

export const FORM_BUILDER_STATIC_BASE_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'static-base-settings',
      title: 'Static block',
      fields: [
        { id: 'static-label', name: 'label', type: 'text', label: 'Label' },
        { id: 'static-width', name: 'width', type: 'select', label: 'Width', defaultValue: 12, options: FIELD_WIDTH_OPTIONS }
      ]
    }
  ]
};

export const FORM_BUILDER_SECTION_BASE_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'section-base-settings',
      title: 'Section',
      fields: [
        { id: 'section-title', name: 'title', type: 'text', label: 'Title' },
        { id: 'section-description', name: 'description', type: 'textarea', label: 'Description', hint: 'Optional helper text rendered under the section title.' },
        { id: 'section-collapsed', name: 'collapsed', type: 'toggle', label: 'Collapsed', defaultValue: false }
      ]
    }
  ]
};

const CHECKED_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'checked-settings',
      title: 'Default state',
      fields: [
        { id: 'default-checked', name: 'defaultValue', type: 'toggle', label: 'Checked', defaultValue: false }
      ]
    }
  ]
};

const OPTIONS_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'options-settings',
      title: 'Options',
      fields: [
        {
          id: 'options',
          name: 'options',
          type: 'textarea',
          label: 'Options',
          hint: 'One option per line. Use Label:value or Label:value:selected.',
          settings: {
            valueAdapter: 'optionsText'
          }
        }
      ]
    }
  ]
};

function selectSettingsSchema(field: FormBuilderField): FormBuilderSchema {
  const optionsSource = field.optionsSource ?? (field.dataSource ? 'dataSource' : 'static');
  const sourceSection = {
    id: 'select-options-source-settings',
    title: 'Options',
    fields: [
      {
        id: 'select-options-source',
        name: 'optionsSource',
        type: 'segmented',
        label: 'Options source',
        defaultValue: 'static',
        options: SELECT_OPTIONS_SOURCE_OPTIONS,
        settings: {
          valueAdapter: 'selectOptionsSource'
        }
      }
    ]
  };

  const dataSourceSection = {
    id: 'select-data-source-settings',
    title: 'Data source',
    fields: [
      {
        id: 'select-data-source',
        name: 'dataSource',
        type: 'select',
        label: 'Data source',
        hint: 'Choose a registered data source.',
        settings: {
          valueAdapter: 'selectDataSource'
        }
      }
    ]
  };

  return {
    sections: [
      sourceSection,
      ...(optionsSource === 'dataSource'
        ? [dataSourceSection]
        : OPTIONS_SETTINGS_SCHEMA.sections)
    ]
  };
}

const HIDDEN_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'hidden-settings',
      title: 'Hidden field',
      fields: [
        { id: 'hidden-label', name: 'label', type: 'text', label: 'Label' },
        { id: 'hidden-name', name: 'name', type: 'text', label: 'Field ID' },
        { id: 'hidden-default-value', name: 'defaultValue', type: 'text', label: 'Value' },
        { id: 'hidden-disabled', name: 'disabled', type: 'toggle', label: 'Disabled', defaultValue: false }
      ]
    }
  ]
};

export const DEFAULT_FORM_BUILDER_FIELDS: FormBuilderFieldDefinition[] = [
  {
    type: 'text',
    label: 'Text',
    group: 'Basic',
    icon: 'fluent:text-font-24-regular',
    defaults: {
      label: 'Text field',
      placeholder: 'Enter text'
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field'
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
    settings: {
      extends: 'input-field'
    },
    validators: field => field.required ? [Validators.required, Validators.email] : [Validators.email]
  },
  {
    type: 'hidden',
    label: 'Hidden',
    group: 'Basic',
    icon: 'fluent:eye-off-24-regular',
    description: 'Native hidden input included in submitted form values.',
    defaults: {
      label: 'Hidden field',
      defaultValue: ''
    },
    settings: {
      extends: 'none',
      schema: HIDDEN_SETTINGS_SCHEMA
    }
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'layout-container'
    }
  },
  {
    type: 'repeater',
    label: 'Repeater',
    kind: 'layout',
    group: 'Layout',
    icon: 'fluent:copy-add-24-regular',
    description: 'Repeat a group of nested fields as a FormArray.',
    acceptsChildren: true,
    defaults: {
      kind: 'layout',
      label: 'Repeater',
      name: 'items',
      width: 12,
      settings: {
        allowNullValue: false,
        emptyText: 'No items added yet.'
      },
      children: []
    },
    settings: {
      extends: 'layout-container',
      schema: {
        sections: [
          {
            id: 'repeater-settings',
            title: 'Repeater',
            fields: [
              {
                id: 'repeater-allow-null-value',
                name: 'settings.allowNullValue',
                type: 'toggle',
                label: 'Allow null value',
                defaultValue: false
              },
              {
                id: 'repeater-empty-text',
                name: 'settings.emptyText',
                type: 'textarea',
                label: 'Empty text',
                defaultValue: 'No items added yet.'
              }
            ]
          }
        ]
      }
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
    },
    settings: {
      extends: 'static',
      schema: {
        sections: [
          {
            id: 'spacer-settings',
            title: 'Spacer',
            fields: [
              { id: 'spacer-height', name: 'settings.height', type: 'select', label: 'Height', defaultValue: 24, options: SPACER_HEIGHT_OPTIONS }
            ]
          }
        ]
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
      optionsSource: 'static',
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' }
      ]
    },
    settings: {
      extends: 'input-field',
      schema: context => ({
        sections: [
          {
            id: 'select-behavior-settings',
            title: 'Select',
            fields: [
              {
                id: 'select-multiple',
                name: 'multiple',
                type: 'toggle',
                label: 'Multiple',
                defaultValue: false,
                settings: {
                  valueAdapter: 'selectMultiple'
                }
              },
              { id: 'select-clearable', name: 'clearable', type: 'toggle', label: 'Clearable', defaultValue: true }
            ]
          },
          ...selectSettingsSchema(context.item as FormBuilderField).sections
        ]
      })
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
    },
    settings: {
      extends: 'field',
      schema: {
        sections: [
          {
            id: 'radio-settings',
            title: 'Radio',
            fields: [
              { id: 'radio-orientation', name: 'settings.orientation', type: 'select', label: 'Orientation', defaultValue: 'vertical', options: ORIENTATION_OPTIONS }
            ]
          },
          ...OPTIONS_SETTINGS_SCHEMA.sections
        ]
      }
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
    },
    settings: {
      extends: 'field',
      schema: CHECKED_SETTINGS_SCHEMA
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
    },
    settings: {
      extends: 'field',
      schema: CHECKED_SETTINGS_SCHEMA
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field',
      schema: {
        sections: [
          {
            id: 'upload-settings',
            title: 'Upload',
            fields: [
              {
                id: 'upload-multiple',
                name: 'multiple',
                type: 'toggle',
                label: 'Multiple',
                defaultValue: false,
                settings: {
                  valueAdapter: 'multipleDefaultValue'
                }
              },
              {
                id: 'upload-accept',
                name: 'settings.accept',
                type: 'text',
                label: 'Accepted file types',
                defaultValue: '*/*',
                hint: 'Use MIME types separated by commas, for example image/*,application/pdf.'
              }
            ]
          }
        ]
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field'
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
    },
    settings: {
      extends: 'input-field',
      schema: {
        sections: [
          {
            id: 'country-select-settings',
            title: 'Country select',
            fields: [
              { id: 'country-clearable', name: 'clearable', type: 'toggle', label: 'Clearable', defaultValue: true }
            ]
          }
        ]
      }
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
    acceptsChildren: true,
    settings: {
      extends: 'none',
      schema: FORM_BUILDER_SECTION_BASE_SETTINGS_SCHEMA
    }
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
