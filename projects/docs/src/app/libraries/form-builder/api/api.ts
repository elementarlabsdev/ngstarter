import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-form-builder-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss'
})
export class Api {
  readonly builderInputs = [
    {
      name: 'schema',
      description: 'Two-way model containing the form title, sections, and fields.',
      type: 'ModelSignal<FormBuilderSchema>',
      default: 'createDefaultFormBuilderSchema()'
    },
    {
      name: 'paletteTitle',
      description: 'Title shown above the field palette.',
      type: 'string',
      default: 'Fields'
    },
    {
      name: 'inspectorTitle',
      description: 'Title shown above the field settings inspector.',
      type: 'string',
      default: 'Field properties'
    },
    {
      name: 'uploadCallback',
      description: 'Optional upload handler used by upload fields. Overrides the global provider callback.',
      type: 'FormBuilderUploadCallback | null',
      default: 'undefined'
    }
  ];

  readonly builderEvents = [
    {
      name: 'fieldSelected',
      description: 'Emitted when a canvas field is selected.',
      type: 'FormBuilderFieldChange'
    },
    {
      name: 'fieldAdded',
      description: 'Emitted when a field is inserted from the palette.',
      type: 'FormBuilderFieldChange'
    },
    {
      name: 'fieldRemoved',
      description: 'Emitted when a field is deleted from the canvas.',
      type: 'FormBuilderFieldChange'
    }
  ];

  readonly rendererInputs = [
    {
      name: 'schema<sup>*</sup>',
      description: 'Saved builder schema to render as an Angular reactive form.',
      type: 'FormBuilderSchema',
      default: '–'
    },
    {
      name: 'value',
      description: 'Two-way model for runtime form values.',
      type: 'Record<string, any>',
      default: '{}'
    },
    {
      name: 'readonly',
      description: 'Disables all controls and hides the submit button when used with showSubmit.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showSubmit',
      description: 'Whether the renderer shows its built-in submit button.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'submitLabel',
      description: 'Text for the built-in submit button.',
      type: 'string',
      default: 'Submit'
    },
    {
      name: 'uploadCallback',
      description: 'Optional upload handler used by upload fields. Overrides the global provider callback.',
      type: 'FormBuilderUploadCallback | null',
      default: 'undefined'
    }
  ];

  readonly rendererEvents = [
    {
      name: 'formSubmit',
      description: 'Emitted with raw form value when the rendered form is valid and submitted.',
      type: 'Record<string, any>'
    },
    {
      name: 'formReady',
      description: 'Emitted after the renderer creates the FormGroup.',
      type: 'FormGroup'
    }
  ];

  readonly providers = [
    {
      name: 'provideFormBuilder',
      description: 'Environment provider for custom items, custom fields, settings components, and a global uploadCallback.',
      type: 'EnvironmentProviders'
    },
    {
      name: 'formBuilderItem',
      description: 'Helper for defining a palette item, including layout and static items, before passing it to provideFormBuilder.',
      type: 'FormBuilderItemDefinition'
    },
    {
      name: 'provideFormBuilderField',
      description: 'Provider helper for registering one custom field definition with FORM_BUILDER_FIELDS.',
      type: 'Provider'
    },
    {
      name: 'provideFormBuilderFields',
      description: 'Provider helper for registering multiple custom field definitions with FORM_BUILDER_FIELDS.',
      type: 'Provider[]'
    },
    {
      name: 'formBuilderField',
      description: 'Helper for defining a field type with defaults, lazy renderer, renderer-driven settings schema, inheritance, and validators.',
      type: 'FormBuilderFieldDefinition'
    },
    {
      name: 'formBuilderSettings',
      description: 'Legacy helper for registering a settings component for an existing field type. Prefer settings.schema on the field definition.',
      type: 'FormBuilderSettingsDefinition'
    }
  ];

  readonly injectionTokens = [
    {
      name: 'FORM_BUILDER_ITEMS',
      description: 'Multi provider token for layout, static, or field-like palette items.',
      type: 'InjectionToken<FormBuilderItemDefinition[]>'
    },
    {
      name: 'FORM_BUILDER_FIELDS',
      description: 'Multi provider token for concrete field definitions available in the palette and renderer.',
      type: 'InjectionToken<FormBuilderFieldDefinition[]>'
    },
    {
      name: 'FORM_BUILDER_SETTINGS',
      description: 'Multi provider token for legacy settings components keyed by field or item type.',
      type: 'InjectionToken<FormBuilderSettingsDefinition[]>'
    },
    {
      name: 'FORM_BUILDER_UPLOAD_CALLBACK',
      description: 'Global upload handler used when no component-level uploadCallback input is supplied.',
      type: 'InjectionToken<FormBuilderUploadCallback>'
    }
  ];

