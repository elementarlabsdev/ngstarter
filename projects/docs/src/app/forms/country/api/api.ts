import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-api',
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
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'id',
      description: 'Unique identifier for the country select component.',
      type: 'string',
      default: 'auto-generated'
    },
    {
      name: 'placeholder',
      description: 'The placeholder text for the input.',
      type: 'string',
      default: "''"
    },
    {
      name: 'value',
      description: 'Selected country code, or an array of country codes in multiple mode.',
      type: 'string | string[] | null',
      default: 'null'
    },
    {
      name: 'required',
      description: 'Whether the input is required.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the input is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'multiple',
      description: 'Whether the user can select multiple countries. The value is an array in multiple mode.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hideCheckIcon',
      description: 'Whether to hide the check icon for selected options.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'clearable',
      description: 'Whether to show a clear button when a value is selected.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'aria-label',
      description: 'Accessible label for the inner select.',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'tabIndex',
      description: 'Tab index for the country select.',
      type: 'number',
      default: '0'
    },
    {
      name: 'aria-describedby',
      description: 'Accessible description id for the inner select.',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'showCountryCode',
      description: 'Whether to show the country code in the trigger.',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'selectionChange',
      description: 'Event emitted when the selected value changes.'
    },
    {
      name: 'opened',
      description: 'Event emitted when the select panel is opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the select panel is closed.'
    }
  ];
}
