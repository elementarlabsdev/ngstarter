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
      description: 'Unique identifier for the checkbox input.',
      type: 'string',
      default: 'ngs-checkbox-n'
    },
    {
      name: 'name',
      description: 'Name value will be applied to the input element.',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'value',
      description: 'The value attribute of the native input element.',
      type: 'string',
      default: "''"
    },
    {
      name: 'checked',
      description: 'Whether the checkbox is checked.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the checkbox is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'indeterminate',
      description: 'Whether the checkbox is indeterminate.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'required',
      description: 'Whether the checkbox is required.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'labelPosition',
      description: 'Whether the label should appear after or before the checkbox. Defaults to after.',
      type: "'before' | 'after'",
      default: 'after'
    },
    {
      name: 'color',
      description: 'Theme color palette for the component.',
      type: 'string | undefined',
      default: 'undefined'
    },
    {
      name: 'disableRipple',
      description: 'Whether ripples are disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabledInteractive',
      description: 'Whether the checkbox should remain interactive when disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'tabIndex',
      description: 'Tabindex for the checkbox.',
      type: 'number',
      default: '0'
    },
    {
      name: 'aria-label',
      description: 'Attached to the aria-label attribute of the host element.',
      type: 'string',
      default: "''"
    },
    {
      name: 'aria-labelledby',
      description: 'Attached to the aria-labelledby attribute of the host element.',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'aria-describedby',
      description: 'Attached to the aria-describedby attribute of the host element.',
      type: 'string',
      default: "''"
    }
  ];

  events = [
    {
      name: 'change',
      description: 'Event emitted when the checkbox\'s `checked` value changes.'
    },
    {
      name: 'indeterminateChange',
      description: 'Event emitted when the checkbox\'s `indeterminate` value changes.'
    }
  ];
}