  readonly schemaProperties = [
    {
      name: 'title',
      description: 'Optional schema title for your own storage, previews, or surrounding UI.',
      type: 'string'
    },
    {
      name: 'fields',
      description: 'Optional top-level fields that are not inside a section. Layout order is controlled by layout when present.',
      type: 'FormBuilderField[]'
    },
    {
      name: 'layout',
      description: 'Optional ordered list of top-level field and section ids. Missing items are appended automatically by the builder and renderer.',
      type: 'FormBuilderLayoutItem[]'
    },
    {
      name: 'sections',
      description: 'Required list of sections. A schema may use an empty array when all fields live at the top level.',
      type: 'FormBuilderSection[]'
    }
  ];

  readonly fieldProperties = [
    { name: 'id', description: 'Stable unique id used by drag/drop layout and field selection.', type: 'string' },
    { name: 'name', description: 'Reactive form control name and saved value key.', type: 'string' },
    { name: 'type', description: 'Field type matched to a FormBuilderFieldDefinition.', type: 'string' },
    { name: 'kind', description: 'Optional item kind. Defaults to field; layout and static alter rendering and form control creation.', type: 'FormBuilderItemKind' },
    { name: 'label', description: 'Visible label used by the builder canvas, renderer, and default settings.', type: 'string' },
    { name: 'placeholder', description: 'Placeholder passed to input-like default renderers.', type: 'string' },
    { name: 'hint', description: 'Helper text shown by supported renderers.', type: 'string' },
    { name: 'defaultValue', description: 'Initial value used when the renderer creates a FormControl.', type: 'any' },
    { name: 'multiple', description: 'Enables multi-value behavior for select and upload-like fields.', type: 'boolean' },
    { name: 'clearable', description: 'Enables clear action for supported select-like controls.', type: 'boolean' },
    { name: 'required', description: 'Adds required validation and updates built-in settings state.', type: 'boolean' },
    { name: 'disabled', description: 'Creates the runtime control in a disabled state.', type: 'boolean' },
    { name: 'readonly', description: 'Marks the field readonly for renderers that support readonly display.', type: 'boolean' },
    { name: 'width', description: 'Grid width from 1 to 12 columns.', type: 'FormBuilderFieldWidth' },
    { name: 'options', description: 'Choice options for select, radio, and other option-based renderers.', type: 'FormBuilderOption[]' },
    { name: 'validation', description: 'Declarative validation rules used when no custom validators factory is supplied.', type: 'FormBuilderValidationRule[]' },
    { name: 'visibility', description: 'Visibility hints for form, email, PDF, and conditional rendering workflows.', type: 'FormBuilderVisibility' },
    { name: 'settings', description: 'Custom configuration bag for renderer-specific and settings-schema values.', type: 'Record<string, any>' },
    { name: 'children', description: 'Nested child fields for layout containers such as group and repeater.', type: 'FormBuilderField[]' }
  ];

  readonly definitionProperties = [
    { name: 'type', description: 'Unique palette and renderer type. Schema fields use the same value.', type: 'string' },
    { name: 'label', description: 'Palette label shown to users.', type: 'string' },
    { name: 'kind', description: 'Controls whether the item is a form field, layout item, or static block.', type: 'FormBuilderItemKind' },
    { name: 'group', description: 'Palette group name. Use Layout for layout items.', type: 'string' },
    { name: 'icon', description: 'Icon name shown in the palette.', type: 'string' },
    { name: 'description', description: 'Optional palette helper text.', type: 'string' },
    { name: 'defaults', description: 'Partial field data applied when the item is inserted into a schema.', type: 'Partial<FormBuilderField>' },
    { name: 'renderer', description: 'Lazy component importer for a custom runtime field renderer.', type: 'FormBuilderComponentImporter' },
    { name: 'settings', description: 'Settings component importer or schema-driven settings configuration.', type: 'FormBuilderComponentImporter | FormBuilderSettingsConfig' },
    { name: 'acceptsChildren', description: 'Allows nested fields in the builder canvas and renderer.', type: 'boolean' },
    { name: 'validators', description: 'Custom validator factory for fields of this type.', type: '(field: FormBuilderField) => ValidatorFn[]' }
  ];

  readonly settingsInheritance = [
    { name: 'field', description: 'Base settings for label, field id, hint, width, required, readonly, and disabled.', type: 'FormBuilderSettingsInheritance' },
    { name: 'input-field', description: 'Field settings plus placeholder for input-like controls.', type: 'FormBuilderSettingsInheritance' },
    { name: 'layout', description: 'Base layout settings for label, hint, and width.', type: 'FormBuilderSettingsInheritance' },
    { name: 'layout-container', description: 'Container layout settings for label and width.', type: 'FormBuilderSettingsInheritance' },
    { name: 'static', description: 'Static block settings for label and width.', type: 'FormBuilderSettingsInheritance' },
    { name: 'none', description: 'Use only the supplied settings schema.', type: 'FormBuilderSettingsInheritance' }
  ];
}
