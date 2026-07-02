import { EnvironmentProviders, InjectionToken, Provider, makeEnvironmentProviders } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';
import {
  FormBuilderCalculationEngine,
  FormBuilderField,
  FormBuilderFieldDefinition,
  FormBuilderItemDefinition,
  FormBuilderSelectDataSourceDefinition,
  FormBuilderSchema,
  FormBuilderSettingsDefinition,
  FormBuilderUploadCallback,
  FormBuilderValidationRule,
  FormBuilderValidatorDefinition
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

export const FORM_BUILDER_VALIDATORS =
  new InjectionToken<FormBuilderValidatorDefinition[]>('FORM_BUILDER_VALIDATORS');

export const FORM_BUILDER_CALCULATION_ENGINE =
  new InjectionToken<FormBuilderCalculationEngine>('FORM_BUILDER_CALCULATION_ENGINE');

export function formBuilderField(definition: FormBuilderFieldDefinition): FormBuilderFieldDefinition {
  return definition;
}

export function formBuilderItem(definition: FormBuilderItemDefinition): FormBuilderItemDefinition {
  return definition;
}

export function formBuilderSettings(definition: FormBuilderSettingsDefinition): FormBuilderSettingsDefinition {
  return definition;
}

export function formBuilderValidator(definition: FormBuilderValidatorDefinition): FormBuilderValidatorDefinition {
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

export function provideFormBuilderValidator(definition: FormBuilderValidatorDefinition): Provider {
  return {
    provide: FORM_BUILDER_VALIDATORS,
    useValue: definition,
    multi: true
  };
}

export function provideFormBuilderValidators(definitions: FormBuilderValidatorDefinition[]): Provider[] {
  return definitions.map(definition => provideFormBuilderValidator(definition));
}

export function provideFormBuilder(config: {
  items?: FormBuilderItemDefinition[];
  fields?: FormBuilderFieldDefinition[];
  settings?: FormBuilderSettingsDefinition[];
  selectDataSources?: FormBuilderSelectDataSourceDefinition[];
  validators?: FormBuilderValidatorDefinition[];
  calculationEngine?: FormBuilderCalculationEngine;
  uploadCallback?: FormBuilderUploadCallback;
} = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config.uploadCallback ? [{
      provide: FORM_BUILDER_UPLOAD_CALLBACK,
      useValue: config.uploadCallback
    }] : []),
    ...(config.calculationEngine ? [{
      provide: FORM_BUILDER_CALCULATION_ENGINE,
      useValue: config.calculationEngine
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
    })),
    ...(config.validators ?? []).map(validator => ({
      provide: FORM_BUILDER_VALIDATORS,
      useValue: validator,
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

const CALCULATED_VALUE_TYPE_OPTIONS = [
  { label: 'Automatic', value: 'auto' },
  { label: 'Number', value: 'number' },
  { label: 'Text', value: 'text' },
  { label: 'Boolean', value: 'boolean' }
];

const COLOR_PICKER_RESULT_FORMAT_OPTIONS = [
  { label: 'RGB', value: 'rgb' },
  { label: 'HEX', value: 'hex' },
  { label: 'HSL', value: 'hsl' },
  { label: 'HSV', value: 'hsv' }
];

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

const CALCULATED_SETTINGS_SCHEMA: FormBuilderSchema = {
  sections: [
    {
      id: 'calculated-settings',
      title: 'Calculation',
      fields: [
        {
          id: 'calculated-expression',
          name: 'settings.expression',
          type: 'textarea',
          label: 'Expression',
          placeholder: 'price * quantity',
          hint: 'Use field IDs and Excel-style functions, for example ROUND(price * quantity, 2).'
        },
        {
          id: 'calculated-value-type',
          name: 'settings.valueType',
          type: 'select',
          label: 'Value type',
          defaultValue: 'auto',
          options: CALCULATED_VALUE_TYPE_OPTIONS
        },
        {
          id: 'calculated-precision',
          name: 'settings.precision',
          type: 'number',
          label: 'Decimal places',
          defaultValue: null,
          hint: 'Optional rounding for numeric results.'
        },
        {
          id: 'calculated-empty-value',
          name: 'settings.emptyValue',
          type: 'text',
          label: 'Empty value',
          defaultValue: ''
        }
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
    type: 'calculated',
    label: 'Calculated',
    group: 'Basic',
    icon: 'fluent:calculator-24-regular',
    description: 'Readonly field calculated from an Excel-style expression.',
    defaults: {
      label: 'Calculated value',
      placeholder: 'Calculated automatically',
      readonly: true,
      settings: {
        expression: '',
        valueType: 'auto',
        emptyValue: ''
      }
    },
    settings: {
      extends: 'field',
      schema: CALCULATED_SETTINGS_SCHEMA
    }
  },
  {
    type: 'plain-text',
    label: 'Plain Text',
    kind: 'static',
    group: 'Layout',
    icon: 'fluent:text-description-24-regular',
    description: 'Static text block with optional expression-based output.',
    defaults: {
      kind: 'static',
      label: 'Plain Text',
      width: 12,
      settings: {
        text: 'Plain text',
        expression: false,
        expressions: []
      }
    },
    settings: () => import('./settings/plain-text-settings/plain-text-settings')
      .then(m => m.PlainTextFormBuilderSettings)
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
    type: 'color-switcher',
    label: 'Color switcher',
    group: 'Choices',
    icon: 'fluent:color-24-regular',
    defaults: {
      label: 'Color',
      defaultValue: DEFAULT_COLOR_SWITCHER_COLORS[0],
      width: 12,
      settings: {
        colors: DEFAULT_COLOR_SWITCHER_COLORS
      }
    },
    settings: {
      extends: 'field',
      schema: {
        sections: [
          {
            id: 'color-switcher-settings',
            title: 'Colors',
            fields: [
              {
                id: 'color-switcher-colors',
                name: 'settings.colors',
                type: 'textarea',
                label: 'Colors',
                hint: 'One color per line. Use HEX, RGB, HSL, or named CSS colors.',
                settings: {
                  valueAdapter: 'stringList'
                }
              },
              {
                id: 'color-switcher-default-value',
                name: 'defaultValue',
                type: 'text',
                label: 'Default color',
                defaultValue: DEFAULT_COLOR_SWITCHER_COLORS[0]
              }
            ]
          }
        ]
      }
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
    type: 'color-picker',
    label: 'Color picker',
    group: 'Advanced',
    icon: 'fluent:color-24-regular',
    defaults: {
      label: 'Color',
      defaultValue: '#35d1b3',
      width: 12,
      settings: {
        resultFormat: 'hex',
        showOpacity: false
      }
    },
    settings: {
      extends: 'field',
      schema: {
        sections: [
          {
            id: 'color-picker-settings',
            title: 'Color picker',
            fields: [
              {
                id: 'color-picker-result-format',
                name: 'settings.resultFormat',
                type: 'select',
                label: 'Result format',
                defaultValue: 'hex',
                options: COLOR_PICKER_RESULT_FORMAT_OPTIONS
              },
              {
                id: 'color-picker-show-opacity',
                name: 'settings.showOpacity',
                type: 'toggle',
                label: 'Show opacity',
                defaultValue: false
              },
              {
                id: 'color-picker-default-value',
                name: 'defaultValue',
                type: 'text',
                label: 'Default color',
                defaultValue: '#35d1b3'
              }
            ]
          }
        ]
      }
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
    type: 'logo-upload',
    label: 'Logo upload',
    group: 'Files',
    icon: 'fluent:image-add-24-regular',
    defaults: {
      label: 'Logo Upload',
      placeholder: 'Logo Upload',
      width: 12,
      multiple: false,
      settings: {
        accept: 'image/png,image/svg+xml,image/jpeg,image/webp',
        allowedFormats: {
          svg: true,
          png: true,
          jpg: true,
          webp: true
        },
        maxFileSize: '5 MB',
        previewText: 'AI'
      }
    },
    settings: {
      extends: 'input-field',
      schema: {
        sections: [
          {
            id: 'logo-upload-settings',
            title: 'Allowed formats',
            fields: [
              {
                id: 'logo-upload-format-svg',
                name: 'settings.allowedFormats.svg',
                type: 'checkbox',
                label: 'SVG',
                defaultValue: true
              },
              {
                id: 'logo-upload-format-png',
                name: 'settings.allowedFormats.png',
                type: 'checkbox',
                label: 'PNG',
                defaultValue: true
              },
              {
                id: 'logo-upload-format-jpg',
                name: 'settings.allowedFormats.jpg',
                type: 'checkbox',
                label: 'JPG',
                defaultValue: true
              },
              {
                id: 'logo-upload-format-webp',
                name: 'settings.allowedFormats.webp',
                type: 'checkbox',
                label: 'WEBP',
                defaultValue: true
              },
              {
                id: 'logo-upload-max-file-size',
                name: 'settings.maxFileSize',
                type: 'text',
                label: 'Max file size',
                defaultValue: '5 MB'
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

export const DEFAULT_FORM_BUILDER_VALIDATORS: FormBuilderValidatorDefinition[] = [
  formBuilderValidator({
    type: 'required',
    label: 'Required',
    description: 'Requires a non-empty value.',
    defaultMessage: 'This field is required.',
    validator: () => Validators.required
  }),
  formBuilderValidator({
    type: 'requiredTrue',
    label: 'Required true',
    description: 'Requires the value to be true.',
    errorKey: 'required',
    defaultMessage: 'This field must be checked.',
    validator: () => Validators.requiredTrue
  }),
  formBuilderValidator({
    type: 'email',
    label: 'Email',
    description: 'Requires a valid email address.',
    defaultMessage: 'Enter a valid email address.',
    validator: () => Validators.email
  }),
  formBuilderValidator({
    type: 'minLength',
    label: 'Minimum length',
    description: 'Requires at least the configured number of characters.',
    errorKey: 'minlength',
    valueType: 'number',
    valueLabel: 'Characters',
    valuePlaceholder: '3',
    requiresValue: true,
    defaultValue: 3,
    defaultMessage: 'Enter at least {value} characters.',
    validator: rule => Validators.minLength(Number(rule.value))
  }),
  formBuilderValidator({
    type: 'maxLength',
    label: 'Maximum length',
    description: 'Requires no more than the configured number of characters.',
    errorKey: 'maxlength',
    valueType: 'number',
    valueLabel: 'Characters',
    valuePlaceholder: '120',
    requiresValue: true,
    defaultValue: 120,
    defaultMessage: 'Enter no more than {value} characters.',
    validator: rule => Validators.maxLength(Number(rule.value))
  }),
  formBuilderValidator({
    type: 'min',
    label: 'Minimum value',
    description: 'Requires a numeric value greater than or equal to the configured value.',
    valueType: 'number',
    valueLabel: 'Value',
    valuePlaceholder: '0',
    requiresValue: true,
    defaultValue: 0,
    defaultMessage: 'Enter a value greater than or equal to {value}.',
    validator: rule => Validators.min(Number(rule.value))
  }),
  formBuilderValidator({
    type: 'max',
    label: 'Maximum value',
    description: 'Requires a numeric value less than or equal to the configured value.',
    valueType: 'number',
    valueLabel: 'Value',
    valuePlaceholder: '100',
    requiresValue: true,
    defaultValue: 100,
    defaultMessage: 'Enter a value less than or equal to {value}.',
    validator: rule => Validators.max(Number(rule.value))
  }),
  formBuilderValidator({
    type: 'pattern',
    label: 'Pattern',
    description: 'Requires the value to match the configured regular expression.',
    valueType: 'pattern',
    valueLabel: 'Regular expression',
    valuePlaceholder: '^[a-z0-9_]+$',
    requiresValue: true,
    defaultValue: '',
    defaultMessage: 'Enter a value that matches the required format.',
    validator: rule => Validators.pattern(String(rule.value ?? ''))
  }),
  formBuilderValidator({
    type: 'mimeType',
    label: 'MIME type',
    description: 'Requires uploaded file MIME types to match the configured list.',
    valueType: 'text',
    valueLabel: 'Allowed MIME types',
    valuePlaceholder: 'Search MIME type',
    requiresValue: true,
    defaultMessage: 'Use one of these file types: {value}.',
    validator: rule => {
      const allowedTypes = parseCommaList(rule.value);

      return control => {
        if (!allowedTypes.length) {
          return null;
        }

        const files = valueToFileLikeArray(control.value);
        const invalidFile = files.find(file => file.type && !allowedTypes.includes(file.type.toLowerCase()));

        return invalidFile
          ? {
              mimeType: {
                allowed: allowedTypes,
                actual: invalidFile.type
              }
            }
          : null;
      };
    }
  }),
  formBuilderValidator({
    type: 'fileMaxSize',
    label: 'Maximum file size',
    description: 'Requires uploaded files to stay below the configured size.',
    valueType: 'text',
    valueLabel: 'File size',
    valuePlaceholder: '5 MB',
    requiresValue: true,
    defaultValue: '5 MB',
    defaultMessage: 'File must be {value} or smaller.',
    validator: rule => {
      const maxBytes = parseFileSize(rule.value);

      return control => {
        if (!maxBytes) {
          return null;
        }

        const files = valueToFileLikeArray(control.value);
        const invalidFile = files.find(file => typeof file.size === 'number' && file.size > maxBytes);

        return invalidFile
          ? {
              fileMaxSize: {
                maxBytes,
                actualBytes: invalidFile.size
              }
            }
          : null;
      };
    }
  }),
  formBuilderValidator({
    type: 'imageDimensions',
    label: 'Image dimensions',
    description: 'Requires uploaded images to fit within the configured width and height.',
    valueType: 'text',
    valueLabel: 'Max width x height',
    valuePlaceholder: '512x512',
    requiresValue: true,
    defaultValue: '512x512',
    defaultMessage: 'Image must fit within {value}px.',
    async: true,
    validator: rule => {
      const dimensions = parseImageDimensions(rule.value);

      return async control => {
        if (!dimensions) {
          return null;
        }

        const files = valueToFileLikeArray(control.value);

        for (const file of files) {
          const imageDimensions = await readImageDimensions(file);

          if (!imageDimensions) {
            continue;
          }

          if (imageDimensions.width > dimensions.width || imageDimensions.height > dimensions.height) {
            return {
              imageDimensions: {
                maxWidth: dimensions.width,
                maxHeight: dimensions.height,
                actualWidth: imageDimensions.width,
                actualHeight: imageDimensions.height
              }
            };
          }
        }

        return null;
      };
    }
  })
];

export function mergeFormBuilderValidatorDefinitions(
  definitions: FormBuilderValidatorDefinition[] = []
): FormBuilderValidatorDefinition[] {
  return [
    ...DEFAULT_FORM_BUILDER_VALIDATORS,
    ...definitions
  ].reduce<FormBuilderValidatorDefinition[]>((merged, definition) => {
    const index = merged.findIndex(item => item.type === definition.type);

    if (index === -1) {
      merged.push(definition);
    } else {
      merged[index] = {
        ...merged[index],
        ...definition
      };
    }

    return merged;
  }, []);
}

export function validatorsFromRules(
  rules: FormBuilderValidationRule[] = [],
  field?: FormBuilderField,
  validatorDefinitions: FormBuilderValidatorDefinition[] = DEFAULT_FORM_BUILDER_VALIDATORS
): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  const definitions = mergeFormBuilderValidatorDefinitions(validatorDefinitions);

  if (field?.required || rules.some(rule => rule.type === 'required')) {
    validators.push(Validators.required);
  }

  for (const rule of rules) {
    const definition = definitions.find(item => item.type === rule.type);

    if (!definition || definition.async || (definition.requiresValue && isEmptyValidatorValue(rule.value))) {
      continue;
    }

    const validator = definition.validator(rule, field ?? createValidatorFieldFallback());

    if (Array.isArray(validator)) {
      validators.push(...(validator as ValidatorFn[]));
    } else if (validator) {
      validators.push(validator as ValidatorFn);
    }
  }

  return validators;
}

export function asyncValidatorsFromRules(
  rules: FormBuilderValidationRule[] = [],
  field?: FormBuilderField,
  validatorDefinitions: FormBuilderValidatorDefinition[] = DEFAULT_FORM_BUILDER_VALIDATORS
): AsyncValidatorFn[] {
  const validators: AsyncValidatorFn[] = [];
  const definitions = mergeFormBuilderValidatorDefinitions(validatorDefinitions);

  for (const rule of rules) {
    const definition = definitions.find(item => item.type === rule.type);

    if (!definition?.async || (definition.requiresValue && isEmptyValidatorValue(rule.value))) {
      continue;
    }

    const validator = definition.validator(rule, field ?? createValidatorFieldFallback());

    if (Array.isArray(validator)) {
      validators.push(...(validator as AsyncValidatorFn[]));
    } else if (validator) {
      validators.push(validator as AsyncValidatorFn);
    }
  }

  return validators;
}

function isEmptyValidatorValue(value: any): boolean {
  return value === undefined || value === null || value === '';
}

function createValidatorFieldFallback(): FormBuilderField {
  return {
    id: '',
    name: '',
    type: '',
    label: ''
  };
}

interface FileLikeValue {
  size?: number;
  type?: string;
  width?: number;
  height?: number;
  file?: File;
}

function valueToFileLikeArray(value: unknown): FileLikeValue[] {
  if (Array.isArray(value)) {
    return value.flatMap(item => valueToFileLikeArray(item));
  }

  if (!value) {
    return [];
  }

  if (isNativeFile(value)) {
    return [{
      file: value,
      size: value.size,
      type: value.type
    }];
  }

  if (!isRecord(value)) {
    return [];
  }

  const nestedFile = value['file'];

  if (isNativeFile(nestedFile)) {
    return [{
      file: nestedFile,
      size: nestedFile.size,
      type: nestedFile.type
    }];
  }

  return [{
    size: typeof value['size'] === 'number' ? value['size'] : undefined,
    type: normalizedString(value['type']) || normalizedString(value['mimeType']) || normalizedString(value['contentType']),
    width: typeof value['width'] === 'number' ? value['width'] : undefined,
    height: typeof value['height'] === 'number' ? value['height'] : undefined
  }];
}

function parseCommaList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap(item => normalizedString(item).split(/[\n,]/))
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseFileSize(value: unknown): number | null {
  if (typeof value === 'number') {
    return value > 0 ? value : null;
  }

  const text = normalizedString(value).replace(',', '.');

  if (!text) {
    return null;
  }

  const match = text.match(/^(\d+(?:\.\d+)?)\s*([kmgt]?b|[кмгт]?б)?$/i);

  if (!match) {
    return null;
  }

  const size = Number(match[1]);
  const unit = (match[2] || 'mb').toLowerCase();
  const multiplier = unit.startsWith('k') || unit.startsWith('к')
    ? 1024
    : unit.startsWith('m') || unit.startsWith('м')
      ? 1024 ** 2
      : unit.startsWith('g') || unit.startsWith('г')
        ? 1024 ** 3
        : unit.startsWith('t') || unit.startsWith('т')
          ? 1024 ** 4
          : 1;

  return Number.isFinite(size) && size > 0 ? size * multiplier : null;
}

function parseImageDimensions(value: unknown): { width: number; height: number } | null {
  if (isRecord(value) && typeof value['width'] === 'number' && typeof value['height'] === 'number') {
    return value['width'] > 0 && value['height'] > 0
      ? { width: value['width'], height: value['height'] }
      : null;
  }

  const text = normalizedString(value);
  const match = text.match(/^(\d+)\s*[x×]\s*(\d+)$/i);

  if (!match) {
    return null;
  }

  const width = Number(match[1]);
  const height = Number(match[2]);

  return width > 0 && height > 0 ? { width, height } : null;
}

async function readImageDimensions(value: FileLikeValue): Promise<{ width: number; height: number } | null> {
  if (typeof value.width === 'number' && typeof value.height === 'number') {
    return value.width > 0 && value.height > 0
      ? { width: value.width, height: value.height }
      : null;
  }

  if (!value.file || !value.file.type.startsWith('image/') || typeof Image === 'undefined' || typeof URL === 'undefined') {
    return null;
  }

  return new Promise(resolve => {
    const image = new Image();
    const url = URL.createObjectURL(value.file!);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

function normalizedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isNativeFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
