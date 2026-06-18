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
      description: 'Environment provider for custom field definitions, legacy settings components, and a global uploadCallback.',
      type: 'EnvironmentProviders'
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
}
